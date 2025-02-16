import { z } from "zod";

import numericMetrics from "../components/debrief-screen";
import axios from "axios";

// Function to initialize heart rate data
async function initializeHeartRate(): Promise<void> {
  try {
    const response = await axios.get(
      "https://cd4d-2607-f6d0-ced-5b4-88b7-94dc-28f-2968.ngrok-free.app/initializeHRSamples",
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
    console.log("✅ Heart rate data initialized:", response.data);
  } catch (error) {
    console.error("❌ Error initializing heart rate data:", error);
  }
}

// Function to fetch and update heart rate
// Hardcoded heart rate sequence for Lt. Martinez
const martinezHeartRates = [80, 84, 89, 96, 101, 103, 105, 109, 112, 100, 111, 106, 117, 108, 109, 110, 120];
let martinezHeartRateIndex = 0;

async function updatePilotHeartRate(pilotId: string): Promise<void> {
  // Find the pilot to update
  const pilotIndex = mockPilots.findIndex((p) => p.id === pilotId);
  if (pilotIndex === -1) {
    console.error("Pilot not found:", pilotId);
    return;
  }

  if (pilotId === "P001") { // Lt. Martinez's ID
    const newHeartRate = martinezHeartRates[martinezHeartRateIndex];
    martinezHeartRateIndex = (martinezHeartRateIndex + 1) % martinezHeartRates.length;
    mockPilots[pilotIndex].vitals.heartRate = newHeartRate;
    console.log(
      `✅ Updated heart rate for ${mockPilots[pilotIndex].name}: ${newHeartRate}`,
    );
  } else {
    try {
      const response = await axios.get(
        "https://cd4d-2607-f6d0-ced-5b4-88b7-94dc-28f-2968.ngrok-free.app/getNextHR",
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
      const newHeartRate: number = response.data.bpm;
      mockPilots[pilotIndex].vitals.heartRate = newHeartRate;
      console.log(
        `✅ Updated heart rate for ${mockPilots[pilotIndex].name}: ${newHeartRate}`,
      );
    } catch (error) {
      console.error("❌ Error fetching heart rate:", error);
    }
  }
}

// Function to start polling heart rate updates
function startHeartRatePolling(pilotId: string, interval: number = 2000) {
  setInterval(() => updatePilotHeartRate(pilotId), interval);
}

// 🚀 Initialize HR data & start polling for Pilot P001
async function initAndStartHeartRatePolling(pilotId: string) {
  await initializeHeartRate(); // Ensure HR samples are loaded first
  startHeartRatePolling(pilotId, 2000); // Start fetching HR every 2s
}

// Start the process
initAndStartHeartRatePolling("P001");

// Function to fetch sleep score and update oxygen level
async function updatePilotOxygenLevel(pilotId: string): Promise<void> {
  try {
    const response = await axios.get(
      "https://5e5a-2607-f6d0-ced-5b4-88b7-94dc-28f-2968.ngrok-free.app/getSleepScore",
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
    const newOxygenLevel: number = response.data; // Expecting a numeric response (e.g., 83.75)

    // Find the pilot to update
    const pilotIndex = mockPilots.findIndex((p) => p.id === pilotId);
    if (pilotIndex === -1) {
      console.error("Pilot not found:", pilotId);
      return;
    }

    // Update oxygen level in the mockPilots array
    mockPilots[pilotIndex].vitals.oxygenLevel = newOxygenLevel;

    console.log(
      `✅ Updated oxygen level for ${mockPilots[pilotIndex].name}: ${newOxygenLevel}`,
    );
  } catch (error) {
    console.error("❌ Error fetching oxygen level:", error);
  }
}

// Function to start polling oxygen level updates
function startOxygenLevelPolling(pilotId: string, interval: number = 5000) {
  setInterval(() => updatePilotOxygenLevel(pilotId), interval);
}

// 🚀 Start polling for Pilot P001 when this file is loaded
// startOxygenLevelPolling("P001");

// Pilot data structure with TypeScript types
export interface Pilot {
  // Identification
  id: string;
  terra_user_id: string; // For future Garmin API integration
  garmin_id: string;

  // Constants
  readonly name: string;
  readonly role: string;
  readonly monthsOfExperience: number;
  readonly gender: "m" | "w" | "d";
  readonly age: number;
  readonly height: number; // in cm
  readonly weight: number; // in kg
  readonly rank: string;

  // Dynamic data
  status: "active" | "standby";
  vitals: {
    heartRate: number;
    averageRestingHeartRate: number;
    heartRateVar: number;
    bloodPressure: {
      sys: number;
      dia: number;
    };
    oxygenLevel: number;
    bodyTemp: number;
    g_force: number;
    minutesOfActivity: number;

    calculatedMetrics: {
      readinessScore: number;
      performanceScore: number;
      successScore: number;
    };
  };
}

// Add updatePilotStatus function
export function updatePilotStatus(
  pilots: Pilot[],
  pilotId: string,
  newStatus: "active" | "standby",
): Pilot[] {
  return pilots.map((pilot) =>
    pilot.id === pilotId ? { ...pilot, status: newStatus } : pilot,
  );
}

// Utility function to calculate pilot metrics
export function calculatePilotMetrics(pilot: Pilot): Pilot {
  const {
    vitals: {
      heartRate,
      averageRestingHeartRate,
      heartRateVar,
      bloodPressure,
      oxygenLevel,
      bodyTemp,
      g_force,
      minutesOfActivity,
    },
  } = pilot;

  // Calculate readiness score based on vital signs
  const readinessScore = calculateReadinessScore(
    heartRate,
    averageRestingHeartRate,
    heartRateVar,
    bloodPressure,
    oxygenLevel,
    bodyTemp,
  );

  // Calculate performance score based on mission metrics
  const performanceScore = calculatePerformanceScore(
    g_force,
    minutesOfActivity,
    readinessScore,
  );

  // Calculate overall success score
  const successScore = calculateSuccessScore(
    numericMetrics[0].value,
    numericMetrics[1].value,
    numericMetrics[2].value,
  );

  return {
    ...pilot,
    vitals: {
      ...pilot.vitals,
      calculatedMetrics: {
        readinessScore,
        performanceScore,
        successScore,
      },
    },
  };
}

// Mock data for testing
export const mockPilots: Pilot[] = [
  {
    id: "P001",
    terra_user_id: "TU001",
    garmin_id: "G001",
    name: "LT. MARTINEZ, J.",
    role: "WING COMMANDER",
    monthsOfExperience: 96,
    gender: "m",
    age: 32,
    height: 180,
    weight: 75,
    rank: "Lieutenant",
    status: "standby",
    vitals: {
      heartRate: 99,
      averageRestingHeartRate: 65,
      heartRateVar: 0.156,
      bloodPressure: { sys: 125, dia: 82 },
      oxygenLevel: 97.5,
      bodyTemp: 37.5,
      g_force: 2.9,
      minutesOfActivity: 45,
      calculatedMetrics: {
        readinessScore: 95,
        performanceScore: 92,
        successScore: 94,
      },
    },
  },
  {
    id: "P002",
    terra_user_id: "TU002",
    garmin_id: "G002",
    name: "LT. CHEN, M.",
    role: "FIGHTER PILOT",
    monthsOfExperience: 72,
    gender: "w",
    age: 29,
    height: 170,
    weight: 65,
    rank: "Lieutenant",
    status: "standby",
    vitals: {
      heartRate: 72,
      averageRestingHeartRate: 62,
      heartRateVar: 0.145,
      bloodPressure: { sys: 118, dia: 78 },
      oxygenLevel: 99,
      bodyTemp: 36.8,
      g_force: 0,
      minutesOfActivity: 0,
      calculatedMetrics: {
        readinessScore: 93,
        performanceScore: 95,
        successScore: 96,
      },
    },
  },
  {
    id: "P003",
    terra_user_id: "TU003",
    garmin_id: "G003",
    name: "LT. PATEL, A.",
    role: "FIGHTER PILOT",
    monthsOfExperience: 60,
    gender: "m",
    age: 28,
    height: 175,
    weight: 70,
    rank: "Lieutenant",
    status: "standby",
    vitals: {
      heartRate: 75,
      averageRestingHeartRate: 60,
      heartRateVar: 0.142,
      bloodPressure: { sys: 122, dia: 80 },
      oxygenLevel: 98,
      bodyTemp: 36.9,
      g_force: 0,
      minutesOfActivity: 0,
      calculatedMetrics: {
        readinessScore: 92,
        performanceScore: 90,
        successScore: 91,
      },
    },
  },
  {
    id: "P004",
    terra_user_id: "TU004",
    garmin_id: "G004",
    name: "LT. WILSON, J.",
    role: "FIGHTER PILOT",
    monthsOfExperience: 48,
    gender: "d",
    age: 26,
    height: 178,
    weight: 72,
    rank: "Lieutenant",
    status: "standby",
    vitals: {
      heartRate: 78,
      averageRestingHeartRate: 64,
      heartRateVar: 0.138,
      bloodPressure: { sys: 126, dia: 82 },
      oxygenLevel: 97,
      bodyTemp: 37.0,
      g_force: 0,
      minutesOfActivity: 0,
      calculatedMetrics: {
        readinessScore: 88,
        performanceScore: 85,
        successScore: 86,
      },
    },
  },
];

// Utility functions for metric calculations
function calculateReadinessScore(
  heartRate: number,
  avgRestingHR: number,
  hrv: number,
  bp: { sys: number; dia: number },
  o2: number,
  temp: number,
): number {
  // Simplified scoring algorithm - in production this would be more sophisticated
  let score = 100;

  // Penalize for elevated heart rate
  if (heartRate > avgRestingHR * 1.5) score -= 10;

  // Penalize for low HRV
  if (hrv < 0.1) score -= 15;

  // Penalize for high blood pressure
  if (bp.sys > 140 || bp.dia > 90) score -= 10;

  // Penalize for low oxygen
  if (o2 < 95) score -= 20;

  // Penalize for fever
  if (temp > 37.5) score -= 25;

  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceScore(
  gForce: number,
  activityMinutes: number,
  readiness: number,
): number {
  let score = readiness;

  // Adjust based on G-force handling
  if (gForce > 7) score -= 15;
  else if (gForce > 5) score -= 5;

  // Adjust based on mission duration
  if (activityMinutes > 120) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function calculateSuccessScore(
  reactionTime: number,
  timeInHighG: number,
  nearMisses: number,
): number {
  let success_score =
    0.4 * reactionTime + 0.35 * timeInHighG + 0.25 * nearMisses;

  return success_score;
}

// TODO: In the future, this data will be fetched from:
// 1. Garmin API for real-time biometric data
// 2. Backend database for pilot profile information
// 3. Mission control system for real-time mission data
// 4. Terra API for additional health metrics

export function filterPilotsByStatus(
  pilots: Pilot[],
  status: "active" | "standby",
): Pilot[] {
  return pilots.filter((pilot) => pilot.status === status);
}
