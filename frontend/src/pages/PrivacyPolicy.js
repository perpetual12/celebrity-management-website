import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Celebrity Connect ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Celebrity Connect, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Account information (username, email address, password)</li>
              <li>Profile information (full name, bio, profile image)</li>
              <li>Contact information for support requests</li>
              <li>Payment information for premium services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Messages sent through our platform</li>
              <li>Appointment bookings and preferences</li>
              <li>Platform usage patterns and interactions</li>
              <li>Device information and IP addresses</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Log data (access times, pages viewed, browser type)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location data (if permitted by your device)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To facilitate connections between users and celebrities</li>
              <li>To process appointment bookings and payments</li>
              <li>To send notifications about your account and activities</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To improve our platform and develop new features</li>
              <li>To prevent fraud and ensure platform security</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">With Celebrities</h3>
            <p className="text-gray-700 mb-4">
              When you book appointments or send messages, relevant information is shared with the celebrity's management team to facilitate the interaction.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
            <p className="text-gray-700 mb-4">
              We may share information with trusted third-party service providers who assist us in operating our platform, processing payments, or providing customer support.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Requirements</h3>
            <p className="text-gray-700">
              We may disclose your information if required by law, court order, or to protect the rights, property, or safety of Celebrity Connect, our users, or others.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies help us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Remember your login status and preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookie settings through your browser preferences, but disabling cookies may affect platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Celebrity Connect is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> privacy@celebrityconnect.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Celebrity Ave, Hollywood, CA 90210</p>
            </div>
          </section>

          {/* Footer Navigation */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link to="/help" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
                Help Center
              </Link>
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
                Contact Us
              </Link>
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
                Terms of Service
              </Link>
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
