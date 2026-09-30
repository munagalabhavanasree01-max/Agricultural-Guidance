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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not defined in your environment variables.');
      }

      // Dynamically import to avoid breaking the frontend bundle if there are issues
      const { GoogleGenerativeAI, SchemaType } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);

      const schema = {
        type: SchemaType.OBJECT,
        properties: {
          cropInformation: { type: SchemaType.STRING, description: "General information about the crop." },
          suitableGrowingPeriod: { type: SchemaType.STRING, description: "The suitable growing period or season for the crop." },
          recommendedPlantingMonth: { type: SchemaType.STRING, description: "Explicitly mention the 6-month time period of the year when it will be most suitable and profitable to grow this crop." },
          fertilizerRecommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Fertilizer recommendations specifically using Indian fertilizer names like Urea, DAP, MOP, SSP, NPK, etc." },
          irrigationGuidance: { type: SchemaType.STRING, description: "Detailed irrigation guidance." },
          seasonalMarketDemand: { type: SchemaType.STRING, description: "Market demand analysis for the selected time period/season." },
          expectedHarvestingTime: { type: SchemaType.STRING, description: "The expected harvesting time/month based on the recommended planting month." },
          farmingSuggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Important farming suggestions or best practices." }
        },
        required: [
          "cropInformation", "suitableGrowingPeriod", "recommendedPlantingMonth",
          "fertilizerRecommendations", "irrigationGuidance", "seasonalMarketDemand",
          "expectedHarvestingTime", "farmingSuggestions"
        ]
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });

      const { crop, location, query } = formData;
      const promptText = `You are an expert agricultural scientist and meteorologist. Provide agricultural guidance for growing ${crop} in ${location}. 
      Additional context or specific query from user: ${query || 'None'}.
      CRITICAL INSTRUCTIONS:
      1. Deeply analyze the specific local climate, historical weather patterns, and present climatic conditions of '${location}' for the specific crop '${crop}'.
      2. Consider regional monsoon behaviors, water availability, and real-world risks (such as cyclones, droughts, or extreme heat) that affect '${location}'.
      3. Determine the EXACT 6-month time period that is most profitable and practical for growing '${crop}' in '${location}', considering peak water availability and risk avoidance.
      4. In the recommendedPlantingMonth field, explicitly state this 6-month period (e.g., "Month to Month") and briefly explain why it is the best window based on local weather and water.
      5. Ensure your analysis is strictly tailored to the requested crop and location.
      6. Make sure fertilizer recommendations use Indian market names (e.g. Urea, DAP, MOP, SSP, NPK).`;

      const result = await model.generateContent(promptText);
      const responseText = result.response.text();
      const guidanceData = JSON.parse(responseText);
      
      setResultData(guidanceData);
    } catch (err) {
      console.error(err);
      setError(
        err.message || 
        'Failed to generate guidance. Please try again.'
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
          <p className="text-green-100 text-sm hidden sm:block">AI-Powered Agricultural Guidance.</p>
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
