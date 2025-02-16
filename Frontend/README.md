# Next steps:

# Data from Garmin: HARSHITA

# Active screen

## General functionality -> ALL HARSH

- Formula1 == ReadinessScore and Formula 2 == PerformanceScore and then for ENd screen Formula3 == SuccessScore
- Start a timer of the duration of that mission that is logged and once you click end mission you can see the duration of how long the overall mission was
- add a button on the left of the readiness score that reads "Initiate" and adds the currently inactive pilot to the active pilot monitor. Currently, the data is structured as constants in dashboard-top and dashboard-bottom, but we need this to be more flexible
#### pilot data


interface Pilot {
  // Identification
  id: string;            // Your internal ID
  terra_user_id: string; // Terra's user ID for Garmin data
  garmin_id: string;     // Direct Garmin identifier if needed

  // Constants
  readonly name: string;
  readonly role: string;
  readonly monthsOfExperience: number;
  readonly gender: 'm' | 'w' | 'd';
  readonly age: number;
  readonly height: number;
  readonly weight: number;
  readonly rank: string;

  // Dynamic data
  status: 'active' | 'standby'; // this changes if we drag pilots somewhere
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

// Calculated metrics
    calculatedMetrics: {
      readinessScore: number,     // HARSH
      PerformanceScore: number,       // HARSH
      SuccessScore: number,        // HARSH
  
    }
  }
}

  // Function to calculate metrics
  function calculatePilotMetrics(pilot: Pilot) {
    const { //EXAMPLE CODE

    // Update pilot object
    pilot.vitals.calculatedMetrics = {
      readinessScore,
      fatigueIndex,
      stressScore: calculateStress(pilot),
      performanceRating: calculatePerformance(pilot)
    };

    return pilot;
  }

  // Use in your data flow
  pilotRoster.map(pilot => calculatePilotMetrics(pilot));

    
  }
}
  },

#### warning
- Warning needs to be initiaited if treshholds: if heartRate > 160 or heartRate < 40 OR If sys blood pressure > 200 change colour to red, if above 160 change to orange AND 
- -> next step: instead of hardcoded values compare to their baseline measurements and age, gender, height, weight.

### Harshita + Harsh to align on data/function



## nav bar /BOTTOM BAR- JULIUS
- NO: add name of commander behind commander view
- MAYBE: Lets add a debug console at bottom of screen using a green dot in the styling from the blue and orange dots as well as status texts in the same style as current "active" statuses

  

## top part JULIUS
Prompt: I want a functionality that we can add a pilot from their 


- important: add "readiness score" as well next to "ACTIVE"
- Heart Rate
- Blood Pressure
- Body temp 
- functionality:
- * instead of Alert Medical: Recover and initiate autopilot. -> Next it shows a screen that showcases a timer of 15 seconds counting down during which autopilot is activeated



## bottom part JULIUS
- add line break for blood pressure so it is displayed eg 118/
78
instead of 118/7
8
- Change naming frmo "BACKUP PILOT" -> "STANDBY PILOTS"


# on the Analysis screen: LOWER PRIORITY
- Remove max g force from the bottom and instead show it as another performance analysis with Maximum G-Force ancountered (random value between 4-6 everytime i click finish mission
- For the average respnose time, instead sho a harcoded  value between 100 - 120 miliseconds; the closer the readiness is to 100% the closer i want the score to be to 100


- chart that plots heart rate (judges idea)
- hover over each pilot to see a quick summary about them and then expanding to see their full history/stats, utilizing the dashboard
- 

# Recommendations SAI
- Write a prompt for mistral to take all values and the output, store it, and have mistral come up with fighter pilot specific heath recommmendations based on fighter pilot training (needed: research on their training and normal values and testing of consistency as well as some promopt engineering)
(((- low prio: include email client to send recs to emails stored with the pilot)))
- Showcase the pilot as well as concrete recommendations



### Open questions:
- 
## General notes:
