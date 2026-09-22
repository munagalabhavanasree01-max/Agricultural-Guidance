import React from 'react';
import { 
  Info, 
  Calendar, 
  CalendarDays, 
  FlaskConical, 
  Droplets, 
  TrendingUp, 
  Lightbulb,
  Sprout
} from 'lucide-react';

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3 text-green-700">
      <Icon className="w-5 h-5 mr-2" />
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <div className="text-gray-700 whitespace-pre-wrap">{children}</div>
  </div>
);

const ListCard = ({ title, icon: Icon, items }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3 text-green-700">
      <Icon className="w-5 h-5 mr-2" />
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <ul className="list-disc list-inside text-gray-700 space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="mb-1">{item}</li>
      ))}
    </ul>
  </div>
);

const ResultCards = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Agricultural Guidance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Crop Information" icon={Info}>
          {data.cropInformation}
        </Card>
        
        <Card title="Suitable Growing Period" icon={Calendar}>
          {data.suitableGrowingPeriod}
        </Card>
        
        <Card title="Recommended Planting Month" icon={CalendarDays}>
          {data.recommendedPlantingMonth}
        </Card>

        <Card title="Expected Harvesting Time" icon={Sprout}>
          {data.expectedHarvestingTime}
        </Card>
        
        <Card title="Irrigation Guidance" icon={Droplets}>
          {data.irrigationGuidance}
        </Card>
        
        <div className="md:col-span-2">
          <ListCard 
            title="Fertilizer Recommendations (Indian Context)" 
            icon={FlaskConical} 
            items={data.fertilizerRecommendations} 
          />
        </div>
        
        <Card title="Seasonal Market Demand" icon={TrendingUp}>
          {data.seasonalMarketDemand}
        </Card>
        
        <div className="md:col-span-2">
          <ListCard 
            title="Important Farming Suggestions" 
            icon={Lightbulb} 
            items={data.farmingSuggestions} 
          />
        </div>
      </div>
    </div>
  );
};

export default ResultCards;
