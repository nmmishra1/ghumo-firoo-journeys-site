
import React from 'react';
import Layout from '@/components/Layout';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using the Ghumo Firoo Travels website and services, you agree to be bound by these 
              Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily access and use our website for personal, non-commercial purposes. 
              This license does not include:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for commercial purposes</li>
              <li>Attempting to reverse engineer any software</li>
              <li>Removing any copyright or proprietary notations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Use our services in compliance with applicable laws</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>Respect the rights of other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Availability</h2>
            <p className="text-gray-700">
              We strive to maintain the availability of our website and services, but we do not guarantee 
              uninterrupted access. We reserve the right to modify, suspend, or discontinue any aspect of 
              our services at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700">
              All content on this website, including text, graphics, logos, images, and software, is the 
              property of Ghumo Firoo Travels and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Content</h2>
            <p className="text-gray-700">
              By submitting content to our website (reviews, photos, etc.), you grant us a non-exclusive, 
              royalty-free license to use, modify, and distribute such content for promotional and operational purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please refer to our Privacy Policy for information about how 
              we collect, use, and protect your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              Ghumo Firoo Travels shall not be liable for any direct, indirect, incidental, consequential, or 
              punitive damages arising from your use of our services, even if we have been advised of the 
              possibility of such damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by and construed in accordance with the laws of India, and you irrevocably 
              submit to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at:
              <br />Email: info@ghumofiroo.com
              <br />Phone: +91 12345 67890
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of our services after changes are posted constitutes acceptance 
              of the new terms.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
