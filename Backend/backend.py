import logging 
import flask
from flask import request
from terra.base_client import Terra
from flask_cors import CORS
import datetime
import random
import json

logging.basicConfig(level=logging.INFO)

_LOGGER = logging.getLogger("app")

app = flask.Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

webhook_secret = "8ec330b81beda42e145e93eedcc1ffafc61982647a4939ac"
dev_id = "4actk-medihealth-testing-8jasNbPQZV"
api_key = "f0F6YcJEWwnL69gJfTaekrgda8Jzmz6N"

terra = Terra(api_key=api_key, dev_id=dev_id, secret=webhook_secret)

STORAGE = {}

@app.route("/consumeTerraWebhook", methods=['POST'])
def consume_terra_webhook():
  body = request.get_json()
  _LOGGER.info("Got the Terra Webhook: %s", body)  

  return flask.Response(status=200)

@app.route("/authenticate", methods=['GET'])
def authenticate():
   widget_response = terra.generate_widget_session(providers=['GARMIN'], reference_id='1234')
   widget_url = widget_response.get_json()['url']
   return flask.Response(f"<button onclick=\"location.href='{widget_url}'\">Authenticate with GARMIN</button>", mimetype = 'text/html')
   #return terra.generate_widget_session(providers=['GARMIN'], reference_id='1234').get_json()

@app.route('/getSleep', methods=['GET']) 
def getSleep():
    user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
    terra_user = terra.from_user_id(user_id)
    sleep_data = terra_user.get_sleep(start_date=datetime.datetime(2025, 2, 5), 
                                      end_date=datetime.datetime(2025, 2, 6), 
                                      to_webhook=False, 
                                      with_samples=True)
    body = sleep_data.get_json()
    
    sleep_info = body.get("data", [{}])[0].get("sleep_durations_data", {}).get("asleep", {})
    awake_info = body.get("data", [{}])[0].get("sleep_durations_data", {}).get("awake", {})

    rem_sleep = sleep_info.get("duration_REM_sleep_state_seconds", None)
    total_sleep = sleep_info.get("duration_asleep_state_seconds", None)
    deep_sleep = sleep_info.get("duration_deep_sleep_state_seconds", None)
    
    awake_duration = awake_info.get("duration_awake_state_seconds", None)

    extracted_data = {
        "REM Sleep (seconds)": rem_sleep,
        "Total Sleep (seconds)": total_sleep,
        "Deep Sleep (seconds)": deep_sleep,
        "Awake Duration (seconds)": awake_duration
    }

    _LOGGER.info("Sleep Data: %s", extracted_data)
    return flask.jsonify(extracted_data)

@app.route('/getSleepScore', methods=['GET'])
def getSleepScore():
  user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
  terra_user = terra.from_user_id(user_id)
  sleep_data = terra_user.get_sleep(start_date=datetime.datetime(2025, 2, 5), 
                                    end_date=datetime.datetime(2025, 2, 6), 
                                    to_webhook=False, 
                                    with_samples=True)
  sleep_body = sleep_data.get_json()
  sleep_score = sleep_body.get("data", [{}])[0].get("data_enrichment", {}).get("sleep_score")

  _LOGGER.info("Sleep Score: %s", sleep_score)
  return flask.jsonify(sleep_score)

@app.route('/getStressScore', methods=['GET'])
def getStressScore():
  user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
  terra_user = terra.from_user_id(user_id)
  activity_data = terra_user.get_activity(start_date=datetime.datetime(2025, 2, 5), 
                                    end_date=datetime.datetime(2025, 2, 6), 
                                    to_webhook=False, 
                                    with_samples=True)
  activity_body = activity_data.get_json()
  training_stress = activity_body.get("data", [{}])[0].get("data_enrichment", {}).get("stress_score")
  _LOGGER.info("Stress Score: %s", training_stress)
  return flask.jsonify(training_stress)

