import React, { useState } from 'react';
import axios from 'axios';
import { Leaf } from 'lucide-react';
import GuidanceForm from './components/GuidanceForm';
import ResultCards from './components/ResultCards';
import logoImg from './assets/logo.png';

function App() {
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGuidance = async (formData) => {
    setIsLoading(true);
    setError('');
    setResultData(null);
    
    try {
      // In a real app, URL should be in env
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/guidance`, formData);
      setResultData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Failed to fetch guidance. Please make sure the backend server is running and the Gemini API key is valid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="AgriNLP Logo" className="h-12 w-auto bg-white rounded-md p-1 shadow-sm" />
            <h1 className="text-2xl font-bold tracking-tight">AgriNLP</h1>
          </div>
          <p className="text-green-100 text-sm hidden sm:block">AI-Powered Agricultural Guidance</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
            Enter your crop details and location below. Our advanced AI engine (powered by Google Gemini) will analyze your inputs and provide professional, tailored agricultural advice.
          </p>
          <GuidanceForm onSubmit={fetchGuidance} isLoading={isLoading} />
        </div>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <ResultCards data={resultData} />
      </main>
    </div>
  );
}

export default App;
