import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';


const app = express();

// Initialize MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Health check endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Express] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Prevent caching for API responses to protect privacy/compliance (GDPR, etc.)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

let instance: Razorpay | null = null;
try {
  if (key_id && key_secret) {
    instance = new Razorpay({ key_id, key_secret });
  } else {
    console.warn('Razorpay key_id or key_secret is missing. Razorpay instance not initialized.');
  }
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
}

app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    if (!instance) {
      return res.status(500).json({ error: 'razorpay_not_configured' });
    }
    const { amount, currency = 'INR', receipt, notes } = req.body || {};
    const order = await instance.orders.create({
      amount: Number(amount),
      currency,
      receipt: receipt || `GF-${Date.now()}`,
      notes: notes || {},
    });
    res.json({ id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt });
  } catch (e: any) {
    res.status(500).json({ error: 'create_order_failed' });
  }
});

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SMTP Transporter for official emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ghumofiroo.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER || 'noreply@ghumofiroo.com',
    pass: process.env.SMTP_PASS,
  },
});

async function findLeadByContact(email?: string, phone?: string): Promise<string | null> {
  if (!email && !phone) return null;
  
  if (email) {
    const { data } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('customer_email', email.trim())
      .limit(1);
    if (data && data[0]) return data[0].id;
  }
  
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      const last10 = cleanPhone.slice(-10);
      const { data } = await supabaseAdmin
        .from('leads')
        .select('id')
        .ilike('customer_phone', `%${last10}`)
        .limit(1);
      if (data && data[0]) return data[0].id;
    }
  }
  return null;
}

async function insertSupabasePayment(
  lead_id: string | null,
  amount_received: number,
  payment_mode: string,
  reference_number: string,
  remarks: string,
  gateway_charges: number
) {
  try {
    const id = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment_date = new Date().toISOString().split('T')[0];
    await pool.query(
      `INSERT INTO payments (id, lead_id, amount_received, payment_date, payment_mode, reference_number, remarks, status, received_by, gateway_charges)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, lead_id || null, amount_received, payment_date, payment_mode, reference_number, remarks, 'Success', 'Online Payment', gateway_charges]
    );
    if (lead_id) {
      await pool.query(
        `UPDATE leads SET status = 'Booking Confirmed' WHERE id = ?`,
        [lead_id]
      );
    }
    return true;
  } catch (err: any) {
    console.error('Error inserting payment to MySQL:', err);
    return false;
  }
}

async function sendPaymentReceiptEmail(
  toEmail: string,
  guestName: string,
  amount: number,
  paymentMode: string,
  referenceNumber: string,
  remarks: string
) {
  if (!toEmail) return;
  
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - Ghumo Firoo Travels</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #f59e0b; margin-bottom: 5px; }
        .header-title { font-size: 20px; margin: 0; font-weight: 600; color: #ffffff; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .receipt-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .receipt-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .total-amount { font-size: 18px; font-weight: 800; color: #10b981; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .support-info { margin-top: 10px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">GHUMO FIROO TRAVELS</div>
          <h1 class="header-title">Payment Confirmation</h1>
        </div>
        <div class="content">
          <div class="greeting">Dear ${guestName},</div>
          <p>Thank you for making your payment. We have successfully processed and received your transaction. Below are your payment details for your reference:</p>
          
          <div class="receipt-card">
            <div class="receipt-row">
              <span class="label">Client Name:</span>
              <span class="value">${guestName}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Payment Mode:</span>
              <span class="value">${paymentMode}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Reference ID:</span>
              <span class="value">${referenceNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Purpose:</span>
              <span class="value">${remarks}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Date:</span>
              <span class="value">${dateStr}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Amount Paid:</span>
              <span class="value total-amount">₹${amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <p>Your booking ledger has been automatically updated in our CRM system. Our travel planner will contact you shortly with the next steps.</p>
          <p>If you have any questions or require immediate assistance, please do not hesitate to contact us.</p>
        </div>
        <div class="footer">
          <div>This is an automated payment receipt. Please do not reply directly to this email.</div>
          <div class="support-info">
            Contact Support: info@ghumofiroo.com | +91-9910987264
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Ghumo Firoo Travels" <noreply@ghumofiroo.com>`,
      to: toEmail,
      subject: `Payment Receipt: ₹${amount.toLocaleString('en-IN')} received successfully`,
      html: emailHtml,
    });
    console.log(`Receipt email sent successfully to ${toEmail}`);
  } catch (err) {
    console.error('Error sending receipt email:', err);
  }
}

async function sendAdminNotificationEmail(
  guestName: string,
  amount: number,
  paymentMode: string,
  referenceNumber: string,
  remarks: string
) {
  const adminEmail = 'info@ghumofiroo.com';
  const emailHtml = `
    <h3>New Online Payment Received</h3>
    <p>A new payment has been completed via the Quick Payment Link portal.</p>
    <table border="1" cellpadding="6" style="border-collapse: collapse;">
      <tr><td><b>Guest Name</b></td><td>${guestName}</td></tr>
      <tr><td><b>Amount</b></td><td>₹${amount.toLocaleString('en-IN')}</td></tr>
      <tr><td><b>Payment Mode</b></td><td>${paymentMode}</td></tr>
      <tr><td><b>Reference ID</b></td><td>${referenceNumber}</td></tr>
      <tr><td><b>Purpose</b></td><td>${remarks}</td></tr>
      <tr><td><b>Date</b></td><td>${new Date().toLocaleString()}</td></tr>
    </table>
    <p>Check the CRM Payments Ledger at <a href="https://ghumofiroo.com/crm/payments">https://ghumofiroo.com/crm/payments</a>.</p>
  `;
  try {
    await transporter.sendMail({
      from: `"CRM Notifications" <noreply@ghumofiroo.com>`,
      to: adminEmail,
      subject: `[Payment Notification] ₹${amount} from ${guestName}`,
      html: emailHtml,
    });
  } catch (err) {
    console.error('Error sending admin notification email:', err);
  }
}

