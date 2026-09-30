import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    cropInformation: {
      type: SchemaType.STRING,
      description: "General information about the crop.",
    },
    suitableGrowingPeriod: {
      type: SchemaType.STRING,
      description: "The suitable growing period or season for the crop.",
    },
    recommendedPlantingMonth: {
      type: SchemaType.STRING,
      description: "Explicitly mention the 6-month time period of the year when it will be most suitable and profitable to grow this crop.",
    },
    fertilizerRecommendations: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Fertilizer recommendations specifically using Indian fertilizer names like Urea, DAP, MOP, SSP, NPK, etc.",
    },
    irrigationGuidance: {
      type: SchemaType.STRING,
      description: "Detailed irrigation guidance.",
    },
    seasonalMarketDemand: {
      type: SchemaType.STRING,
      description: "Market demand analysis for the selected time period/season.",
    },
    expectedHarvestingTime: {
      type: SchemaType.STRING,
      description: "The expected harvesting time/month based on the recommended planting month.",
    },
    farmingSuggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Important farming suggestions or best practices.",
    }
  },
  required: [
    "cropInformation", "suitableGrowingPeriod", "recommendedPlantingMonth",
    "fertilizerRecommendations", "irrigationGuidance", "seasonalMarketDemand",
    "expectedHarvestingTime", "farmingSuggestions"
  ]
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { crop, location, query } = req.body;

  if (!crop || !location) {
    return res.status(400).json({ error: 'Crop and location are required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const prompt = `You are an expert agricultural scientist and meteorologist. Provide agricultural guidance for growing ${crop} in ${location}. 
    Additional context or specific query from user: ${query || 'None'}.
    CRITICAL INSTRUCTIONS:
    1. Deeply analyze the specific local climate, historical weather patterns, and present climatic conditions of '${location}' for the specific crop '${crop}'.
    2. Consider regional monsoon behaviors, water availability, and real-world risks (such as cyclones, droughts, or extreme heat) that affect '${location}'.
    3. Determine the EXACT 6-month time period that is most profitable and practical for growing '${crop}' in '${location}', considering peak water availability and risk avoidance.
    4. In the recommendedPlantingMonth field, explicitly state this 6-month period (e.g., "Month to Month") and briefly explain why it is the best window based on local weather and water.
    5. Ensure your analysis is strictly tailored to the requested crop and location.
    6. Make sure fertilizer recommendations use Indian market names (e.g. Urea, DAP, MOP, SSP, NPK).`;

    let guidanceData = null;
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        guidanceData = JSON.parse(responseText);
        break; // Success, exit loop
      } catch (err) {
        lastError = err;
        console.error(`Attempt failed (${4 - retries}/3):`, err.message, err.cause);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
        }
      }
    }

    if (!guidanceData) {
      throw lastError || new Error('All generation attempts failed');
    }

    return res.status(200).json(guidanceData);
  } catch (error) {
    console.error('Final error generating guidance:', error.message, error.cause);
    return res.status(500).json({ error: `Failed to generate agricultural guidance. Please try again. Details: ${error.message}` });
  }
}