@app.route('/getRespiratoryScore', methods=['GET'])
def getRespiratoryScore():
  user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
  terra_user = terra.from_user_id(user_id)
  
  daily_data = terra_user.get_daily(start_date=datetime.datetime(2025, 2, 5), 
                                    end_date=datetime.datetime(2025, 2, 6), 
                                    to_webhook=False, 
                                    with_samples=True)

  daily_body = daily_data.get_json()
  _LOGGER.info("Daily Body Response: %s", daily_body)

  respiratory_score = daily_body.get("data", [{}])[0].get("data_enrichment", {}).get("respiratory_score")

  _LOGGER.info("Respiratory Score: %s", respiratory_score)
  return flask.jsonify(respiratory_score)



@app.route('/getImmuneIndex', methods=['GET'])
def getImmuneIndex():
  user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
  terra_user = terra.from_user_id(user_id)

  daily_data = terra_user.get_daily(start_date=datetime.datetime(2025, 2, 5), 
                                    end_date=datetime.datetime(2025, 2, 6), 
                                    to_webhook=False, 
                                    with_samples=True)
  daily_body = daily_data.get_json()
  immune_index = daily_body.get("data", [{}])[0].get("data_enrichment", {}).get("immune_index")
  
  _LOGGER.info("Immune Index: %s", immune_index)
  return flask.jsonify(immune_index)



@app.route('/getActivity', methods=['GET']) 
def getActivity():
  user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
  terra_user = terra.from_user_id(user_id)
  
  activity_data = terra_user.get_activity(start_date=datetime.datetime(2024, 8, 13),
                                          end_date=datetime.datetime(2025, 2, 13),
                                          to_webhook=False, 
                                          with_samples=True)
  activity_body = activity_data.get_json()
  _LOGGER.info("Activity Data: %s", activity_body)
  # activity_records = activity_body.get("data", [])
  # if not activity_records:
  #       _LOGGER.warning("No activity data found.")
  #       return flask.jsonify({"error": "No activity data found."})

  activity_records = []
  for i in range(168):
      activity_seconds = random.randint(1500, 4500)
      activity_records.append({
          "active_durations_data": {"activity_seconds": activity_seconds},
          "metadata": {"start_time": f"2024-08-{(i % 30) + 1}T08:00:00Z"}
      })

  _LOGGER.info("MOCK Activity Data Generated: %s", activity_records)

  weekly_activity = {f"Week {i+1}": [] for i in range(24)}

  for index, record in enumerate(activity_records):
      activity_seconds = record.get("active_durations_data", {}).get("activity_seconds", 0)
      _LOGGER.info("DAY: %s", activity_seconds)
      week_index = index % 24
      week_key = f"Week {week_index + 1}"
      weekly_activity[week_key].append(activity_seconds)

  weekly_averages = {
      week: sum(seconds) / len(seconds) if seconds else 0
      for week, seconds in weekly_activity.items()
  }

  _LOGGER.info("Weekly Activity Averages: %s", weekly_averages)
  return flask.jsonify(weekly_averages)

@app.route('/getHRSamples', methods=['GET'])
def getHRSamples():
    user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
    terra_user = terra.from_user_id(user_id)

    start_time = datetime.datetime(2025, 2, 10).replace(tzinfo=datetime.timezone.utc)
    end_time = datetime.datetime(2025, 2, 15).replace(tzinfo=datetime.timezone.utc)

    activity_data = terra_user.get_activity(start_date=start_time, 
                                            end_date=end_time, 
                                            to_webhook=False, 
                                            with_samples=True)
    
    activity_body = activity_data.get_json()
    activity_records = activity_body.get("data", [])

    if not activity_records:
        _LOGGER.warning("No activity data found for the given time range.")
        return flask.jsonify({"error": "No activity data found."}), 404

    first_record = activity_records[0] if activity_records else {}
    hr_samples = first_record.get("heart_rate_data", {}).get("detailed", {}).get("hr_samples", [])

    filtered_hr_samples = [
        sample for sample in hr_samples
        if start_time <= datetime.datetime.fromisoformat(sample["timestamp"].replace("Z", "+00:00")) <= end_time
    ]

    _LOGGER.info("Filtered HR Samples from Feb 10, 2:58 PM to 4:14 PM: %s", filtered_hr_samples)
    _LOGGER.info("\n%s", json.dumps(activity_records[0]["metadata"]))

    return flask.jsonify(filtered_hr_samples)

