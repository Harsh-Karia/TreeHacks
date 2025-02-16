import requests
import pandas as pd
import json
from health_score import calculate_scores
from ppg_bp_calculate import estimate_bp

def fetch_vitals():
    """
    Fetch all required vitals individually via separate API calls.
    Each vital is fetched separately to maintain modularity and independence.
    """
    return {
        "heart_rate": requests.get("http://localhost:5000/getHRSamples").json(),
        "hrv": requests.get("http://localhost:5000/getHRSamples").json(),
        "sleep_score": requests.get("http://localhost:5000/getSleepScore").json(),
        "baseline_hr": requests.get("http://localhost:5000/getHRSamples").json(),
        "previous_day_activity_minutes": requests.get("http://localhost:5000/getActivity").json(),
        "immunity_index": requests.get("http://localhost:5000/getImmuneIndex").json(),
        "training_stress": requests.get("http://localhost:5000/getStressScore").json(),
        "spo2": requests.get("http://localhost:5000/getDailyScore").json(),
    }

def process_pilot_data(file_path):
    """
    Process pilot data, fetch vitals, estimate BP, and compute scores.
    """
    df = pd.read_csv(file_path)
    results = []

    for _, row in df.iterrows():
        name = row["Name"]
        SBP, DBP = estimate_bp(name)  # Fetch BP from PPG

        # Fetch all vitals via separate API calls
        vitals = fetch_vitals()

        # Compute Scores
        readiness, performance, success = calculate_scores(
            SBP, DBP, vitals["spo2"], vitals["heart_rate"], vitals["hrv"], vitals["sleep_score"],
            vitals["baseline_hr"], vitals["previous_day_activity_minutes"], vitals["immunity_index"],
            vitals["training_stress"]
        )

        results.append({
            "name": name, "SBP": SBP, "DBP": DBP, "SpO2": vitals["spo2"], "HR": vitals["heart_rate"], 
            "HRV": vitals["hrv"], "Sleep Score": vitals["sleep_score"], "Baseline HR": vitals["baseline_hr"],
            "Activity": vitals["previous_day_activity_minutes"], "Immunity": vitals["immunity_index"],
            "Training Stress": vitals["training_stress"], "Readiness Score": readiness,
            "Performance Score": performance, "Success Score": success
        })

    # Sort by Readiness Score
    results = sorted(results, key=lambda x: x["Readiness Score"], reverse=True)

    # Save results
    with open("data/health_scores.json", "w") as f:
        json.dump(results, f, indent=4)

    pd.DataFrame(results).to_csv("data/health_scores.csv", index=False)
    return results

if __name__ == "__main__":
    process_pilot_data("data/pilot_data.csv")
