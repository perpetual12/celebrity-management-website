import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCelebrityProfile = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    bio: '',
    profileImage: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Predefined categories
  const categories = [
    'Actor',
    'Musician',
    'Athlete',
    'Influencer',
    'Author',
    'Comedian',
    'Chef',
    'Business Leader',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/celebrities', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create celebrity profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Celebrity Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            rows="6"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="profileImage">
            Profile Image URL
          </label>
          <input
            type="url"
            id="profileImage"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-gray-600 mt-1">
            Enter a URL for your profile image. Leave blank to use a default image.
          </p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
};

export default CreateCelebrityProfile;