import React, { useState } from 'react';
import { Sprout, MapPin, MessageSquare, Loader2 } from 'lucide-react';

const GuidanceForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    crop: '',
    location: '',
    query: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
        <Sprout className="mr-2 h-6 w-6 text-green-600" />
        Get Agricultural Guidance
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Sprout className="w-4 h-4 mr-1 text-green-600" /> Crop Name *
          </label>
          <input
            type="text"
            name="crop"
            required
            placeholder="e.g., Rice, Wheat, Tomato"
            value={formData.crop}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-green-600" /> Location *
          </label>
          <input
            type="text"
            name="location"
            required
            placeholder="e.g., Punjab, Andhra Pradesh, Maharashtra"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MessageSquare className="w-4 h-4 mr-1 text-green-600" /> Additional Context / Time Period (Optional)
          </label>
          <textarea
            name="query"
            placeholder="e.g., What are the best practices for the upcoming Kharif season?"
            value={formData.query}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Analyzing with Gemini AI...
            </>
          ) : (
            'Generate Guidance'
          )}
        </button>
      </form>
    </div>
  );
};

export default GuidanceForm;
