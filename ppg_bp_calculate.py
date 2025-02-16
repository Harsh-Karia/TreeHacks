import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import glob
import os
from scipy.signal import find_peaks
import json

# Define Paths
input_folder = "regular"  # Folder with 999 CSV files
output_folder_ppg = "output_ppg_plots"
output_folder_bp = "output_bp_plots"
os.makedirs(output_folder_ppg, exist_ok=True)
os.makedirs(output_folder_bp, exist_ok=True)

# Placeholder for Blood Pressure Estimates
bp_results = []

# Load and Process Each CSV File
csv_files = glob.glob(os.path.join(input_folder, "*.csv"))

for file in csv_files:
    person_id = os.path.basename(file).split(".")[0]
    
    # Read CSV
    df = pd.read_csv(file)
    
    # Ensure Required Columns Exist
    if "sample_index" not in df.columns or "IR" not in df.columns:
        print(f"Skipping {file}: Missing required columns")
        continue

    # 📌 PLOT PPG GRAPH
    plt.figure(figsize=(10, 5))
    plt.plot(df["sample_index"], df["IR"], marker='o', linestyle='-', color='r', label="PPG Signal")
    plt.xlabel("Sample Index")
    plt.ylabel("Infrared (IR) Value")
    plt.title(f"PPG Signal for {person_id}")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(output_folder_ppg, f"{person_id}_ppg.png"))  # Save PPG plot
    plt.close()

    # 📌 FEATURE EXTRACTION FOR BP ESTIMATION
    # Find PPG Peaks (Heartbeats)
    peaks, _ = find_peaks(df["IR"], distance=30)  # Adjust based on sampling rate

    # Calculate Heart Rate (HR) in BPM
    if len(peaks) > 1:
        rr_intervals = np.diff(df["sample_index"].iloc[peaks])  # Time between peaks
        heart_rate = 60 / (np.mean(rr_intervals) / 100)  # Convert to BPM
    else:
        heart_rate = np.nan  # Not enough peaks

    # 📌 BP ESTIMATION WITHOUT ECG OR ML
    SBP = 0.5 * heart_rate + 100
    DBP = 0.3 * heart_rate + 60

    # Save BP Results
    bp_results.append({"name": person_id, "SBP": SBP, "DBP": DBP})

    # 📌 PLOT BLOOD PRESSURE VALUES
    plt.figure(figsize=(6, 4))
    plt.bar(["Systolic", "Diastolic"], [SBP, DBP], color=['blue', 'red'])
    plt.ylim(50, 180)  # BP Range
    plt.title(f"Estimated BP for {person_id}")
    plt.ylabel("Blood Pressure (mmHg)")
    plt.savefig(os.path.join(output_folder_bp, f"{person_id}_bp.png"))  # Save BP plot
    plt.close()

# 📌 SAVE BLOOD PRESSURE RESULTS AS JSON & CSV
bp_df = pd.DataFrame(bp_results)
bp_df.to_csv("data/estimated_blood_pressure.csv", index=False)
with open("data/estimated_blood_pressure.json", "w") as f:
    json.dump(bp_results, f, indent=4)

print("✅ BP Calculations Complete: Data saved!")


# 🔹 NEW FUNCTION: Fetch Precomputed BP for a Specific Person 🔹
def estimate_bp(person_id):
    """
    Retrieves estimated BP values for a person from precomputed PPG data.
    This prevents the need for reprocessing large PPG datasets every time BP is needed.
    """
    bp_data = pd.read_csv("data/estimated_blood_pressure.csv")
    match = bp_data[bp_data["name"] == person_id]

    if not match.empty:
        return match.iloc[0]["SBP"], match.iloc[0]["DBP"]
    else:
        return 120, 80  # Default BP if not found
