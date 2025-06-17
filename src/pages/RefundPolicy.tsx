
import React from 'react';
import Layout from '@/components/Layout';

const RefundPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Refund Policy</h2>
            <p className="text-gray-700 mb-4">
              At Ghumo Firoo Travels, we understand that travel plans can change. Our refund policy is designed 
              to be fair while accounting for the non-refundable costs we incur from our suppliers.
            </p>
            <p className="text-gray-700">
              All refund requests must be submitted in writing via email to info@ghumofiroo.com with your 
              booking reference number and reason for cancellation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Eligibility</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Eligible for Refund</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Cancellation by Ghumo Firoo Travels due to insufficient bookings</li>
              <li>Natural disasters or force majeure events</li>
              <li>Government travel advisories or restrictions</li>
              <li>Customer cancellation within the allowed timeframe</li>
              <li>Service failures that cannot be rectified</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Not Eligible for Refund</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>No-show at departure point</li>
              <li>Voluntary departure during the tour</li>
              <li>Denial of boarding by airlines due to customer reasons</li>
              <li>Visa rejection due to incomplete documentation</li>
              <li>Medical conditions not disclosed at booking</li>
              <li>Change of mind after the free cancellation period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Timeline</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Domestic Tours</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>30+ days before departure: 90% refund</li>
              <li>15-29 days before departure: 75% refund</li>
              <li>8-14 days before departure: 50% refund</li>
              <li>4-7 days before departure: 25% refund</li>
              <li>0-3 days before departure: No refund</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">International Tours</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>45+ days before departure: 90% refund</li>
              <li>31-44 days before departure: 75% refund</li>
              <li>16-30 days before departure: 50% refund</li>
              <li>8-15 days before departure: 25% refund</li>
              <li>0-7 days before departure: No refund</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Processing Time</h2>
            <p className="text-gray-700 mb-4">Refund processing times:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Credit/Debit Card: 7-14 business days</li>
              <li>Bank Transfer: 3-7 business days</li>
              <li>Online Payment Wallets: 2-5 business days</li>
              <li>Cash/Cheque: 7-10 business days</li>
            </ul>
            <p className="text-gray-700">
              Please note that actual credit to your account may take additional time depending on your 
              bank's processing policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partial Refunds</h2>
            <p className="text-gray-700 mb-4">
              In cases where only part of the tour is cancelled or modified, refunds will be calculated 
              based on the unused portion of the package, subject to our standard cancellation charges.
            </p>
            <p className="text-gray-700">
              If you join the tour late or leave early, no refund will be provided for the unused services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Travel Insurance</h2>
            <p className="text-gray-700">
              We strongly recommend purchasing comprehensive travel insurance at the time of booking. 
              Travel insurance may cover additional cancellation scenarios not covered by our refund policy, 
              including medical emergencies, job loss, and other unforeseen circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Refund Method</h2>
            <p className="text-gray-700">
              Refunds will be processed using the same payment method used for the original booking. 
              If the original payment method is no longer available, alternative arrangements will be 
              made after proper verification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Currency Exchange</h2>
            <p className="text-gray-700">
              For international bookings paid in foreign currency, refunds will be calculated at the 
              exchange rate prevailing on the date of refund processing, not the original booking date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-700">
              In case of any disputes regarding refunds, customers can raise the issue with our customer 
              service team. If the dispute cannot be resolved internally, it will be subject to arbitration 
              as per Indian law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Special Circumstances</h2>
            <p className="text-gray-700 mb-4">
              In exceptional circumstances such as family emergencies, serious illness, or natural disasters 
              affecting the customer's ability to travel, we may consider special refund arrangements on a 
              case-by-case basis.
            </p>
            <p className="text-gray-700">
              Such requests must be supported by appropriate documentation and will be evaluated at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-700">
              For refund requests or queries about this policy, please contact us:
              <br /><strong>Email:</strong> info@ghumofiroo.com
              <br /><strong>Phone:</strong> +91 12345 67890
              <br /><strong>Office Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM
              <br /><strong>Address:</strong> 123 Travel Street, Mumbai, Maharashtra 400001
            </p>
            <p className="text-gray-700 mt-4">
              Please include your booking reference number and reason for refund request in all communications.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