app.post('/api/razorpay/verify', async (req, res) => {
  try {
    if (!key_secret) {
      return res.status(500).json({ error: 'razorpay_not_configured' });
    }
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      lead_id,
      amount,
      remarks,
      email,
      phone,
      name
    } = req.body || {};
    
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', key_secret).update(payload).digest('hex');
    
    if (expectedSignature === razorpay_signature) {
      let finalLeadId = lead_id || '';
      if (!finalLeadId) {
        finalLeadId = await findLeadByContact(email, phone) || '';
      }
      
      const gateway_charges = (amount || 0) * 0.0236;
      
      await insertSupabasePayment(
        finalLeadId || null,
        amount || 0,
        'Razorpay',
        razorpay_payment_id,
        remarks || 'Quick Payment Link',
        gateway_charges
      );
      
      if (email) {
        await sendPaymentReceiptEmail(
          email,
          name || 'Guest',
          amount || 0,
          'Razorpay',
          razorpay_payment_id,
          remarks || 'Quick Payment Link'
        );
      }
      
      await sendAdminNotificationEmail(
        name || 'Guest',
        amount || 0,
        'Razorpay',
        razorpay_payment_id,
        remarks || 'Quick Payment Link'
      );
      
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (e: any) {
    console.error('Razorpay verification error:', e);
    res.status(500).json({ error: 'verification_failed' });
  }
});

const payuKey = process.env.PAYU_KEY || '';
const payuSalt = process.env.PAYU_SALT || '';
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'https://ghumofiroo.com';

app.post('/api/payu/generate-hash', (req, res) => {
  try {
    const { amount, productinfo, firstname, email, phone, lead_id, purpose } = req.body;
    const txnid = 'Txn' + Date.now() + Math.floor(Math.random() * 1000);
    
    const udf1 = lead_id || '';
    const udf2 = purpose || 'Quick Payment';
    const udf3 = email || '';
    const udf4 = phone || '';
    
    const hashString = `${payuKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|||||||${payuSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    res.json({
      key: payuKey,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      udf1,
      udf2,
      udf3,
      udf4,
      hash,
      surl: `${SERVER_BASE_URL}/api/payu/success`,
      furl: `${SERVER_BASE_URL}/api/payu/failure`
    });
  } catch (error) {
    console.error('PayU hash error:', error);
    res.status(500).json({ error: 'hash_generation_failed' });
  }
});

app.post('/api/payu/success', async (req, res) => {
  try {
    const {
      status,
      amount,
      txnid,
      firstname,
      email,
      phone,
      udf1, // lead_id
      udf2, // remarks
      udf3, // email
      udf4, // phone
      mode
    } = req.body || {};

    if (status === 'success') {
      let finalLeadId = udf1 || '';
      if (!finalLeadId) {
        finalLeadId = await findLeadByContact(udf3 || email, udf4 || phone) || '';
      }

      const gateway_charges = Number(amount || 0) * 0.0236;

      await insertSupabasePayment(
        finalLeadId || null,
        Number(amount || 0),
        `PayU (${mode || 'Online'})`,
        txnid,
        udf2 || 'Quick Payment Link',
        gateway_charges
      );

      const targetEmail = udf3 || email;
      if (targetEmail) {
        await sendPaymentReceiptEmail(
          targetEmail,
          firstname || 'Guest',
          Number(amount || 0),
          `PayU (${mode || 'Online'})`,
          txnid,
          udf2 || 'Quick Payment Link'
        );
      }

      await sendAdminNotificationEmail(
        firstname || 'Guest',
        Number(amount || 0),
        `PayU (${mode || 'Online'})`,
        txnid,
        udf2 || 'Quick Payment Link'
      );
    }
  } catch (err) {
    console.error('PayU success callback error:', err);
  }
  res.redirect(`${SERVER_BASE_URL}/thank-you?payment=success&gateway=payu`);
});

app.post('/api/payu/failure', (_req, res) => {
  res.redirect(`${SERVER_BASE_URL}/booking-failed?payment=failure&gateway=payu`);
});

// Debug endpoint to test payment database inserts & email receipts instantly
app.get('/api/debug/test-payment', async (req, res) => {
  try {
    const email = (req.query.email as string) || 'info@ghumofiroo.com';
    const leadId = (req.query.leadId as string) || 'lead_1782582592614_i760nvk2h';
    const amount = Number(req.query.amount) || 5000;
    const guestName = (req.query.name as string) || 'Navin Mishra';
    const remarks = (req.query.remarks as string) || 'Test Booking Advance';

    const gateway_charges = amount * 0.0236;
    const refId = 'TXN-TEST-' + Date.now();

    const success = await insertSupabasePayment(
      leadId,
      amount,
      'Test Gateway',
      refId,
      remarks,
      gateway_charges
    );

    await sendPaymentReceiptEmail(
      email,
      guestName,
      amount,
      'Test Gateway',
      refId,
      remarks
    );

    await sendAdminNotificationEmail(
      guestName,
      amount,
      'Test Gateway',
      refId,
      remarks
    );

    res.json({
      success,
      message: `Test payment of ₹${amount} recorded for lead ${leadId}. Receipt sent to ${email}`,
      transaction: {
        lead_id: leadId,
        amount,
        payment_mode: 'Test Gateway',
        reference_number: refId,
        remarks,
        gateway_charges
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- MySQL CRUD endpoints for local testing & development ---

// Helper to parse package JSON fields
function parsePackageRowLocal(pkg: any) {
  if (!pkg) return pkg;
  const jsonFields = ['images', 'category', 'destinations', 'highlights', 'inclusions', 'exclusions', 'itinerary', 'map_locations', 'flight_routes', 'virtual_tour', 'faqs', 'quick_facts'];
  jsonFields.forEach(field => {
    if (pkg[field] && typeof pkg[field] === 'string') {
      try {
        pkg[field] = JSON.parse(pkg[field]);
      } catch (e) {
        pkg[field] = [];
      }
    }
  });
  if (pkg.is_active !== undefined) {
    pkg.is_active = !!pkg.is_active;
  }
  return pkg;
}

// Helper to parse hotel JSON fields
function parseHotelRowLocal(h: any) {
  if (!h) return h;
  const jsonFields = ['photos', 'meal_plan_supported', 'gallery_urls', 'video_urls'];
  jsonFields.forEach(field => {
    if (h[field] && typeof h[field] === 'string') {
      try {
        h[field] = JSON.parse(h[field]);
      } catch (e) {
        h[field] = [];
      }
    }
  });
  if (h.active !== undefined) h.active = !!h.active;
  if (h.active_status !== undefined) h.active_status = !!h.active_status;
  return h;
}

// Helper to parse activity JSON fields
function parseActivityRowLocal(a: any) {
  if (!a) return a;
  const jsonFields = ['highlights', 'inclusions', 'exclusions'];
  jsonFields.forEach(field => {
    if (a[field] && typeof a[field] === 'string') {
      try {
        a[field] = JSON.parse(a[field]);
      } catch (e) {
        a[field] = [];
      }
    }
  });
  if (a.gst_included !== undefined) a.gst_included = !!a.gst_included;
  if (a.active_status !== undefined) a.active_status = !!a.active_status;
  return a;
}

// 1. Packages Routes
app.get('/api/packages', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM packages ORDER BY name ASC');
    res.json(rows.map(parsePackageRowLocal));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/packages/:id', async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let query = 'SELECT * FROM packages WHERE slug = ?';
    if (isUuid || idOrSlug.startsWith('pkg-')) {
      query = 'SELECT * FROM packages WHERE id = ?';
    }
    
    const [rows]: any = await pool.query(query, [idOrSlug]);
    if (rows.length > 0) {
      res.json(parsePackageRowLocal(rows[0]));
    } else {
      res.status(404).json({ error: 'Package not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/packages', async (req, res) => {
  try {
    const p = req.body;
    const newId = p.id || 'pkg-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    
    await pool.query(
      `INSERT INTO packages (
        id, name, price, slug, duration, image, images, category, rating, reviews,
        destinations, highlights, inclusions, exclusions, itinerary, map_locations,
        flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
        best_time, group_size, difficulty, quick_facts, package_type, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, p.name || '', p.price || 0, p.slug || '', p.duration || '', p.image || '',
        JSON.stringify(p.images || []), JSON.stringify(p.category || []), p.rating || 5.0, p.reviews || 0,
        JSON.stringify(p.destinations || []), JSON.stringify(p.highlights || []),
        JSON.stringify(p.inclusions || []), JSON.stringify(p.exclusions || []),
        JSON.stringify(p.itinerary || {}), JSON.stringify(p.map_locations || []),
        JSON.stringify(p.flight_routes || []), JSON.stringify(p.virtual_tour || {}),
        JSON.stringify(p.faqs || []), p.seo_title || '', p.seo_description || '', p.seo_keywords || '',
        p.best_time || '', p.group_size || '', p.difficulty || '', JSON.stringify(p.quick_facts || {}),
        p.package_type || '', p.is_active ? 1 : 0
      ]
    );
    res.json({ success: true, id: newId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body;
    await pool.query(
      `UPDATE packages SET
        name = ?, price = ?, slug = ?, duration = ?, image = ?, images = ?, category = ?,
        rating = ?, reviews = ?, destinations = ?, highlights = ?, inclusions = ?, exclusions = ?,
        itinerary = ?, map_locations = ?, flight_routes = ?, virtual_tour = ?, faqs = ?,
        seo_title = ?, seo_description = ?, seo_keywords = ?, best_time = ?, group_size = ?,
        difficulty = ?, quick_facts = ?, package_type = ?, is_active = ?
      WHERE id = ?`,
      [
        p.name || '', p.price || 0, p.slug || '', p.duration || '', p.image || '',
        JSON.stringify(p.images || []), JSON.stringify(p.category || []), p.rating || 5.0, p.reviews || 0,
        JSON.stringify(p.destinations || []), JSON.stringify(p.highlights || []),
        JSON.stringify(p.inclusions || []), JSON.stringify(p.exclusions || []),
        JSON.stringify(p.itinerary || {}), JSON.stringify(p.map_locations || []),
        JSON.stringify(p.flight_routes || []), JSON.stringify(p.virtual_tour || {}),
        JSON.stringify(p.faqs || []), p.seo_title || '', p.seo_description || '', p.seo_keywords || '',
        p.best_time || '', p.group_size || '', p.difficulty || '', JSON.stringify(p.quick_facts || {}),
        p.package_type || '', p.is_active ? 1 : 0, id
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM packages WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Hotels Routes
app.get('/api/hotels', async (req, res) => {
  try {
    // Local schema uses 'name'; remote staging uses 'hotel_name'. Support both.
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM hotels LIKE 'hotel_name'`);
    const nameCol = cols.length > 0 ? 'hotel_name' : 'name';
    const [rows]: any = await pool.query(`SELECT * FROM hotels ORDER BY \`${nameCol}\` ASC`);
    // Normalise: always expose hotel_name for frontend compatibility
    const normalised = rows.map((h: any) => {
      if (!h.hotel_name && h.name) h.hotel_name = h.name;
      if (!h.active_status && h.is_active !== undefined) h.active_status = !!h.is_active;
      return parseHotelRowLocal(h);
    });
    res.json(normalised);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows]: any = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(parseHotelRowLocal(rows[0]));
    } else {
      res.status(404).json({ error: 'Hotel not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function resolveCityId(cityName: string, stateName?: string): Promise<number | null> {
  if (!cityName) return null;
  const nameTrimmed = cityName.trim();
  try {
    const [rows]: any = await pool.query(
      "SELECT id FROM cities WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
      [nameTrimmed]
    );
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Resolve state ID
    let stateId = 27; // Default to Uttarakhand
    if (stateName) {
      const [stateRows]: any = await pool.query(
        "SELECT id FROM india_states WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
        [stateName.trim()]
      );
      if (stateRows.length > 0) {
        stateId = stateRows[0].id;
      } else {
        const [stateInsert]: any = await pool.query(
          "INSERT IGNORE INTO india_states (name, region) VALUES (?, 'North')",
          [stateName.trim()]
        );
        if (stateInsert.insertId) {
          stateId = stateInsert.insertId;
        } else {
          const [stateRows2]: any = await pool.query(
            "SELECT id FROM india_states WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
            [stateName.trim()]
          );
          if (stateRows2.length > 0) {
            stateId = stateRows2[0].id;
          }
        }
      }
    }

    // Insert into india_cities first
    const [cityInsert]: any = await pool.query(
      "INSERT INTO india_cities (state_id, name) VALUES (?, ?)",
      [stateId, nameTrimmed]
    );
    const newCityId = cityInsert.insertId;

    // Then insert into cities with the same ID
    await pool.query(
      "INSERT INTO cities (id, name, state, country, is_active) VALUES (?, ?, ?, 'India', 1)",
      [newCityId, nameTrimmed, stateName || null]
    );

    return newCityId;
  } catch (err) {
    console.error('resolveCityId error:', err);
    return null;
  }
}

app.post('/api/hotels', async (req, res) => {
  try {
    const h = req.body;
    const resolvedCityId = await resolveCityId(h.city, h.state);
    const newId = h.id || 'hotel-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    await pool.query(
      `INSERT INTO hotels (
        id, hotel_name, hotel_code, destination_group, city, state, country, star_rating, address,
        contact_number, email, photos, website, google_rating, internal_rating, supplier_name,
        active, country_id, state_id, city_id, category_id, contact_person, contact_email,
        check_in_time, check_out_time, meal_plan_supported, cancellation_policy, active_status,
        nearest_airport, nearest_railway, maps_location, gps_coordinates, child_policy,
        extra_bed_policy, logo_url, featured_image_url, gallery_urls, brochure_pdf_url, video_urls
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, h.hotel_name || '', h.hotel_code || '', h.destination_group || '', h.city || '', h.state || '', h.country || '',
        h.star_rating || 3, h.address || '', h.contact_number || '', h.email || '', JSON.stringify(h.photos || []),
        h.website || '', h.google_rating || 4.0, h.internal_rating || 4.0, h.supplier_name || '',
        h.active ? 1 : 0, h.country_id || null, h.state_id || null, resolvedCityId, h.category_id || null,
        h.contact_person || '', h.contact_email || '', h.check_in_time || '12:00', h.check_out_time || '11:00',
        JSON.stringify(h.meal_plan_supported || []), h.cancellation_policy || '', h.active_status ? 1 : 0,
        h.nearest_airport || '', h.nearest_railway || '', h.maps_location || '', h.gps_coordinates || '',
        h.child_policy || '', h.extra_bed_policy || '', h.logo_url || '', h.featured_image_url || '',
        JSON.stringify(h.gallery_urls || []), h.brochure_pdf_url || '', JSON.stringify(h.video_urls || [])
      ]
    );
    res.json({ success: true, id: newId });
  } catch (err: any) {
    console.error('POST /api/hotels error:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hotels/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const h = req.body;
    const resolvedCityId = await resolveCityId(h.city, h.state);
    await pool.query(
      `UPDATE hotels SET
        hotel_name = ?, hotel_code = ?, destination_group = ?, city = ?, state = ?, country = ?,
        star_rating = ?, address = ?, contact_number = ?, email = ?, photos = ?, website = ?,
        google_rating = ?, internal_rating = ?, supplier_name = ?, active = ?, country_id = ?,
        state_id = ?, city_id = ?, category_id = ?, contact_person = ?, contact_email = ?,
        check_in_time = ?, check_out_time = ?, meal_plan_supported = ?, cancellation_policy = ?,
        active_status = ?, nearest_airport = ?, nearest_railway = ?, maps_location = ?,
        gps_coordinates = ?, child_policy = ?, extra_bed_policy = ?, logo_url = ?,
        featured_image_url = ?, gallery_urls = ?, brochure_pdf_url = ?, video_urls = ?
      WHERE id = ?`,
      [
        h.hotel_name || '', h.hotel_code || '', h.destination_group || '', h.city || '', h.state || '', h.country || '',
        h.star_rating || 3, h.address || '', h.contact_number || '', h.email || '', JSON.stringify(h.photos || []),
        h.website || '', h.google_rating || 4.0, h.internal_rating || 4.0, h.supplier_name || '',
        h.active ? 1 : 0, h.country_id || null, h.state_id || null, resolvedCityId, h.category_id || null,
        h.contact_person || '', h.contact_email || '', h.check_in_time || '12:00', h.check_out_time || '11:00',
        JSON.stringify(h.meal_plan_supported || []), h.cancellation_policy || '', h.active_status ? 1 : 0,
        h.nearest_airport || '', h.nearest_railway || '', h.maps_location || '', h.gps_coordinates || '',
        h.child_policy || '', h.extra_bed_policy || '', h.logo_url || '', h.featured_image_url || '',
        JSON.stringify(h.gallery_urls || []), h.brochure_pdf_url || '', JSON.stringify(h.video_urls || []), id
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/hotels/:id error:', req.params.id, err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// 3. Activities Routes
app.get('/api/activities', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM activities ORDER BY activity_name ASC');
    res.json(rows.map(parseActivityRowLocal));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows]: any = await pool.query('SELECT * FROM activities WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(parseActivityRowLocal(rows[0]));
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const a = req.body;
    const newId = a.id || 'act-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    await pool.query(
      `INSERT INTO activities (
        id, activity_name, activity_code, country_id, state_id, destination, activity_category,
        duration, activity_type, supplier_name, supplier_cost, selling_cost, gst_included,
        gst_percentage, description, highlights, inclusions, exclusions, cancellation_policy,
        active_status, adult_cost, child_cost, image_url, sub_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, a.activity_name || '', a.activity_code || '', a.country_id || null, a.state_id || null,
        a.destination || '', a.activity_category || '', a.duration || '', a.activity_type || '', a.supplier_name || '',
        a.supplier_cost || 0, a.selling_cost || 0, a.gst_included ? 1 : 0, a.gst_percentage || 0,
        a.description || '', JSON.stringify(a.highlights || []), JSON.stringify(a.inclusions || []),
        JSON.stringify(a.exclusions || []), a.cancellation_policy || '', a.active_status ? 1 : 0,
        a.adult_cost || 0, a.child_cost || 0, a.image_url || '', a.sub_category || ''
      ]
    );
    res.json({ success: true, id: newId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const a = req.body;
    await pool.query(
      `UPDATE activities SET
        activity_name = ?, activity_code = ?, country_id = ?, state_id = ?, destination = ?,
        activity_category = ?, duration = ?, activity_type = ?, supplier_name = ?,
        supplier_cost = ?, selling_cost = ?, gst_included = ?, gst_percentage = ?,
        description = ?, highlights = ?, inclusions = ?, exclusions = ?, cancellation_policy = ?,
        active_status = ?, adult_cost = ?, child_cost = ?, image_url = ?, sub_category = ?
      WHERE id = ?`,
      [
        a.activity_name || '', a.activity_code || '', a.country_id || null, a.state_id || null,
        a.destination || '', a.activity_category || '', a.duration || '', a.activity_type || '', a.supplier_name || '',
        a.supplier_cost || 0, a.selling_cost || 0, a.gst_included ? 1 : 0, a.gst_percentage || 0,
        a.description || '', JSON.stringify(a.highlights || []), JSON.stringify(a.inclusions || []),
        JSON.stringify(a.exclusions || []), a.cancellation_policy || '', a.active_status ? 1 : 0,
        a.adult_cost || 0, a.child_cost || 0, a.image_url || '', a.sub_category || '', id
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM activities WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Hotel Images Routes
app.get('/api/hotel-images', async (req, res) => {
  try {
    const hotel_id = req.query.hotel_id;
    let query = 'SELECT * FROM hotel_images ORDER BY created_at DESC';
    let params: any[] = [];
    
    if (hotel_id) {
      query = 'SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY is_featured DESC, created_at ASC';
      params = [hotel_id];
    }
    
    const [rows]: any = await pool.query(query, params);
    res.json(rows.map((img: any) => {
      if (img.is_featured !== undefined) img.is_featured = !!img.is_featured;
      return img;
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hotel-images', async (req, res) => {
  try {
    const img = req.body;
    const newId = img.id || 'img-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    await pool.query(
      'INSERT INTO hotel_images (id, hotel_id, image_url, is_featured) VALUES (?, ?, ?, ?)',
      [newId, img.hotel_id || '', img.image_url || '', img.is_featured ? 1 : 0]
    );
    res.json({ success: true, id: newId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hotel-images', async (req, res) => {
  try {
    const id = req.query.id;
    const hotel_id = req.query.hotel_id;
    if (id) {
      await pool.query('DELETE FROM hotel_images WHERE id = ?', [id]);
    } else if (hotel_id) {
      await pool.query('DELETE FROM hotel_images WHERE hotel_id = ?', [hotel_id]);
    } else {
      return res.status(400).json({ error: 'Missing id or hotel_id query parameters' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Generic local MySQL CRUD routes for secondary tables ---
//
// SECURITY: Only tables explicitly listed here may be accessed via the
// wildcard routes below.  Any :tableName not in this set receives 403.
//
// Audit source: every fetch('/api/<name>') call in src/ that is NOT
// handled by a dedicated named Express route above was traced to a
// MySQL table and added here.
//
// Named-route tables (packages, hotels, activities, blogs, blog-categories,
// hotel-images, payments, documents, reports, payu, upi, razorpay, upload,
// send-travel-enquiry) are served by specific handlers and do NOT appear
// in this list — they would never reach the wildcard anyway.
//
const ALLOWED_TABLES: ReadonlyArray<string> = [
  // HotelContractWizard.tsx, HotelContracting.tsx
  'destinations',        // fetch('/api/destinations')
  'hotel_suppliers',     // fetch('/api/hotel-suppliers')
  'room_categories',     // fetch('/api/room-categories')
  // SightseeingMaster.tsx, ItineraryBuilder.tsx
  'sightseeings',        // fetch('/api/sightseeings')
  // VisaMaster.tsx
  'visas',               // fetch('/api/visas')
  // CabContracting.tsx, CabContractWizard.tsx, ItineraryBuilder.tsx
  'cab_suppliers',       // fetch('/api/cab-suppliers')
  'cab_vehicles',        // fetch('/api/cab-vehicles')
  'cab_routes',          // fetch('/api/cab-routes')
  'cab_contracts',       // fetch('/api/cab-contracts')  ← was missing before
  'cab_contract_rates',  // fetch('/api/cab-contract-rates')
  // CRM.tsx (lead documents & payments via generic route)
  'payments',            // fetch('/api/payments') — also has dedicated route
  'documents',           // fetch('/api/documents') — also has dedicated route
  'cities',              // fetch('/api/cities')
] as const;

// Keep legacy alias so nothing else in this file needs changing
const allowedLocalTables: ReadonlyArray<string> = ALLOWED_TABLES;

const localJsonFields: Record<string, string[]> = {
  destinations: ['sub_destinations', 'popular_activities'],
  sightseeings: ['highlights', 'inclusions', 'exclusions'],
  visas: ['required_documents'],
  cab_vehicles: ['vehicle_images'],
  cab_contract_rates: ['tax_audit_logs'],
  hotels: ['photos', 'gallery_urls', 'video_urls', 'meal_plan_supported'],
  room_categories: ['facilities', 'room_images'],
  activities: ['highlights', 'inclusions', 'exclusions'],
  cab_vendors: [],
  cab_routes: [],
  cab_contracts: []
};

function parseGenericRowLocal(row: any, tableName: string) {
  if (!row) return row;
  const jsonFields = localJsonFields[tableName];
  if (jsonFields) {
    jsonFields.forEach(field => {
      if (row[field] && typeof row[field] === 'string') {
        try {
          row[field] = JSON.parse(row[field]);
        } catch (e) {
          row[field] = [];
        }
      }
    });
  }
  
  // Cast types
  const booleanFields = ['active_status', 'active', 'gst_included', 'is_half_day', 'is_full_day', 'vehicle_required', 'is_tax_overridden'];
  booleanFields.forEach(field => {
    if (row[field] !== undefined) {
      row[field] = !!row[field];
    }
  });
  
  return row;
}

// Serve uploaded document files from local disk with correct headers (fixing both new and old uploads)
app.get('/api/uploads/:fileName', async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  try {
    // Lookup original document in database to set correct headers
    const [rows]: any = await pool.query(
      `SELECT name, type FROM documents WHERE file_url = ? LIMIT 1`,
      [`/api/uploads/${fileName}`]
    );

    if (rows && rows.length > 0) {
      const doc = rows[0];
      const ext = doc.type.toLowerCase();
      
      let downloadName = doc.name;
      if (!downloadName.toLowerCase().endsWith(`.${ext}`)) {
        downloadName = `${downloadName}.${ext}`;
      }

      // Set headers for download naming
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(downloadName)}"`);

      // Map document types to correct MIME types
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        csv: 'text/csv'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
    }
  } catch (err) {
    console.error('Error serving file with correct headers:', err);
  }

  res.sendFile(filePath);
});

// Specific endpoint for uploading documents
app.post('/api/documents/upload', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { lead_id, name, type, size, uploaded_by, file_base64 } = req.body;
    if (!lead_id || !name || !type || !size || !uploaded_by || !file_base64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean up base64 prefix if present
    const base64Data = file_base64.replace(/^data:.*;base64,/, "");
    
    // Save file to disk
    const fileExt = type.toLowerCase();
    const fileSuffix = name.toLowerCase().endsWith(`.${fileExt}`) ? '' : `.${fileExt}`;
    const fileName = `${Date.now()}-${name}${fileSuffix}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Create unique ID
    const newId = `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const fileUrl = `/api/uploads/${fileName}`;

    // Insert into MySQL documents table
    await pool.query(
      `INSERT INTO documents (id, lead_id, name, type, size, uploaded_by, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, lead_id, name, type, size, uploaded_by, fileUrl]
    );

    res.json({ success: true, id: newId, file_url: fileUrl });
  } catch (err: any) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: err.message });
  }
});



function getBrochureBanner(destination: string): string {
  const d = (destination || "").toLowerCase();
  if (d.indexOf("char dham") !== -1 || d.indexOf("chardham") !== -1 || d.indexOf("kedarnath") !== -1 || d.indexOf("badrinath") !== -1 || d.indexOf("yamunotri") !== -1 || d.indexOf("gangotri") !== -1) {
    return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
  } else if (d.indexOf("rann") !== -1 || d.indexOf("utsav") !== -1 || d.indexOf("kutch") !== -1) {
    return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
  } else if (d.indexOf("bali") !== -1) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("dubai") !== -1) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("europe") !== -1) {
    return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kashmir") !== -1) {
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("ladakh") !== -1 || d.indexOf("leh") !== -1) {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("goa") !== -1) {
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("georgia") !== -1) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kerala") !== -1) {
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("singapore") !== -1) {
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("thailand") !== -1) {
    return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("japan") !== -1) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("rajasthan") !== -1 || d.indexOf("jaisalmer") !== -1 || d.indexOf("jaipur") !== -1 || d.indexOf("udaipur") !== -1) {
    return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("turkey") !== -1) {
    return "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("himachal") !== -1 || d.indexOf("manali") !== -1 || d.indexOf("shimla") !== -1) {
    return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("mauritius") !== -1) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("seychelles") !== -1) {
    return "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("golden") !== -1 || d.indexOf("triangle") !== -1) {
    return "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";
  } else {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  }
}

app.post('/api/send-confirmation', async (req, res) => {
  try {
    const { email, name, packageTitle, type, bookingId } = req.body;
    
    const isBooking = type === 'booking';
    const subject = isBooking 
      ? `Booking Request Received: ${packageTitle} - Ghumo Firoo Travels` 
      : `Enquiry Received: ${packageTitle}`;

    const banner = getBrochureBanner(packageTitle);
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        <!-- LOGO -->
        <div style="background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;">
          <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" style="max-height: 64px; width: auto; display: inline-block;" />
        </div>

        <!-- HERO BANNER -->
        <img src="${banner}" alt="${packageTitle} Banner" style="width: 100%; height: 250px; object-fit: cover; display: block;" />

        <!-- BODY CONTENT -->
        <div style="padding: 28px 24px;">
          <h2 style="color: #ea580c; margin: 0 0 14px 0; font-size: 18px; font-weight: 700;">Hello ${name},</h2>
          
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
            Thank you for choosing <strong style="color:#ea580c;">Ghumo Firoo Travels</strong>!
            We are thrilled to assist you in planning your next escape. We are dedicated to crafting an exceptional travel experience customized just for you.
          </p>

          <!-- INQUIRY CARD -->
          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">📋 Details</p>

            <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Reference ID</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${bookingId || 'GF-' + Date.now()}</span>
            </div>
            <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Package Interest</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${packageTitle}</span>
            </div>
            <div style="padding: 10px 0; border-bottom: none; padding-bottom: 0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Status</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${isBooking ? 'Payment Pending' : 'Processing'}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
            ${isBooking 
              ? "Thank you for submitting your booking details. To finalize your reservation, please ensure you complete the payment using the options provided on our website. Once payment is verified, we will issue your travel vouchers."
              : "Thank you for your enquiry. Our travel experts are reviewing your request and will contact you within 24 hours with a customized itinerary."}
          </p>

          <!-- CTA BUTTON -->
          <div style="text-align: center; padding: 20px 0 10px 0;">
            <a href="https://ghumofiroo.com" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">✈️ View Details</a>
          </div>

          <p style="font-size: 14px; color: #475569; margin: 20px 0 0 0;">Warm regards,</p>
          <p style="font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0;">Ghumo Firoo Travels Team</p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">✦ Ghumo Firoo Travels ✦</p>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0;">Where Dreams Become Itineraries</p>
          <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8;">
            📞 <a href="tel:+919910987264" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">+91 99109 87264</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            📧 <a href="mailto:info@ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">info@ghumofiroo.com</a>
          </p>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
            🌐 <a href="https://ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;" target="_blank">www.ghumofiroo.com</a>
          </p>
          <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
          
          <!-- Social Media Section -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; margin-bottom: 15px;">
            <tr>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://www.facebook.com/ghumofirootravels" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">facebook.com</span>
                </a>
              </td>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">instagram.com</span>
                </a>
              </td>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://x.com/GhumoFiroo" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/twitterx.png" width="24" height="24" alt="Twitter/X" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">x.com</span>
                </a>
              </td>
            </tr>
          </table>

          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
            © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Ghumo Firoo Travels" <noreply@ghumofiroo.com>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`Email sent successfully to ${email} | Type: ${type}`);
    res.json({ success: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ error: 'email_failed' });
  }
});

app.post('/api/reviews/send-pending-requests', async (req, res) => {
  try {
    // Fetch pending review requests
    const { data, error } = await supabaseAdmin.rpc('send_pending_review_emails_fetch');
    if (error) {
      console.error('Error fetching pending review emails:', error);
      return res.status(500).json({ error: 'fetch_pending_failed' });
    }
    
    if (!data || data.length === 0) {
      return res.json({ success: true, count: 0, message: 'No pending review requests' });
    }
    
    const successfulIds: string[] = [];
    for (const itin of data) {
      try {
        const destName = itin.destinations && itin.destinations.length > 0 ? itin.destinations[0] : 'your recent trip';
        const reviewLink = `${SERVER_BASE_URL}/review/${itin.itinerary_code}`;
        const banner = getBrochureBanner(destName);
        
        const emailHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
            <!-- LOGO -->
            <div style="background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;">
              <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" style="max-height: 64px; width: auto; display: inline-block;" />
            </div>

            <!-- HERO BANNER -->
            <img src="${banner}" alt="${destName} Banner" style="width: 100%; height: 220px; object-fit: cover; display: block;" />

            <!-- BODY CONTENT -->
            <div style="padding: 28px 24px;">
              <h2 style="color: #ea580c; margin: 0 0 14px 0; font-size: 20px; font-weight: 700; text-align: center;">How was your trip with Ghumo Firoo Travels?</h2>
              
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Hello <strong>${itin.customer_name}</strong>,
              </p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Welcome back! We hope you had a fantastic and memorable time exploring <strong>${destName}</strong>. 
                Our team at Ghumo Firoo Travels strives to deliver the best travel experiences, and we would love to hear your feedback.
              </p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Could you take 2 minutes to rate your overall experience, hotels, transport, sightseeing, and planning? Your feedback helps us maintain high quality standards and assists other travelers in planning their dream holidays.
              </p>

              <!-- CTA BUTTON -->
              <div style="text-align: center; padding: 20px 0 10px 0;">
                <a href="${reviewLink}" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">⭐ Write A Review</a>
              </div>

              <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 15px;">
                If the button doesn't work, copy and paste this link in your browser:<br/>
                <a href="${reviewLink}" style="color: #ea580c; text-decoration: underline;">${reviewLink}</a>
              </p>

              <p style="font-size: 14px; color: #475569; margin: 20px 0 0 0;">Warm regards,</p>
              <p style="font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0;">Ghumo Firoo Travels Team</p>
            </div>

            <!-- FOOTER -->
            <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">✦ Ghumo Firoo Travels ✦</p>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0;">Where Dreams Become Itineraries</p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8;">
                📞 <a href="tel:+919910987264" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">+91 99109 87264</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                📧 <a href="mailto:info@ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">info@ghumofiroo.com</a>
              </p>
              <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
                🌐 <a href="https://ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;" target="_blank">www.ghumofiroo.com</a>
              </p>
              <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
                © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
              </div>
            </div>
          </div>
        `;
        
        await transporter.sendMail({
          from: `"Ghumo Firoo Travels" <noreply@ghumofiroo.com>`,
          to: itin.customer_email,
          subject: 'How was your trip with Ghumo Firoo Travels?',
          html: emailHtml,
        });
        
        successfulIds.push(itin.id);
        console.log(`Review email invitation sent successfully to ${itin.customer_email} for booking ${itin.itinerary_code}`);
      } catch (sendErr) {
        console.error(`Failed to send review email to ${itin.customer_email} for itinerary ${itin.id}:`, sendErr);
      }
    }
    
    if (successfulIds.length > 0) {
      const { error: updateErr } = await supabaseAdmin.rpc('mark_review_request_sent', { itin_ids: successfulIds });
      if (updateErr) {
        console.error('Error marking review request as sent in DB:', updateErr);
      }
    }
    
    res.json({ success: true, count: successfulIds.length, total: data.length });
  } catch (e) {
    console.error('Review email requests failed:', e);
    res.status(500).json({ error: 'send_requests_failed' });
  }
});

// Blog management REST API endpoints
app.get('/api/blogs', async (req, res) => {
  try {
    const { category, search, all } = req.query;
    let query = `
      SELECT b.*, c.name AS category, c.slug AS category_slug,
             (SELECT GROUP_CONCAT(tag) FROM blog_tags WHERE blog_id = b.id) AS tags_list
      FROM blogs b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (all !== 'true') {
      query += ` AND b.status = 'Published' AND (b.publish_date IS NULL OR b.publish_date <= NOW())`;
    }

    if (category && category !== 'All' && category !== 'all') {
      query += ` AND (c.name = ? OR c.slug = ?)`;
      params.push(category, category);
    }

    if (search) {
      query += ` AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)`;
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    query += ` ORDER BY b.date DESC, b.created_at DESC`;

    const [rows]: any = await pool.query(query, params);
    
    const blogs = rows.map((row: any) => ({
      ...row,
      tags: row.tags_list ? row.tags_list.split(',') : [],
      metaDescription: row.seo_description,
      imageTitle: row.image_title,
      imageAlt: row.image_alt,
      readTime: row.read_time,
      seoTitle: row.seo_title,
      seoKeywords: row.seo_keywords,
      canonicalUrl: row.canonical_url,
      schemaMarkup: row.schema_markup,
      relatedDestination: row.related_destination,
      relatedPackage: row.related_package,
      publishDate: row.publish_date
    }));

    res.json(blogs);
  } catch (err: any) {
    console.warn("MySQL Failed to fetch blogs, returning empty database list (fallback to static):", err.message);
    res.json([]);
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const query = `
      SELECT b.*, c.name AS category, c.slug AS category_slug,
             (SELECT GROUP_CONCAT(tag) FROM blog_tags WHERE blog_id = b.id) AS tags_list
      FROM blogs b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      WHERE b.slug = ?
    `;
    const [rows]: any = await pool.query(query, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'blog_not_found' });
    }

    const row = rows[0];
    const blog = {
      ...row,
      tags: row.tags_list ? row.tags_list.split(',') : [],
      metaDescription: row.seo_description,
      imageTitle: row.image_title,
      imageAlt: row.image_alt,
      readTime: row.read_time,
      seoTitle: row.seo_title,
      seoKeywords: row.seo_keywords,
      canonicalUrl: row.canonical_url,
      schemaMarkup: row.schema_markup,
      relatedDestination: row.related_destination,
      relatedPackage: row.related_package,
      publishDate: row.publish_date
    };

    res.json(blog);
  } catch (err: any) {
    console.error("Failed to fetch blog:", err);
    res.status(500).json({ error: 'fetch_blog_failed', details: err.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      id, title, slug, excerpt, content, category_id, author, date,
      image, image_url, image_title, image_alt, read_time, seo_title, seo_description,
      seo_keywords, canonical_url, schema_markup, related_destination,
      related_package, status, publish_date, tags
    } = req.body;

    const blogId = id || crypto.randomUUID();
    const finalImage = image || image_url || '';

    const insertBlogSql = `
      INSERT INTO blogs (
        id, title, slug, excerpt, content, category_id, author, date,
        image, image_title, image_alt, read_time, seo_title, seo_description,
        seo_keywords, canonical_url, schema_markup, related_destination,
        related_package, status, publish_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(insertBlogSql, [
      blogId, title, slug, excerpt, content, category_id, author, date,
      finalImage, image_title || null, image_alt || null, read_time || '10 min read', 
      seo_title || null, seo_description || null, seo_keywords || null, 
      canonical_url || null, schema_markup ? JSON.stringify(schema_markup) : null,
      related_destination || null, related_package || null, status || 'Draft', 
      publish_date ? new Date(publish_date) : null
    ]);

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const insertTagSql = `INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)`;
      for (const tag of tags) {
        if (tag.trim()) {
          await connection.query(insertTagSql, [blogId, tag.trim()]);
        }
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, id: blogId });
  } catch (err: any) {
    await connection.rollback();
    console.error("Failed to create blog:", err);
    res.status(500).json({ error: 'create_blog_failed', details: err.message });
  } finally {
    connection.release();
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      title, slug, excerpt, content, category_id, author, date,
      image, image_url, image_title, image_alt, read_time, seo_title, seo_description,
      seo_keywords, canonical_url, schema_markup, related_destination,
      related_package, status, publish_date, tags
    } = req.body;

    const finalImage = image || image_url || '';

    const updateBlogSql = `
      UPDATE blogs SET
        title = ?, slug = ?, excerpt = ?, content = ?, category_id = ?, author = ?, date = ?,
        image = ?, image_title = ?, image_alt = ?, read_time = ?, seo_title = ?, seo_description = ?,
        seo_keywords = ?, canonical_url = ?, schema_markup = ?, related_destination = ?,
        related_package = ?, status = ?, publish_date = ?
      WHERE id = ?
    `;

    await connection.query(updateBlogSql, [
      title, slug, excerpt, content, category_id, author, date,
      finalImage, image_title || null, image_alt || null, read_time, 
      seo_title || null, seo_description || null, seo_keywords || null, 
      canonical_url || null, schema_markup ? JSON.stringify(schema_markup) : null, 
      related_destination || null, related_package || null, status, 
      publish_date ? new Date(publish_date) : null, id
    ]);

    // Update tags: delete old ones, insert new ones
    await connection.query(`DELETE FROM blog_tags WHERE blog_id = ?`, [id]);

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const insertTagSql = `INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)`;
      for (const tag of tags) {
        if (tag.trim()) {
          await connection.query(insertTagSql, [id, tag.trim()]);
        }
      }
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err: any) {
    await connection.rollback();
    console.error("Failed to update blog:", err);
    res.status(500).json({ error: 'update_blog_failed', details: err.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM blogs WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete blog:", err);
    res.status(500).json({ error: 'delete_blog_failed', details: err.message });
  }
});

app.get('/api/blog-categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM blog_categories ORDER BY name`);
    res.json(rows);
  } catch (err: any) {
    console.warn("MySQL Failed to fetch blog categories, returning static fallback categories:", err.message);
    const fallbackCategories = [
      { id: 1, name: "Destinations", slug: "destinations" },
      { id: 2, name: "Premium Destinations", slug: "premium-destinations" },
      { id: 3, name: "Pilgrimage", slug: "pilgrimage" },
      { id: 4, name: "Travel Safety", slug: "travel-safety" },
      { id: 5, name: "Travel Planning", slug: "travel-planning" },
      { id: 6, name: "Adventure", slug: "adventure" },
      { id: 7, name: "Digital Nomad", slug: "digital-nomad" },
      { id: 8, name: "Eco-Tourism", slug: "eco-tourism" },
      { id: 9, name: "Luxury Stays", slug: "luxury-stays" },
      { id: 10, name: "Guides", slug: "guides" },
      { id: 11, name: "International", slug: "international" }
    ];
    res.json(fallbackCategories);
  }
});


// Generic CRUD GET
app.get('/api/:tableName', async (req, res, _next) => {
  const { tableName } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    const [colsInfo]: any = await pool.query(`DESCRIBE \`${mappedTable}\``);
    const validColumns = colsInfo.map((c: any) => c.Field);
    
    const queryParts: string[] = [];
    const queryValues: any[] = [];
    
    Object.keys(req.query).forEach(key => {
      if (validColumns.includes(key)) {
        queryParts.push(`\`${key}\` = ?`);
        queryValues.push(req.query[key]);
      }
    });
    
    let sql = `SELECT * FROM \`${mappedTable}\``;
    if (queryParts.length > 0) {
      sql += ` WHERE ${queryParts.join(' AND ')}`;
    }
    
    // Support sorting if the table has specific columns
    if (mappedTable === 'payments' && validColumns.includes('payment_date')) {
      sql += ` ORDER BY payment_date DESC`;
    } else if (mappedTable === 'documents' && validColumns.includes('uploaded_at')) {
      sql += ` ORDER BY uploaded_at DESC`;
    }
    
    const [rows]: any = await pool.query(sql, queryValues);
    res.json(rows.map((r: any) => parseGenericRowLocal(r, mappedTable)));
  } catch (err: any) {
    // If the table simply doesn't exist in this environment, return empty array
    // rather than a 500 so that callers that check res.ok still get usable data.
    const isTableNotFound = err.message && (
      err.message.includes("doesn't exist") ||
      err.message.includes('Table') ||
      err.code === 'ER_NO_SUCH_TABLE'
    );
    if (isTableNotFound) {
      console.warn(`[Express] Table '${mappedTable}' not found in local DB — returning []`);
      return res.json([]);
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:tableName/:id', async (req, res, _next) => {
  const { tableName, id } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    const [rows]: any = await pool.query(`SELECT * FROM \`${mappedTable}\` WHERE id = ?`, [id]);
    if (rows.length > 0) {
      res.json(parseGenericRowLocal(rows[0], mappedTable));
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD POST
app.post('/api/:tableName', async (req, res, _next) => {
  const { tableName } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    const input = req.body;
    const newId = input.id || `${mappedTable.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const [colsInfo]: any = await pool.query(`DESCRIBE \`${mappedTable}\``);
    const validColumns = colsInfo.map((c: any) => c.Field);
    
    const data: Record<string, any> = {};
    validColumns.forEach((col: string) => {
      if (col !== 'id' && input[col] !== undefined) {
        const val = input[col];
        data[col] = (Array.isArray(val) || typeof val === 'object') ? JSON.stringify(val) : val;
      }
    });
    
    const columnsToInsert = ['id', ...Object.keys(data)];
    const valuesToInsert = [newId, ...Object.values(data)];
    const placeholders = columnsToInsert.map(() => '?').join(', ');
    
    await pool.query(
      `INSERT INTO \`${mappedTable}\` (\`${columnsToInsert.join('\`, \`')}\`) VALUES (${placeholders})`,
      valuesToInsert
    );
    res.json({ success: true, id: newId });
  } catch (err: any) {
    console.error('POST /api/:tableName error:', req.params.tableName, err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD PUT
app.put('/api/:tableName/:id', async (req, res, _next) => {
  const { tableName, id } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    const input = req.body;
    const [colsInfo]: any = await pool.query(`DESCRIBE \`${mappedTable}\``);
    const validColumns = colsInfo.map((c: any) => c.Field);
    
    const setParts: string[] = [];
    const values: any[] = [];
    validColumns.forEach((col: string) => {
      if (col !== 'id' && input[col] !== undefined) {
        const val = input[col];
        setParts.push(`\`${col}\` = ?`);
        values.push((Array.isArray(val) || typeof val === 'object') ? JSON.stringify(val) : val);
      }
    });
    
    if (setParts.length === 0) {
      return res.json({ success: true, message: 'No columns to update' });
    }
    
    values.push(id);
    await pool.query(
      `UPDATE \`${mappedTable}\` SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/:tableName/:id error:', 
      req.params.tableName, req.params.id, 
      err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD DELETE
app.delete('/api/:tableName', async (req, res, _next) => {
  const { tableName } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    const { hotel_id, contract_id } = req.query;
    const [colsInfo]: any = await pool.query(`DESCRIBE \`${mappedTable}\``);
    const validColumns = colsInfo.map((c: any) => c.Field);

    if (hotel_id && validColumns.includes('hotel_id')) {
      await pool.query(`DELETE FROM \`${mappedTable}\` WHERE hotel_id = ?`, [hotel_id]);
    } else if (contract_id && validColumns.includes('contract_id')) {
      await pool.query(`DELETE FROM \`${mappedTable}\` WHERE contract_id = ?`, [contract_id]);
    } else {
      return res.status(400).json({ error: 'Missing or invalid identifier' });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/:tableName error:', req.params.tableName, err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:tableName/:id', async (req, res, _next) => {
  const { tableName, id } = req.params;
  const mappedTable = tableName.replace(/-/g, '_');
  if (!allowedLocalTables.includes(mappedTable)) {
    return res.status(403).json({ error: 'Forbidden: table not accessible via this endpoint' });
  }
  try {
    await pool.query(`DELETE FROM \`${mappedTable}\` WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/:tableName/:id error:', req.params.tableName, req.params.id, err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Razorpay server listening on ${port}`);
});

