import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { pushEvent } from '@/lib/analytics';

interface PackageDetails {
  title: string;
  duration: string;
  price: string;
  highlights: string[];
  inclusions: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
}

interface BrochureDownloadProps {
  packageDetails: PackageDetails;
  packageType: 'domestic' | 'international';
  destination: string;
  groupSize?: string;
  bestTime?: string;
  difficulty?: string;
  ageLimit?: string;
  accommodation?: string;
  meals?: string;
  transport?: string;
}

const BrochureDownload: React.FC<BrochureDownloadProps> = ({ 
  packageDetails, 
  packageType, 
  destination,
  groupSize = "2-15 people",
  bestTime = "Year round",
  difficulty = "Easy",
  ageLimit = "All ages",
  accommodation = "3-4 star hotels",
  meals = "Breakfast included",
  transport = "AC vehicle"
}) => {
  const generateBrochureContent = () => {
    const brochureHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${packageDetails.title} - Ghumo Firoo Travels</title>
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.5; 
            color: #333;
            background: white;
            font-size: 14px;
          }
          
          .brochure {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
          }
          
          .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            min-height: 200px;
          }
          
          .agency-logo {
            position: absolute;
            top: 20px;
            left: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .agency-logo img {
            height: 35px;
            width: auto;
            max-width: 150px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin: 60px 0 15px 0;
            line-height: 1.2;
          }
          
          .header .subtitle {
            font-size: 16px;
            margin-bottom: 20px;
            opacity: 0.9;
          }
          
          .price-box {
            background: rgba(255,255,255,0.2);
            padding: 15px 25px;
            border-radius: 10px;
            display: inline-block;
            margin-top: 15px;
          }
          
          .price-box .price {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .price-box .price-note {
            font-size: 12px;
            opacity: 0.8;
          }
          .content {
            padding: 30px;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section:nth-child(3) {
            page-break-before: always;
          }
          
          .section h2 {
            color: #ff6b35;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 5px;
          }
          
          .highlights {
            display: block;
          }
          
          .highlight-item {
            display: block;
            padding: 12px 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-left: 4px solid #ff6b35;
            border-radius: 4px;
          }
          
          .highlight-item::before {
            content: '✓ ';
            color: #28a745;
            font-weight: bold;
          }
          .itinerary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .day-item {
            display: flex;
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e9ecef;
          }
          
          .day-number {
            background: #ff6b35;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 15px;
            flex-shrink: 0;
          }
          
          .day-content h3 {
            color: #333;
            margin-bottom: 5px;
            font-size: 16px;
            font-weight: bold;
          }
          
          .day-content p {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .pricing {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            page-break-inside: avoid;
            page-break-before: auto;
          }
          
          .pricing h3 {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .pricing p {
            font-size: 16px;
            margin-bottom: 20px;
            color: white;
          }
          
          .pricing .highlights {
            display: block;
            margin-top: 15px;
          }
          
          .pricing .highlight-item {
            display: block;
            padding: 10px 15px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-left: 4px solid white;
            border-radius: 4px;
            color: white;
            font-weight: bold;
          }
          
          .pricing .highlight-item::before {
            content: '';
            color: white;
          }
          .contact-info {
            background: #343a40;
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .contact-info h3 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .contact-info p {
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
          }
          
          .contact-details {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 15px;
          }
          
          .contact-details > div {
            flex: 1;
            min-width: 200px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            text-align: center;
          }
          
          .contact-details > div:last-child {
            flex: 2;
            min-width: 300px;
          }
          
          .contact-details strong {
            display: block;
            font-size: 12px;
            margin-bottom: 5px;
            color: #ff6b35;
            font-weight: bold;
          }
          
          .contact-details .contact-value {
            font-size: 14px;
            font-weight: bold;
            color: white;
          }
          
          .footer {
            background: #f8f9fa;
            color: #666;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-radius: 6px;
            margin-top: 20px;
            border: 1px solid #e9ecef;
          }
          
          .footer p {
            margin: 0;
          }
          .price-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            display: inline-block;
            margin: 0 5px;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }
          
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
          }
          
          .feature-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            font-weight: 500;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body { 
              margin: 0; 
              font-size: 11px; 
              line-height: 1.3;
              font-family: Arial, sans-serif;
            }
            
            .brochure { 
              box-shadow: none; 
              margin: 0; 
              max-width: 100%;
              height: auto;
            }
            
            .header { 
              padding: 10px;
              height: auto;
              display: block;
            }
            
            .content { 
              padding: 10px;
            }
            
            /* Force page breaks at logical points */
            .section:first-child {
              break-after: page;
            }
            
            .section:nth-child(2) {
              break-before: page;
              break-after: page;
            }
            
            .section:nth-child(3) {
              break-before: page;
            }
            
            .pricing {
              break-before: page;
              break-inside: avoid;
              margin-top: 0;
              padding-top: 15px;
            }
            
            .contact-info {
               break-inside: avoid;
               margin-top: 15px;
             }
             
             .terms-conditions {
               break-before: page;
               break-inside: avoid;
               margin-top: 20px;
               padding: 20px;
               background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
               border: 2px solid #dee2e6;
               border-radius: 8px;
               box-shadow: 0 2px 8px rgba(0,0,0,0.1);
             }
             
             .terms-conditions h3 {
               font-size: 16px;
               font-weight: bold;
               color: #2c3e50;
               text-align: center;
               margin: 0 0 15px 0;
               padding-bottom: 8px;
               border-bottom: 2px solid #3498db;
               text-transform: uppercase;
               letter-spacing: 1px;
             }
             
             .terms-content {
               display: grid;
               grid-template-columns: 1fr 1fr;
               gap: 20px;
               margin-top: 15px;
             }
             
             .terms-section {
               break-inside: avoid;
               margin-bottom: 15px;
               padding: 12px;
               background: white;
               border-radius: 6px;
               border-left: 4px solid #3498db;
               box-shadow: 0 1px 3px rgba(0,0,0,0.1);
             }
             
             .terms-section h4 {
               font-size: 12px;
               font-weight: bold;
               margin: 0 0 8px 0;
               color: #2c3e50;
               text-transform: uppercase;
               letter-spacing: 0.5px;
               border-bottom: 1px solid #ecf0f1;
               padding-bottom: 4px;
             }
             
             .terms-section ul {
               margin: 0;
               padding-left: 18px;
               font-size: 10px;
               line-height: 1.4;
               color: #34495e;
             }
             
             .terms-section li {
               margin-bottom: 4px;
               break-inside: avoid;
               position: relative;
             }
             
             .terms-section li:before {
               content: '▸';
               color: #3498db;
               font-weight: bold;
               position: absolute;
               left: -12px;
             }
             
             /* Quick Facts section */
             .quick-facts {
               break-inside: avoid;
               margin: 15px 0;
               padding: 15px;
             }
             
             .quick-facts h2 {
               font-size: 14px;
               font-weight: bold;
               color: #2c3e50;
               margin: 0 0 12px 0;
               padding-bottom: 6px;
               border-bottom: 2px solid #ea580c;
             }
             
             .quick-facts-grid {
               display: grid;
               grid-template-columns: 1fr 1fr;
               gap: 10px;
               margin-top: 12px;
             }
             
             .quick-fact-item {
               background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
               padding: 8px;
               border-radius: 6px;
               border: 1px solid #fed7aa;
               box-shadow: 0 1px 3px rgba(0,0,0,0.1);
               break-inside: avoid;
               font-size: 10px;
             }
             
             .quick-fact-row {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-bottom: 4px;
             }
             
             .quick-fact-label {
               color: #7c2d12;
               font-weight: 600;
               font-size: 9px;
             }
             
             .quick-fact-value {
               font-weight: bold;
               color: #ea580c;
               font-size: 9px;
             }
            
            /* Individual items */
            .day-item {
              break-inside: avoid;
              margin-bottom: 12px;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            
            .day-item:last-child {
              border-bottom: none;
            }
            
            .highlight-item {
              break-inside: avoid;
              margin-bottom: 6px;
              padding: 4px 0;
            }
            
            /* Contact details */
            .contact-details {
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              break-inside: avoid;
            }
            
            .contact-details > div {
              flex: 1;
              min-width: 120px;
              margin: 5px;
              break-inside: avoid;
            }
            
            .contact-details > div:last-child {
              flex: 2;
              min-width: 200px;
              font-size: 10px;
            }
            
            /* Footer */
            .footer {
              break-inside: avoid;
              margin-top: 15px;
              font-size: 10px;
            }
            
            /* Typography */
            h1 { font-size: 18px; margin: 8px 0; }
            h2 { font-size: 14px; margin: 6px 0; }
            h3 { font-size: 12px; margin: 4px 0; }
            p { margin: 4px 0; }
            
            /* Remove problematic properties */
            * {
              box-sizing: border-box;
              orphans: unset;
              widows: unset;
            }
          }
          
          @media (max-width: 768px) {
            .brochure { margin: 5px; }
            .header { padding: 15px; }
            .content { padding: 15px; }
            .agency-logo { width: 60px; height: 60px; }
          }
        </style>
      </head>
      <body>
        <div class="brochure">
          <div class="header">
            <div class="agency-logo">
              <img src="/Ghumo_Firooo.png" alt="Ghumo Firoo" />
            </div>
            <h1>${packageDetails.title}</h1>
            <p class="subtitle">${packageDetails.duration} • ${packageType === 'international' ? 'International' : 'Domestic'} Package</p>
            <div class="price-box">
              <div class="price">${packageDetails.price}</div>
              <div class="price-note">Per person on twin sharing basis</div>
              <div class="price-note">*Prices subject to availability</div>
            </div>
          </div>
          
          <div class="content">
            <div class="section">
              <h2>Package Highlights</h2>
              <div class="highlights">
                ${packageDetails.highlights.map(highlight => 
                  `<div class="highlight-item">${highlight}</div>`
                ).join('')}
              </div>
            </div>
            
            <div class="section">
              <h2>Quick Facts</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Duration:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${packageDetails.duration}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Group Size:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${groupSize}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Best Time:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${bestTime}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Difficulty:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${difficulty}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Age Limit:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${ageLimit}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Accommodation:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${accommodation}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Meals:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${meals}</span>
                  </div>
                </div>
                <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); padding: 12px; border-radius: 8px; border: 1px solid #fed7aa; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #7c2d12; font-weight: 600; font-size: 11px;">Transport:</span>
                    <span style="font-weight: bold; color: #ea580c; font-size: 11px;">${transport}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Detailed Itinerary</h2>
              <div class="itinerary">
                ${packageDetails.itinerary.map(day => `
                  <div class="day-item">
                    <div class="day-number">${day.day}</div>
                    <div class="day-content">
                      <h3>${day.title}</h3>
                      <p>${day.description}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="section">
              <h2>Package Inclusions</h2>
              <div class="highlights">
                ${packageDetails.inclusions.map(inclusion => 
                  `<div class="highlight-item">${inclusion}</div>`
                ).join('')}
              </div>
            </div>
            
            <div class="pricing">
              <h3>Book Your Journey Today!</h3>
              <p>Experience the adventure of a lifetime with our expertly crafted travel packages</p>
              <div class="highlights">
                 <div class="highlight-item">✈️ Expert Guidance</div>
                 <div class="highlight-item">🏨 Premium Stays</div>
                 <div class="highlight-item">🎯 Best Value</div>
               </div>
            </div>
            
            <div class="contact-info">
              <h3>Contact Us for Booking</h3>
              <p>Your trusted travel partner for unforgettable journeys</p>
              <div class="contact-details">
                <div>
                  <strong>📞 Phone:</strong>
                  <div class="contact-value">+91 9910987264</div>
                </div>
                <div>
                  <strong>✉️ Email:</strong>
                  <div class="contact-value">booking@ghumofiroo.com</div>
                </div>
                <div>
                  <strong>🌐 Website:</strong>
                  <div class="contact-value">www.ghumofiroo.com</div>
                </div>
                <div>
                  <strong>📍 Office:</strong>
                  <div class="contact-value">Shop No. 210, 2nd Floor, Pratap Complex Metro Gate Number 3, near Munirka Baba Gangnath Market, Munirka New Delhi, Delhi 110067</div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #dee2e6; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); break-before: page; break-inside: avoid;">
              <h3 style="font-size: 16px; font-weight: bold; color: #2c3e50; text-align: center; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #3498db; text-transform: uppercase; letter-spacing: 1px;">Terms & Conditions</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                <div style="break-inside: avoid; margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3498db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 8px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ecf0f1; padding-bottom: 4px;">Booking Terms</h4>
                  <div style="margin: 0; padding-left: 0; font-size: 10px; line-height: 1.4; color: #34495e;">
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 25% advance payment required to confirm booking</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Full payment required 30 days before departure for international tours</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Full payment required 15 days before departure for domestic tours</div>
                  </div>
                </div>
                
                <div style="break-inside: avoid; margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3498db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 8px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ecf0f1; padding-bottom: 4px;">Cancellation Policy</h4>
                  <div style="margin: 0; padding-left: 0; font-size: 10px; line-height: 1.4; color: #34495e;">
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 45+ days before departure: 10% of total tour cost</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 31-44 days before departure: 25% of total tour cost</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 16-30 days before departure: 50% of total tour cost</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 8-15 days before departure: 75% of total tour cost</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ 0-7 days before departure: 100% of total tour cost</div>
                  </div>
                </div>
                
                <div style="break-inside: avoid; margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3498db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 8px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ecf0f1; padding-bottom: 4px;">Travel Documents</h4>
                  <div style="margin: 0; padding-left: 0; font-size: 10px; line-height: 1.4; color: #34495e;">
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Valid passport with minimum 6 months validity</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Appropriate visas and permits</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Travel insurance (highly recommended)</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Health certificates and vaccinations as required</div>
                  </div>
                </div>
                
                <div style="break-inside: avoid; margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #3498db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 8px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ecf0f1; padding-bottom: 4px;">Important Notes</h4>
                  <div style="margin: 0; padding-left: 0; font-size: 10px; line-height: 1.4; color: #34495e;">
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Itinerary may change due to weather or unforeseen circumstances</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Company reserves right to cancel tour due to insufficient bookings</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ All outdoor activities undertaken at participant's own risk</div>
                    <div style="margin-bottom: 4px; padding-left: 12px; position: relative;">▸ Complaints must be reported immediately to tour representative</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 Ghumo Firoo Travels. All rights reserved. | Licensed Tour Operator | 24/7 Customer Support</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return brochureHTML;
  };

  const downloadBrochure = async () => {
    try {
      // Create a temporary container for the brochure content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = generateBrochureContent();
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '800px';
      document.body.appendChild(tempContainer);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempContainer.querySelector('.brochure') as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // PDF SEO metadata
      pdf.setProperties({
      title: `${destination} - ${packageDetails.title} | Ghumo Firoo Travels`,
        subject: 'Travel Brochure',
        author: 'Ghumo Firoo Travels',
        keywords: `Ghumo Firoo Travels, travel brochure, tour package, ${packageDetails.title}, ${destination}, ${packageDetails.highlights.join(', ')}`,
        creator: 'Ghumo Firoo Travels'
      });
      try { (pdf as any).setCreationDate?.(new Date()); } catch {}

      // Download the PDF
      pdf.save(`${destination.replace(/\s+/g, '_')}_Package_Brochure.pdf`);
      try { pushEvent('brochure_download', { format: 'pdf', destination, package_title: packageDetails.title }); } catch {}

      // Clean up
      document.body.removeChild(tempContainer);
      
      // Show success message
      alert('Brochure downloaded successfully as PDF!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download
      const brochureContent = generateBrochureContent();
      const blob = new Blob([brochureContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${destination.replace(/\s+/g, '_')}_Package_Brochure.html`;
      document.body.appendChild(link);
      link.click();
      try { pushEvent('brochure_download', { format: 'html_fallback', destination, package_title: packageDetails.title }); } catch {}
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('PDF generation failed. Downloaded as HTML instead.');
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm group transition-all duration-200"
      onClick={downloadBrochure}
    >
      <div className="flex items-center justify-center gap-2">
        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="font-medium">📄 Download Brochure</span>
      </div>
    </Button>
  );
};

export default BrochureDownload;