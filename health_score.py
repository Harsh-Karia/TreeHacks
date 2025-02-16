def calculate_scores(SBP, DBP, SpO2, HR, HRV, SleepScore, BaselineHR, Activity, Immunity, TrainingStress):
    """
    Calculates:
    - Readiness Score (high weight on Sleep, HRV, BP)
    - Performance Score (HR, HRV, BP, SpO₂)
    - Success Score (HRV, HR, BP, critical BP check)
    """
    bp_score = max(0, 20 - abs(120 - SBP) - abs(80 - DBP)) / 20 * 100
    spo2_score = min(max((SpO2 - 85) / 15, 0), 1) * 100
    hr_score = max(0, 30 - abs(HR - 70)) / 30 * 100
    hrv_score = min(HRV / 100, 1) * 100  
    sleep_score = min(SleepScore, 100)

    readiness_score = (0.3 * sleep_score + 0.25 * hrv_score +
                       0.2 * bp_score + 0.1 * hr_score +
                       0.05 * spo2_score + 0.05 * Activity +
                       0.025 * Immunity + 0.025 * TrainingStress)

    performance_score = (0.35 * hr_score + 0.3 * hrv_score +
                         0.2 * bp_score + 0.15 * spo2_score)

    success_score = (0.4 * hrv_score + 0.3 * hr_score + 0.3 * bp_score)

    if SBP > 200 or DBP > 120:
        success_score = 0  

    return round(readiness_score, 2), round(performance_score, 2), round(success_score, 2)
