from flask import Flask, jsonify, request
from flask_cors import CORS  
from data_loader import process_pilot_data

app = Flask(__name__)
CORS(app) 

@app.route("/health_scores", methods=["GET"])
def get_health_scores():
    """Dynamically process and serve all health scores."""
    results = process_pilot_data("data/pilot_data.csv")
    return jsonify(results)

@app.route("/health_scores/<pilot_name>", methods=["GET"])
def get_pilot_health_score(pilot_name):
    """Retrieve health scores for a specific pilot by name."""
    results = process_pilot_data("data/pilot_data.csv")

    # Filter for the requested pilot
    pilot_data = next((pilot for pilot in results if pilot["name"] == pilot_name), None)

    if pilot_data:
        return jsonify(pilot_data)
    else:
        return jsonify({"error": "Pilot not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)