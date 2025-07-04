
import React from 'react';
import Layout from '@/components/Layout';

const TermsConditions = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Booking Terms</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Booking Confirmation</h3>
            <p className="text-gray-700 mb-4">
              All bookings are subject to availability and confirmation. A booking is confirmed only when we send 
              you a written confirmation with payment receipt and tour voucher.
            </p>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Terms</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>25% advance payment required to confirm booking</li>
              <li>Full payment required 30 days before departure for international tours</li>
              <li>Full payment required 15 days before departure for domestic tours</li>
              <li>Late payment may result in booking cancellation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cancellation Policy</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Customer Cancellation</h3>
            <p className="text-gray-700 mb-2">Cancellation charges apply as follows:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>45+ days before departure: 10% of total tour cost</li>
              <li>31-44 days before departure: 25% of total tour cost</li>
              <li>16-30 days before departure: 50% of total tour cost</li>
              <li>8-15 days before departure: 75% of total tour cost</li>
              <li>0-7 days before departure: 100% of total tour cost</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">Company Cancellation</h3>
            <p className="text-gray-700">
              We reserve the right to cancel any tour due to insufficient bookings, natural disasters, 
              political unrest, or other circumstances beyond our control. In such cases, full refund 
              will be provided.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Travel Documents</h2>
            <p className="text-gray-700 mb-4">Customers are responsible for:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Valid passport with minimum 6 months validity</li>
              <li>Appropriate visas and permits</li>
              <li>Travel insurance (highly recommended)</li>
              <li>Health certificates and vaccinations as required</li>
              <li>Compliance with customs and immigration requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Tour Inclusions & Exclusions</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Typically Included</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Accommodation as per itinerary</li>
              <li>Meals as specified in the package</li>
              <li>Transportation as mentioned</li>
              <li>Sightseeing and entrance fees (unless specified)</li>
              <li>Professional tour guide services</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">Typically Excluded</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>International/domestic airfare (unless specified)</li>
              <li>Personal expenses and shopping</li>
              <li>Travel insurance</li>
              <li>Visa fees and documentation</li>
              <li>Tips and gratuities</li>
              <li>Any services not mentioned in inclusions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Health & Safety</h2>
            <p className="text-gray-700 mb-4">
              Customers must disclose any medical conditions that may affect their ability to participate 
              in the tour. We reserve the right to refuse participation if we believe it poses a risk to 
              the individual or group.
            </p>
            <p className="text-gray-700">
              All outdoor activities are undertaken at the participant's own risk. We recommend appropriate 
              travel insurance coverage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Itinerary Changes</h2>
            <p className="text-gray-700">
              We reserve the right to modify itineraries due to weather conditions, political situations, 
              flight schedules, or other circumstances beyond our control. We will make every effort to 
              provide suitable alternatives.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Complaints & Feedback</h2>
            <p className="text-gray-700">
              Any complaints must be reported immediately to our tour representative. Post-tour complaints 
              must be submitted in writing within 30 days of tour completion for proper investigation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Force Majeure</h2>
            <p className="text-gray-700">
              We are not responsible for any failure to perform our obligations due to acts of God, 
              natural disasters, war, terrorism, government actions, or other events beyond our reasonable control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Liability Limitation</h2>
            <p className="text-gray-700">
              Our liability is limited to the cost of the tour package. We are not liable for any loss, 
              damage, injury, or delay caused by third-party service providers or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700">
              For any queries regarding these terms and conditions, please contact us at:
              <br /><strong>Ghumo Firoo Travels</strong>
              <br /><strong>Address:</strong> Shop No. 210, 2nd Floor, Pratap Complex
              <br />Metro Gate Number 3, near Munirka
              <br />Baba Gangnath Market, Munirka
              <br />New Delhi, Delhi 110067
              <br /><strong>Phone:</strong> 9910987264 | 9870229792
              <br /><strong>Email:</strong> info@ghumofiroo.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;
