import OpenAI from "openai";

interface PilotRecommendation {
  fatigue_analysis: string;
  risk_factors: string[];
  recommendations: string[];
  flight_status: "FIT_TO_FLY" | "MONITOR" | "RESTRICT";
  confidence_score: number;
}

export async function generatePilotRecommendations(pilotData: any): Promise<PilotRecommendation> {
  try {
    const response = await fetch('/api/mistral/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pilotData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to generate recommendations');
    }

    const result = await response.json();
    return result as PilotRecommendation;
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    throw new Error(error.message || 'Failed to generate recommendations. Please try again.');
  }
}

export type { PilotRecommendation };