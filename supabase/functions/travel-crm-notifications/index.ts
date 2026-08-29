import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import React from "https://esm.sh/react@18.2.0";
import ReactDOMServer from "https://esm.sh/react-dom@18.2.0/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// React element creator helper
const e = React.createElement;

// Premium Color Palette
const COLORS = {
  navy: "#0B1026",
  navyLight: "#1A255C",
  gold: "#C9A25A",
  goldLight: "#D8B97A",
  cream: "#FDFBF7",
  textDark: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
  success: "#10B981"
};

// Helper: Get premium travel banner by destination
function getDestinationBanner(destination?: string): string {
  const d = (destination || "").toLowerCase();
  if (d.includes("char dham") || d.includes("chardham") || d.includes("kedarnath") || d.includes("badrinath")) {
    return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
  } else if (d.includes("rann") || d.includes("utsav") || d.includes("kutch")) {
    return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
  } else if (d.includes("bali")) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("dubai")) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("europe") || d.includes("london") || d.includes("paris") || d.includes("switzerland")) {
    return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("kashmir") || d.includes("srinagar") || d.includes("gulmarg")) {
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("ladakh") || d.includes("leh")) {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("goa")) {
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("kerala") || d.includes("kochi") || d.includes("munnar")) {
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("singapore")) {
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("thailand") || d.includes("bangkok") || d.includes("phuket")) {
    return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80";
  } else if (d.includes("rajasthan") || d.includes("jaipur") || d.includes("udaipur")) {
    return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80";
  } else {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
  }
}

// ---------------------------------------------------------
// Reusable Layout Component
// ---------------------------------------------------------
const EmailLayout = ({ heroTitle, heroSubtitle, previewText, children }: { heroTitle: string; heroSubtitle: string; previewText?: string; children: React.ReactNode }) => {
  return e("div", { style: { backgroundColor: "#F8FAFC", padding: "30px 10px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" } },
    previewText && e("span", { style: { display: "none", fontSize: "1px", color: "transparent", maxHeight: "0px", overflow: "hidden" } }, previewText),
    e("table", { align: "center", border: 0, cellPadding: 0, cellSpacing: 0, width: "600", style: { backgroundColor: COLORS.white, borderRadius: "12px", overflow: "hidden", border: `1px solid ${COLORS.border}`, boxShadow: "0 4px 20px rgba(11, 16, 38, 0.04)" } },
      e("tbody", null,
        // Header
        e("tr", null,
          e("td", { align: "center", style: { padding: "25px 20px", backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}` } },
            e("img", {
              src: "https://rfdumlnkmfuacsznogzz.supabase.co/storage/v1/object/public/trip-reviews/ghumo-firoo-logo.png",
              alt: "Ghumo Firoo Travels",
              style: { maxHeight: "60px", width: "auto", display: "inline-block" }
            })
          )
        ),
        // Hero Section
        e("tr", null,
          e("td", { style: { background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 100%)`, padding: "40px 30px", textAlign: "center", color: COLORS.white } },
            e("h1", { style: { margin: "0 0 10px 0", fontSize: "24px", fontWeight: "700", color: COLORS.goldLight, letterSpacing: "0.5px" } }, heroTitle),
            e("p", { style: { margin: "0", fontSize: "15px", color: "#E2E8F0", lineHeight: "1.5" } }, heroSubtitle)
          )
        ),
        // Body Content
        e("tr", null,
          e("td", { style: { padding: "35px 30px" } }, children)
        ),
        // Footer (Deep Navy Premium Footer with Custom Overridden Links)
        e("tr", null,
          e("td", { style: { backgroundColor: COLORS.navy, padding: "30px", borderTop: `1px solid ${COLORS.border}`, textAlign: "center" } },
            e("table", { align: "center", border: 0, cellPadding: 0, cellSpacing: 0, width: "100%" },
              e("tbody", null,
                e("tr", null,
                  e("td", { style: { paddingBottom: "15px" } },
                    e("p", { style: { margin: "0 0 5px 0", fontSize: "15px", fontWeight: "700", color: COLORS.goldLight, letterSpacing: "0.5px" } }, "GHUMO FIROO TRAVELS"),
                    e("p", { style: { margin: "0", fontSize: "11px", color: "#94A3B8" } }, "Your Premium Travel Partner")
                  )
                ),
                e("tr", null,
                  e("td", { style: { paddingBottom: "15px" } },
                    e("table", { align: "center", border: 0, cellPadding: 0, cellSpacing: 0 },
                      e("tbody", null,
                        e("tr", null,
                          e("td", { style: { padding: "0 8px" } }, e("a", { href: "https://ghumofiroo.com", style: { textDecoration: "none" } }, e("span", { style: { fontSize: "12px", fontWeight: "600", color: COLORS.gold } }, "Website"))),
                          e("td", { style: { padding: "0 8px", color: "#475569" } }, "|"),
                          e("td", { style: { padding: "0 8px" } }, e("a", { href: "tel:+919910987264", style: { textDecoration: "none" } }, e("span", { style: { fontSize: "12px", fontWeight: "600", color: COLORS.gold } }, "+91 99109 87264"))),
                          e("td", { style: { padding: "0 8px", color: "#475569" } }, "|"),
                          e("td", { style: { padding: "0 8px" } }, e("a", { href: "mailto:info@ghumofiroo.com", style: { textDecoration: "none" } }, e("span", { style: { fontSize: "12px", fontWeight: "600", color: COLORS.gold } }, "info@ghumofiroo.com")))
                        )
                      )
                    )
                  )
                ),
                e("tr", null,
                  e("td", null,
                    e("p", { style: { margin: "0", fontSize: "9px", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "1px" } }, `© ${new Date().getFullYear()} GHUMO FIROO TRAVELS. ALL RIGHTS RESERVED.`)
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

// ---------------------------------------------------------
// Template 1: Lead Acknowledgement
// ---------------------------------------------------------
const LeadAcknowledgementTemplate = ({ customerName, destination, travelDates, numberOfTravellers, leadReferenceNumber }: { customerName: string; destination: string; travelDates: string; numberOfTravellers: string; leadReferenceNumber: string }) => {
  const banner = getDestinationBanner(destination);
  return e(EmailLayout, {
    heroTitle: "Thank You for Your Travel Enquiry",
    heroSubtitle: "Our experts are crafting your dream holiday",
    previewText: `Dear ${customerName}, we have received your travel request.`
  },
    e("div", null,
      e("p", { style: { fontSize: "16px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } }, `Dear ${customerName},`),
      e("p", { style: { fontSize: "14px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } },
        "Thank you for reaching out to Ghumo Firoo Travels. We are delighted at the prospect of planning your upcoming trip. One of our dedicated travel experts will get in touch with you within the next 24 hours to present a customized itinerary tailored specifically to your preferences."
      ),
      // Banner
      e("img", { src: banner, alt: "Destination Banner", style: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "25px", display: "block" } }),
      // Details Card
      e("table", { border: 0, cellPadding: "15", cellSpacing: 0, width: "100%", style: { backgroundColor: COLORS.cream, border: `1px solid ${COLORS.gold}33`, borderRadius: "8px", marginBottom: "30px" } },
        e("tbody", null,
          e("tr", null,
            e("td", { style: { fontSize: "14px", color: COLORS.textDark } },
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Lead Reference ID: "), leadReferenceNumber),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Destination: "), destination),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Travel Dates: "), travelDates),
              e("p", { style: { margin: "0" } }, e("strong", null, "Number of Travellers: "), numberOfTravellers)
            )
          )
        )
      ),
      // CTA
      e("div", { style: { textAlign: "center", margin: "35px 0 10px 0" } },
        e("a", { href: "https://wa.me/919910987264?text=Hi%2C%20I%20enquired%20about%20my%20trip%20with%20reference%20" + leadReferenceNumber, style: { backgroundColor: COLORS.navy, color: COLORS.gold, textDecoration: "none", padding: "14px 28px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", display: "inline-block", border: `1px solid ${COLORS.gold}` } }, "Contact Travel Expert")
      )
    )
  );
};

// ---------------------------------------------------------
// Template 2: Quote Email
// ---------------------------------------------------------
interface HotelDetail {
  name: string;
  city: string;
  category?: string;
  nights: number;
}
const QuoteEmailTemplate = ({ customerName, destination, packageName, numberOfNights, hotels, packageCost, validityDate, leadId }: { customerName: string; destination: string; packageName: string; numberOfNights: number; hotels: HotelDetail[]; packageCost: string; validityDate: string; leadId: string }) => {
  const banner = getDestinationBanner(destination);
  return e(EmailLayout, {
    heroTitle: "Your Customized Travel Proposal",
    heroSubtitle: "Handcrafted journey especially for you",
    previewText: `Hi ${customerName}, review your custom itinerary quotation for ${destination}.`
  },
    e("div", null,
      e("p", { style: { fontSize: "16px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } }, `Dear ${customerName},`),
      e("p", { style: { fontSize: "14px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } },
        `We have curated an exclusive travel proposal for your trip to ${destination}. Below are the primary details of the package, including accommodations, cost, and validity. Please review the detailed day-by-day itinerary in our workspace.`
      ),
      e("img", { src: banner, alt: "Destination", style: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "25px", display: "block" } }),
      
      // Overview Card
      e("table", { border: 0, cellPadding: "15", cellSpacing: 0, width: "100%", style: { backgroundColor: COLORS.cream, border: `1px solid ${COLORS.gold}44`, borderRadius: "8px", marginBottom: "25px" } },
        e("tbody", null,
          e("tr", null,
            e("td", { style: { fontSize: "14px", color: COLORS.textDark } },
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Package Name: "), packageName),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Destination: "), destination),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Duration: "), `${numberOfNights} Nights / ${numberOfNights + 1} Days`),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Total Cost: "), e("span", { style: { fontSize: "18px", fontWeight: "700", color: COLORS.navy } }, packageCost)),
              e("p", { style: { margin: "0", color: "#EF4444", fontSize: "12px" } }, `*Price valid until: ${validityDate}`)
            )
          )
        )
      ),

      // Hotels Section
      hotels && hotels.length > 0 && e("div", { style: { marginBottom: "30px" } },
        e("h3", { style: { fontSize: "16px", color: COLORS.navy, margin: "0 0 12px 0", borderBottom: `2px solid ${COLORS.gold}`, paddingBottom: "6px" } }, "Proposed Accommodations"),
        e("table", { border: 0, cellPadding: "10", cellSpacing: 0, width: "100%", style: { borderCollapse: "collapse" } },
          e("thead", null,
            e("tr", { style: { backgroundColor: COLORS.navy, color: COLORS.white } },
              e("th", { align: "left", style: { fontSize: "12px", padding: "8px 10px" } }, "Hotel Name"),
              e("th", { align: "left", style: { fontSize: "12px", padding: "8px 10px" } }, "City"),
              e("th", { align: "center", style: { fontSize: "12px", padding: "8px 10px" } }, "Nights")
            )
          ),
          e("tbody", null,
            hotels.map((h, i) => 
              e("tr", { key: i, style: { borderBottom: `1px solid ${COLORS.border}`, backgroundColor: i % 2 === 0 ? "#F8FAFC" : COLORS.white } },
                e("td", { style: { fontSize: "13px", color: COLORS.textDark, padding: "10px" } }, 
                  e("div", null, h.name),
                  h.category && e("span", { style: { fontSize: "10px", color: COLORS.gold, backgroundColor: `${COLORS.gold}1a`, padding: "2px 6px", borderRadius: "10px" } }, h.category)
                ),
                e("td", { style: { fontSize: "13px", color: COLORS.textDark, padding: "10px" } }, h.city),
                e("td", { align: "center", style: { fontSize: "13px", color: COLORS.textDark, padding: "10px" } }, h.nights)
              )
            )
          )
        )
      ),

      // CTAs
      e("table", { border: 0, cellPadding: 0, cellSpacing: 0, width: "100%", style: { marginTop: "30px" } },
        e("tbody", null,
          e("tr", null,
            e("td", { align: "right", width: "48%" },
              e("a", { href: `https://ghumofiroo.com/itinerary/${leadId}`, style: { display: "block", textAlign: "center", backgroundColor: COLORS.white, color: COLORS.navy, textDecoration: "none", padding: "12px 15px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", border: `1px solid ${COLORS.navy}` } }, "Download Quote PDF")
            ),
            e("td", { width: "4%" }),
            e("td", { align: "left", width: "48%" },
              e("a", { href: `https://ghumofiroo.com/book/${leadId}`, style: { display: "block", textAlign: "center", backgroundColor: COLORS.navy, color: COLORS.gold, textDecoration: "none", padding: "12px 15px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", border: `1px solid ${COLORS.gold}` } }, "Book Now")
            )
          )
        )
      )
    )
  );
};

// ---------------------------------------------------------
// Template 3: Booking Confirmation
// ---------------------------------------------------------
const BookingConfirmationTemplate = ({ bookingId, passengerNames, destination, travelDates, hotelName, contactNumber, emergencyNumber }: { bookingId: string; passengerNames: string; destination: string; travelDates: string; hotelName: string; contactNumber: string; emergencyNumber: string }) => {
  const banner = getDestinationBanner(destination);
  return e(EmailLayout, {
    heroTitle: "Booking Confirmed!",
    heroSubtitle: "Your upcoming journey is fully secured",
    previewText: `Congratulations! Your booking for ${destination} is confirmed. Booking ID: ${bookingId}.`
  },
    e("div", null,
      e("p", { style: { fontSize: "16px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } }, "Dear " + passengerNames + ","),
      e("p", { style: { fontSize: "14px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } },
        `We are thrilled to inform you that your booking for ${destination} is officially confirmed. Your confirmation voucher is ready for download. Please verify your trip details in the confirmation ledger below.`
      ),
      e("img", { src: banner, alt: "Trip Confirmed", style: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "25px", display: "block" } }),
      
      // Confirmation Ledger
      e("table", { border: 0, cellPadding: "15", cellSpacing: 0, width: "100%", style: { backgroundColor: "#F0FDF4", border: `1px solid ${COLORS.success}44`, borderRadius: "8px", marginBottom: "30px" } },
        e("tbody", null,
          e("tr", null,
            e("td", { style: { fontSize: "14px", color: COLORS.textDark } },
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", { style: { color: COLORS.navy } }, "Booking Reference ID: "), bookingId),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Destination: "), destination),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Travel Dates: "), travelDates),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Primary Hotel: "), hotelName),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Passengers: "), passengerNames),
              e("p", { style: { margin: "0 0 8px 0" } }, e("strong", null, "Customer Contact: "), contactNumber),
              e("p", { style: { margin: "0", color: "#EF4444" } }, e("strong", null, "24/7 Emergency Support: "), emergencyNumber)
            )
          )
        )
      ),

      // CTA
      e("div", { style: { textAlign: "center", margin: "30px 0 10px 0" } },
        e("a", { href: `https://ghumofiroo.com/vouchers/${bookingId}`, style: { backgroundColor: COLORS.navy, color: COLORS.gold, textDecoration: "none", padding: "14px 28px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", display: "inline-block", border: `1px solid ${COLORS.gold}` } }, "Download Voucher")
      )
    )
  );
};

// ---------------------------------------------------------
// Template 4: Payment Receipt
// ---------------------------------------------------------
const PaymentReceiptTemplate = ({ customerName, bookingId, amountReceived, paymentDate, remainingBalance, paymentMethod, referenceNumber }: { customerName: string; bookingId: string; amountReceived: string; paymentDate: string; remainingBalance: string; paymentMethod: string; referenceNumber: string }) => {
  return e(EmailLayout, {
    heroTitle: "Payment Receipt",
    heroSubtitle: "Thank you. Your payment has been successfully recorded.",
    previewText: `Dear ${customerName}, payment of ${amountReceived} received for Booking ID: ${bookingId}.`
  },
    e("div", null,
      e("p", { style: { fontSize: "16px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } }, `Dear ${customerName},`),
      e("p", { style: { fontSize: "14px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } },
        "This is an official confirmation of the payment received for your travel booking. Please find the detailed transaction receipt below."
      ),
      
      // Receipt Card
      e("table", { border: 0, cellPadding: "0", cellSpacing: 0, width: "100%", style: { border: `1px solid ${COLORS.border}`, borderRadius: "10px", overflow: "hidden", marginBottom: "30px" } },
        e("tbody", null,
          e("tr", { style: { backgroundColor: COLORS.navy, color: COLORS.white } },
            e("td", { style: { padding: "15px 20px", fontSize: "16px", fontWeight: "700" } }, "Payment Details"),
            e("td", { align: "right", style: { padding: "15px 20px", fontSize: "14px", color: COLORS.goldLight } }, `ID: ${bookingId.slice(0,8)}`)
          ),
          e("tr", null,
            e("td", { colSpan: 2, style: { padding: "20px" } },
              e("table", { border: 0, cellPadding: 0, cellSpacing: 0, width: "100%", style: { fontSize: "14px", color: COLORS.textDark } },
                e("tbody", null,
                  e("tr", null,
                    e("td", { style: { padding: "8px 0", color: COLORS.textMuted } }, "Payment Date"),
                    e("td", { align: "right", style: { fontWeight: "600" } }, paymentDate)
                  ),
                  e("tr", null,
                    e("td", { style: { padding: "8px 0", color: COLORS.textMuted } }, "Payment Method"),
                    e("td", { align: "right", style: { fontWeight: "600" } }, paymentMethod)
                  ),
                  e("tr", null,
                    e("td", { style: { padding: "8px 0", color: COLORS.textMuted } }, "Transaction Reference"),
                    e("td", { align: "right", style: { fontWeight: "600" } }, referenceNumber)
                  ),
                  e("tr", { style: { borderTop: `1px solid ${COLORS.border}` } },
                    e("td", { style: { padding: "15px 0 8px 0", fontSize: "16px", fontWeight: "700", color: COLORS.navy } }, "Amount Paid"),
                    e("td", { align: "right", style: { padding: "15px 0 8px 0", fontSize: "18px", fontWeight: "700", color: COLORS.success } }, amountReceived)
                  ),
                  e("tr", null,
                    e("td", { style: { padding: "8px 0", fontSize: "14px", fontWeight: "600", color: COLORS.textMuted } }, "Remaining Balance"),
                    e("td", { align: "right", style: { padding: "8px 0", fontSize: "15px", fontWeight: "700", color: "#EF4444" } }, remainingBalance)
                  )
                )
              )
            )
          )
        )
      ),
      e("p", { style: { fontSize: "14px", color: COLORS.textMuted, textAlign: "center", fontStyle: "italic", margin: "0" } },
        "Should you have any questions regarding your outstanding balance or booking terms, please contact our accounts team."
      )
    )
  );
};

// ---------------------------------------------------------
// Template 5: Travel Documents
// ---------------------------------------------------------
const TravelDocumentsTemplate = ({ customerName, bookingId, documents, downloadUrl }: { customerName: string; bookingId: string; documents: string[]; downloadUrl: string }) => {
  return e(EmailLayout, {
    heroTitle: "Your Travel Documents are Ready!",
    heroSubtitle: "vouchers, tickets, and travel itinerary inside",
    previewText: `Dear ${customerName}, your final travel documents are now available for download.`
  },
    e("div", null,
      e("p", { style: { fontSize: "16px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } }, `Dear ${customerName},`),
      e("p", { style: { fontSize: "14px", color: COLORS.textDark, lineHeight: "1.6", margin: "0 0 25px 0" } },
        "Your trip is almost here! We have compiled all your final vouchers, flight tickets, and details. Please download them and keep them handy on your mobile device during travel."
      ),
      
      // Documents Checklist
      e("div", { style: { border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "20px", backgroundColor: "#F8FAFC", marginBottom: "30px" } },
        e("h3", { style: { fontSize: "15px", color: COLORS.navy, margin: "0 0 15px 0", fontWeight: "700" } }, "Uploaded Documents:"),
        e("table", { border: 0, cellPadding: "8", cellSpacing: 0, width: "100%" },
          e("tbody", null,
            documents.map((doc, i) => 
              e("tr", { key: i },
                e("td", { width: "30", valign: "top", align: "center", style: { color: COLORS.success, fontSize: "16px" } }, "✓"),
                e("td", { style: { fontSize: "14px", color: COLORS.textDark, fontWeight: "500" } }, doc)
              )
            )
          )
        )
      ),

      // CTA
      e("div", { style: { textAlign: "center", margin: "30px 0 10px 0" } },
        e("a", { href: downloadUrl, style: { backgroundColor: COLORS.navy, color: COLORS.gold, textDecoration: "none", padding: "14px 28px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", display: "inline-block", border: `1px solid ${COLORS.gold}` } }, "Download Documents Package")
      )
    )
  );
};

// ---------------------------------------------------------
// Main serve handler
// ---------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { event, lead_id, record } = body;

    if (!event || !lead_id) {
      return new Response(JSON.stringify({ error: "bad_request", message: "event and lead_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Processing CRM notification event: ${event} for Lead: ${lead_id}`);

    // 1. Fetch Lead Details
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadErr || !lead) {
      console.error(`Failed to fetch lead: ${lead_id}`, leadErr);
      throw new Error(`Lead not found: ${lead_id}`);
    }

    const customerEmail = lead.customer_email || lead.email;
    if (!customerEmail) {
      console.warn(`Lead has no email configured: ${lead_id}. Skipping email.`);
      return new Response(JSON.stringify({ success: false, message: "Lead has no email configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Fetch Latest Itinerary (needed for Quote/Confirmation/Documents)
    const { data: itinerary } = await supabaseAdmin
      .from("itineraries")
      .select("*")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let emailHtml = "";
    let emailSubject = "";

    // Generate specific email template content
    if (event === "lead_created") {
      emailSubject = "Thank You for Your Travel Enquiry – Ghumo Firoo Travels";
      
      const paxCount = `${lead.adult_count || 1} Adult(s)${lead.child_count ? `, ${lead.child_count} Child(ren)` : ""}`;
      const dates = lead.trip_start_date 
        ? `${lead.trip_start_date}${lead.trip_end_date ? ` to ${lead.trip_end_date}` : ""}` 
        : lead.travel_month || "To be finalized";
        
      emailHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(LeadAcknowledgementTemplate, {
          customerName: lead.customer_name || "Guest",
          destination: lead.destinations || lead.travel_interest || "Tour Package",
          travelDates: dates,
          numberOfTravellers: paxCount,
          leadReferenceNumber: lead.enquiry_number || lead.id.slice(0, 8).toUpperCase()
        })
      );
    } else if (event === "quote_created") {
      emailSubject = "Your Customized Travel Quote – Ghumo Firoo Travels";

      // Fetch itinerary hotels
      let hotels: HotelDetail[] = [];
      if (itinerary) {
        const { data: itinHotels } = await supabaseAdmin
          .from("itinerary_hotels")
          .select("*, hotel:hotels(hotel_name, city, hotel_category)")
          .eq("itinerary_id", itinerary.id);

        if (itinHotels) {
          hotels = itinHotels.map((ih: any) => ({
            name: ih.hotel?.hotel_name || ih.room_type || "Hotel stay",
            city: ih.hotel?.city || "Tour City",
            category: ih.hotel?.hotel_category,
            nights: ih.nights || 1
          }));
        }
      }

      const costValue = Number(lead.package_cost) || Number(lead.package_price) || (itinerary ? Number(itinerary.final_cost) : 0);
      const formattedCost = costValue > 0 ? `₹${costValue.toLocaleString("en-IN")}` : "Request Pricing";
      
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 7); // Valid for 7 days
      const formattedValidity = validityDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

      emailHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(QuoteEmailTemplate, {
          customerName: lead.customer_name || "Guest",
          destination: lead.destinations || "Your Destination",
          packageName: lead.package_name || (itinerary ? itinerary.itinerary_name : "Premium Holiday Package"),
          numberOfNights: lead.number_of_nights || (itinerary ? itinerary.total_nights : 3),
          hotels: hotels,
          packageCost: formattedCost,
          validityDate: formattedValidity,
          leadId: lead_id
        })
      );
    } else if (event === "booking_confirmed") {
      emailSubject = "Booking Confirmed! – Ghumo Firoo Travels";

      // Fetch primary hotel from itinerary
      let primaryHotel = "To be confirmed";
      if (itinerary) {
        const { data: itinHotels } = await supabaseAdmin
          .from("itinerary_hotels")
          .select("hotel:hotels(hotel_name)")
          .eq("itinerary_id", itinerary.id)
          .limit(1)
          .maybeSingle();
        if (itinHotels?.hotel?.hotel_name) {
          primaryHotel = itinHotels.hotel.hotel_name;
        }
      }

      const dates = lead.trip_start_date && lead.trip_end_date
        ? `${lead.trip_start_date} to ${lead.trip_end_date}`
        : "Dates to be confirmed";

      emailHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(BookingConfirmationTemplate, {
          bookingId: lead.enquiry_number || lead.id.slice(0, 8).toUpperCase(),
          passengerNames: lead.customer_name || "Guest",
          destination: lead.destinations || "Tour Destination",
          travelDates: dates,
          hotelName: primaryHotel,
          contactNumber: lead.customer_phone || "Not specified",
          emergencyNumber: "+91 99109 87264"
        })
      );
    } else if (event === "payment_received") {
      emailSubject = "Payment Receipt – Ghumo Firoo Travels";

      const paymentRecord = record || {};
      const receivedAmt = Number(paymentRecord.amount) || 0;
      
      // Calculate remaining balance
      const { data: payments } = await supabaseAdmin
        .from("payments")
        .select("amount")
        .eq("lead_id", lead_id)
        .eq("status", "Success");

      const totalPaid = payments ? payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) : receivedAmt;
      const packageCost = Number(lead.package_cost) || Number(lead.package_price) || 0;
      const remainingBalance = Math.max(0, packageCost - totalPaid);

      const payDate = paymentRecord.payment_date 
        ? new Date(paymentRecord.payment_date).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");

      emailHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PaymentReceiptTemplate, {
          customerName: lead.customer_name || "Guest",
          bookingId: lead.enquiry_number || lead.id.slice(0, 8).toUpperCase(),
          amountReceived: `₹${receivedAmt.toLocaleString("en-IN")}`,
          paymentDate: payDate,
          remainingBalance: `₹${remainingBalance.toLocaleString("en-IN")}`,
          paymentMethod: paymentRecord.payment_method || "Online Transfer",
          referenceNumber: paymentRecord.reference_number || "GF-TXN-" + Date.now().toString().slice(-6)
        })
      );
    } else if (event === "vouchers_sent") {
      emailSubject = "Your Travel Vouchers & Documents – Ghumo Firoo Travels";

      // Fetch uploaded documents
      const { data: docs } = await supabaseAdmin
        .from("documents")
        .select("name")
        .eq("lead_id", lead_id);

      const documentNames = docs && docs.length > 0 
        ? docs.map((d: any) => d.name)
        : ["Flight Tickets Confirmation", "Hotel Stay Vouchers", "Transfer Voucher Details", "Detailed Travel Itinerary"];

      emailHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(TravelDocumentsTemplate, {
          customerName: lead.customer_name || "Guest",
          bookingId: lead.enquiry_number || lead.id.slice(0, 8).toUpperCase(),
          documents: documentNames,
          downloadUrl: `https://ghumofiroo.com/vouchers/${lead_id}`
        })
      );
    } else {
      throw new Error(`Unsupported event type: ${event}`);
    }

    // Wrap in standard html tags if needed (renderToStaticMarkup already creates full layout)
    const finalHtml = `<!DOCTYPE html>${emailHtml}`;

    // Log the initial state in email_logs
    const { data: logEntry, error: logErr } = await supabaseAdmin
      .from("email_logs")
      .insert({
        recipient: customerEmail,
        subject: emailSubject,
        template: event,
        status: "pending",
        retry_count: 0,
        metadata: { lead_id, event, record_id: record?.id }
      })
      .select()
      .single();

    if (logErr) {
      console.error("Failed to insert email log entry:", logErr);
    }

    const logId = logEntry?.id;

    // 3. Resend Integration & Retry Loop
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured. Email will not be sent to:", customerEmail);
      if (logId) {
        await supabaseAdmin
          .from("email_logs")
          .update({ status: "failed", error_message: "RESEND_API_KEY not set" })
          .eq("id", logId);
      }
      return new Response(JSON.stringify({ success: true, warning: "RESEND_API_KEY not set" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let success = false;
    let errorDetail = "";
    let attempt = 0;
    const maxAttempts = 3;
    let resendEmailId = "";

    // Retry loop with simple backoff
    while (attempt < maxAttempts && !success) {
      attempt++;
      try {
        console.log(`Sending email via Resend: Attempt ${attempt} to ${customerEmail}`);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Ghumo Firoo Travels <noreply@ghumofiroo.com>",
            to: [customerEmail],
            subject: emailSubject,
            html: finalHtml
          })
        });

        if (res.ok) {
          success = true;
          const resData = await res.json();
          resendEmailId = resData.id;
          console.log(`Email successfully sent to ${customerEmail} on attempt ${attempt}. Resend ID: ${resendEmailId}`);
        } else {
          errorDetail = await res.text();
          console.error(`Resend API error (Attempt ${attempt}):`, errorDetail);
          // Wait before retrying (1s, 2s)
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      } catch (err: any) {
        errorDetail = err.message || "Unknown error";
        console.error(`Network or fetch error (Attempt ${attempt}):`, errorDetail);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // 4. Update logs in Supabase
    if (logId) {
      const currentMetadata = logEntry?.metadata || {};
      if (success) {
        await supabaseAdmin
          .from("email_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
            retry_count: attempt - 1,
            metadata: { ...currentMetadata, resend_email_id: resendEmailId }
          })
          .eq("id", logId);
      } else {
        await supabaseAdmin
          .from("email_logs")
          .update({
            status: "failed",
            error_message: errorDetail,
            last_attempt_at: new Date().toISOString(),
            retry_count: attempt - 1
          })
          .eq("id", logId);
      }
    }

    return new Response(JSON.stringify({ success, attempts: attempt, error: success ? null : errorDetail }), {
      status: success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e: any) {
    console.error("travel-crm-notifications exception:", e);
    return new Response(JSON.stringify({ error: "internal_error", message: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
