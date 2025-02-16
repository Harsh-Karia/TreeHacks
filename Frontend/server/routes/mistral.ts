import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const mistralClient = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

// Function to get baseline metrics based on age and gender
function getBaselineMetrics(age: number, gender: 'm' | 'w' | 'd') {
  // Age categories
  const isYoung = age < 30;
  const isMidAge = age >= 30 && age < 40;

  // Base metrics adjusted by age and gender
  const baseMetrics = {
    heartRateVariability: {
      baseline: gender === 'w' ? 
        (isYoung ? 76 : isMidAge ? 72 : 68) :
        (isYoung ? 78 : isMidAge ? 74 : 70),
      min: gender === 'w' ? 
        (isYoung ? 65 : isMidAge ? 60 : 55) :
        (isYoung ? 68 : isMidAge ? 63 : 58)
    },
    bloodPressure: {
      systolic: gender === 'w' ? 
        (isYoung ? 110 : isMidAge ? 115 : 120) :
        (isYoung ? 115 : isMidAge ? 120 : 125)
    },
    oxygenLevel: 98,
    g_forceLimit: isYoung ? 9 : isMidAge ? 8 : 7
  };

  return baseMetrics;
}

router.post('/recommendations', async (req, res) => {
  try {
    const { debrief, profile, ...pilotData } = req.body;
    const baselineMetrics = profile ? getBaselineMetrics(profile.age, profile.gender) : null;

    const response = await mistralClient.chat.completions.create({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert aviation medical officer with deep knowledge of pilot physiology and US military flight protocols. Provide precise, data-driven analysis with clear numerical comparisons to baselines."
        },
        {
          role: "user",
          content: `Analyze this pilot's metrics against standard baselines and provide structured recommendations:

Pilot Profile:
- Age: ${profile?.age || 'N/A'}
- Gender: ${profile?.gender || 'N/A'}
${baselineMetrics ? `
Baseline Metrics (Age/Gender Adjusted):
- Heart Rate Variability: ${baselineMetrics.heartRateVariability.baseline} ms
- Systolic Blood Pressure: ${baselineMetrics.bloodPressure.systolic} mmHg
- Oxygen Level: ${baselineMetrics.oxygenLevel}%
- G-Force Limit: ${baselineMetrics.g_forceLimit}G` : ''}

Current Metrics:
- Heart Rate Variability: ${pilotData.heartRateVar} ms
- Systolic Blood Pressure: ${pilotData.bloodPressure.sys} mmHg
- Oxygen Level: ${pilotData.oxygenLevel}%
- G-Force Exposure: ${pilotData.g_force}G
- Performance Score: ${pilotData.performanceScore}%
- Readiness Score: ${pilotData.readinessScore}%

Debrief Metrics:
- Critical Situations: ${debrief?.criticalSituations || 'N/A'}
- Average Response Time: ${debrief?.avgResponseTime || 'N/A'}ms
- Time in High G-Force: ${debrief?.timeInHighGs || 'N/A'}ms

Please provide:
1. Structured fatigue analysis with:
   - Current metrics compared to baselines
   - Percentage deviations from normal ranges
   - Status indicators (above/below/normal)
   - Key bullet-point findings
2. Three key risk factors (cognitive/cardiovascular/physical)
3. Specific recommendations based on US Air Force protocols
4. Flight readiness status

Format as JSON:
{
  "fatigue_analysis": {
    "current_metrics": [
      {
        "label": "string",
        "value": number,
        "baseline": number,
        "delta": number,
        "status": "above|below|normal"
      }
    ],
    "key_findings": ["finding1", "finding2", ...]
  },
  "risk_factors": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "low|medium|high",
      "icon": "brain|heart|activity"
    }
  ],
  "recommendations": ["rec1", "rec2", ...],
  "flight_status": "FIT_TO_FLY|MONITOR|RESTRICT",
  "confidence_score": number
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    res.json(JSON.parse(content));
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

export default router;