import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Celebrity Connect. These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using Celebrity Connect, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Definitions</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>"Platform"</strong> refers to the Celebrity Connect website and mobile applications</li>
              <li><strong>"Services"</strong> refers to all features and functionality provided by Celebrity Connect</li>
              <li><strong>"User"</strong> refers to any person who accesses or uses our Platform</li>
              <li><strong>"Celebrity"</strong> refers to verified public figures available for bookings on our Platform</li>
              <li><strong>"Content"</strong> refers to all text, images, videos, and other materials on our Platform</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Celebrity Connect, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Be at least 13 years of age (or the minimum age in your jurisdiction)</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide truthful, accurate, and complete information</li>
              <li>Keep your account information up to date</li>
              <li>Maintain the confidentiality of your password</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* Platform Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use our Platform for lawful purposes only. You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm other users or celebrities</li>
              <li>Send spam, unsolicited messages, or promotional content</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Upload malicious software or harmful content</li>
              <li>Interfere with the Platform's operation or security</li>
              <li>Use automated tools to access or scrape our Platform</li>
            </ul>
          </section>

          {/* Celebrity Interactions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Celebrity Interactions and Bookings</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Appointment Bookings</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>All appointments are subject to celebrity availability and approval</li>
              <li>Booking requests do not guarantee confirmed appointments</li>
              <li>Cancellation and refund policies vary by celebrity and event type</li>
              <li>You must arrive on time and follow all specified guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Messaging</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Messages must be respectful and appropriate</li>
              <li>Celebrity responses are managed by their representatives</li>
              <li>We reserve the right to monitor and moderate messages</li>
              <li>Inappropriate messages may result in account suspension</li>
            </ul>
          </section>

          {/* Payments and Fees */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Regarding payments and fees:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Basic platform access is free for all users</li>
              <li>Premium appointments may require payment</li>
              <li>All fees are clearly displayed before booking</li>
              <li>Payments are processed securely through third-party providers</li>
              <li>Refunds are subject to our refund policy and celebrity terms</li>
              <li>We reserve the right to change fees with notice</li>
            </ul>
          </section>

          {/* Content and Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content and Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Content</h3>
            <p className="text-gray-700 mb-4">
              All Platform content, including text, graphics, logos, and software, is owned by Celebrity Connect or our licensors and protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">User Content</h3>
            <p className="text-gray-700 mb-4">
              By uploading content to our Platform, you grant us a non-exclusive, worldwide license to use, display, and distribute your content in connection with our services.
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</Link> to understand how we collect, use, and protect your information.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Celebrity Connect is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Guarantees of uninterrupted or error-free service</li>
              <li>Warranties regarding the accuracy of content or information</li>
              <li>Guarantees of celebrity availability or response</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Celebrity Connect shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Platform or services.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account at any time for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Violation of these Terms</li>
              <li>Inappropriate behavior or content</li>
              <li>Suspected fraudulent activity</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You may delete your account at any time through your profile settings.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notifications. Continued use of our services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of California, United States. Any disputes will be resolved in the courts of Los Angeles County, California.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> legal@celebrityconnect.com</p>
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
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800 transition duration-300">
                Privacy Policy
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

export default TermsOfService;
