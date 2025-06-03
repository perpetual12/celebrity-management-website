import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'messages', name: 'Messages', icon: '💬' },
    { id: 'payments', name: 'Payments & Billing', icon: '💳' },
    { id: 'technical', name: 'Technical Issues', icon: '🔧' },
    { id: 'celebrities', name: 'Celebrity Profiles', icon: '⭐' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Sign Up" button on the homepage and fill in your details. You\'ll receive a welcome notification once your account is created.'
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page and click on the "Profile" tab. You can update your username, email, full name, bio, and upload a profile image.'
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'In your Profile settings, go to the "Settings" tab and click "Delete Account" in the Danger Zone. This action is permanent and cannot be undone.'
    },
    {
      id: 4,
      category: 'appointments',
      question: 'How do I book an appointment with a celebrity?',
      answer: 'Browse celebrities, select one you\'d like to meet, and fill out the appointment booking form with your preferred date and purpose.'
    },
    {
      id: 5,
      category: 'appointments',
      question: 'What happens after I book an appointment?',
      answer: 'Your appointment will be pending until an admin reviews and approves it. You\'ll receive a notification when the status changes.'
    },
    {
      id: 6,
      category: 'appointments',
      question: 'Can I cancel or reschedule an appointment?',
      answer: 'Currently, appointment changes must be handled through our support team. Contact us with your appointment details.'
    },
    {
      id: 7,
      category: 'messages',
      question: 'How do I send a message to a celebrity?',
      answer: 'Visit the celebrity\'s profile page and use the messaging form to send them a direct message.'
    },
    {
      id: 8,
      category: 'messages',
      question: 'Will celebrities respond to my messages?',
      answer: 'Celebrity responses are managed by our admin team. You\'ll receive notifications when you get replies.'
    },
    {
      id: 9,
      category: 'payments',
      question: 'How much does it cost to use Celebrity Connect?',
      answer: 'Creating an account and browsing celebrities is free. Specific appointment fees may apply depending on the celebrity and type of meeting.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'I\'m having trouble uploading my profile image',
      answer: 'Make sure your image is in JPEG, PNG, GIF, or WebP format and under 5MB. Try refreshing the page and uploading again.'
    },
    {
      id: 11,
      category: 'celebrities',
      question: 'How can I become a celebrity on the platform?',
      answer: 'Celebrity accounts require admin approval. Contact our support team if you\'re a verified public figure interested in joining.'
    },
    {
      id: 12,
      category: 'technical',
      question: 'Why am I not receiving notifications?',
      answer: 'Check your notification settings and ensure you\'re logged in. Notifications appear in your Notifications page when appointments are approved or you receive messages.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get help with Celebrity Connect
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition duration-300 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/contact"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300"
          >
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="text-gray-600">Get personalized help from our support team</p>
          </Link>
          
          <Link
            to="/celebrities"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300"
          >
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Browse Celebrities</h3>
            <p className="text-gray-600">Explore our celebrity profiles and book appointments</p>
          </Link>
          
          <Link
            to="/profile"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Account Settings</h3>
            <p className="text-gray-600">Manage your profile and account preferences</p>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 mt-2">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or browse different categories
              </p>
              <Link
                to="/contact"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Contact Support
              </Link>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/contact"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Contact Support
            </Link>
            <a
              href="mailto:support@celebrityconnect.com"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition duration-300"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
