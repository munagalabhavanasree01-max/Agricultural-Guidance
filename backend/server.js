import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
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

app.post('/api/guidance', async (req, res) => {
  const { crop, location, query } = req.body;

  if (!crop || !location) {
    return res.status(400).json({ error: 'Crop and location are required.' });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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

    res.json(guidanceData);
  } catch (error) {
    console.error('Final error generating guidance:', error.message, error.cause);
    res.status(500).json({ error: 'Failed to generate agricultural guidance. Please try again.' });
  }
});

import http from 'http';

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