@app.route('/getHeartMetrics', methods=['GET'])
def getHeartMetrics():
    user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
    terra_user = terra.from_user_id(user_id)

    daily_data = terra_user.get_daily(
        start_date=datetime.datetime(2025, 2, 5),
        end_date=datetime.datetime(2025, 2, 6),
        to_webhook=False,
        with_samples=True
    )

    daily_body = daily_data.get_json()

    health_data = daily_body["data"][0]  # First entry
    heart_summary = health_data.get("heart_rate_data", {}).get("summary", {})

    avg_hr_bpm = heart_summary.get("avg_hr_bpm")
    resting_hr_bpm = heart_summary.get("resting_hr_bpm")

    _LOGGER.info("Avg HR BPM: %s", avg_hr_bpm)
    _LOGGER.info("Resting HR BPM: %s", resting_hr_bpm)

    return flask.jsonify({
        "avg_hr_bpm": avg_hr_bpm,
        "resting_hr_bpm": resting_hr_bpm
    })

@app.route('/getOxySaturation', methods=['GET'])
def getOxySaturation():
    user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
    terra_user = terra.from_user_id(user_id)

    daily_data = terra_user.get_daily(
        start_date=datetime.datetime(2025, 2, 5),
        end_date=datetime.datetime(2025, 2, 6),
        to_webhook=False,
        with_samples=True
    )

    daily_body = daily_data.get_json()

    health_data = daily_body.get("data", [{}])[0]
    avg_saturation_percentage = health_data.get("oxygen_data", {}).get("avg_saturation_percentage")

    _LOGGER.info("Avg Oxygen Saturation: %s", avg_saturation_percentage)

    return flask.jsonify({avg_saturation_percentage})


# Global variables to track HR samples and index
hr_samples_global = []
hr_index = 0

@app.route('/initializeHRSamples', methods=['GET'])
def initialize_hr_samples():
    """Fetch and store HR samples in a global variable"""
    global hr_samples_global, hr_index

    user_id = '62daab0e-4f2e-4538-aae9-3408a1f8f821'
    terra_user = terra.from_user_id(user_id)

    start_time = datetime.datetime(2025, 2, 10).replace(tzinfo=datetime.timezone.utc)
    end_time = datetime.datetime(2025, 2, 15).replace(tzinfo=datetime.timezone.utc)

    activity_data = terra_user.get_activity(
        start_date=start_time,
        end_date=end_time,
        to_webhook=False,
        with_samples=True
    )
    
    activity_body = activity_data.get_json()
    activity_records = activity_body.get("data", [])

    if not activity_records:
        _LOGGER.warning("No activity data found for the given time range.")
        return flask.jsonify({"error": "No activity data found."}), 404

    first_record = activity_records[0] if activity_records else {}
    hr_samples = first_record.get("heart_rate_data", {}).get("detailed", {}).get("hr_samples", [])

    # Convert timestamps to datetime objects for easier tracking
    hr_samples_global = [
        {"timestamp": datetime.datetime.fromisoformat(sample["timestamp"].replace("Z", "+00:00")),
         "bpm": sample["bpm"]}
        for sample in hr_samples
    ]

    # Reset index
    hr_index = 0

    _LOGGER.info("Initialized %d HR samples.", len(hr_samples_global))

    return flask.jsonify({"message": f"Loaded {len(hr_samples_global)} heart rate samples."})


@app.route('/getNextHR', methods=['GET'])
def get_next_hr():
    """Returns the next HR sample based on global index"""
    global hr_samples_global, hr_index

    if not hr_samples_global:
        return flask.jsonify({"error": "HR data not initialized. Call /initializeHRSamples first."}), 400

    # Ensure index stays within range
    if hr_index >= len(hr_samples_global):
        hr_index = len(hr_samples_global) - 1  # Stay at last value

    hr_sample = hr_samples_global[hr_index]
    hr_index += 1  # Move to the next sample for the next call

    return flask.jsonify(hr_sample)


if __name__ == "__main__": 
    app.run()
