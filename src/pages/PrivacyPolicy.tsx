
import React from 'react';
import Layout from '@/components/Layout';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Ghumo Firoo Travels ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name, email address, phone number</li>
              <li>Passport and travel document details</li>
              <li>Payment and billing information</li>
              <li>Travel preferences and requirements</li>
              <li>Emergency contact information</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>IP address and browser information</li>
              <li>Device and usage data</li>
              <li>Cookies and tracking technologies</li>
              <li>Location data (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>To provide and improve our travel services</li>
              <li>To process bookings and payments</li>
              <li>To communicate with you about your travel arrangements</li>
              <li>To send promotional materials (with your consent)</li>
              <li>To comply with legal obligations</li>
              <li>To ensure the security of our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Travel partners and suppliers (airlines, hotels, tour operators)</li>
              <li>Payment processors and financial institutions</li>
              <li>Government authorities when required by law</li>
              <li>Service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Protection Rights (GDPR)</h2>
            <p className="text-gray-700 mb-4">Under the General Data Protection Regulation (GDPR), you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Erase your data</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal data against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
              the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this 
              privacy policy or as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700">
              Our website uses cookies to enhance your browsing experience. You can control cookie settings 
              through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this privacy policy or our data practices, please contact us at:
              <br />Email: info@ghumofiroo.com
              <br />Phone: +91 12345 67890
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
