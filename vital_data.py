import random

def get_vital_data():
    """
    Function to retrieve real-time health data from Garmin API (mocked for now).
    Replace this with the actual function your partner has coded.
    """
    return {
        "heart_rate": random.uniform(50, 80),
        "hrv": random.uniform(40, 100),
        "sleep_score": random.uniform(60, 100),
        "baseline_hr": random.uniform(50, 65),
        "previous_day_activity_minutes": random.randint(20, 180),
        "immunity_index": random.uniform(0, 1),  # Scale 0 to 1
        "training_stress": random.uniform(0, 1),  # Scale 0 to 1
        "spo2": random.uniform(95, 100),
        "sbp": random.randint(110, 140),
        "dbp": random.randint(70, 90),
    }
