from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os

app = Flask(__name__)
CORS(app)

API_KEYS = [
    {"key": os.getenv("GEMINI_KEY_1"), "provider": "gemini"},
    {"key": os.getenv("GEMINI_KEY_2"), "provider": "gemini"},
]

current_key_index = 0

@app.route("/", methods=["GET"])
def home():
    return "Backend is running 🚀"

@app.route("/chat", methods=["POST"])
def chat():
    global current_key_index

    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Invalid request"}), 400

    user_message = data["message"]

    for i in range(len(API_KEYS)):
        index = (current_key_index + i) % len(API_KEYS)
        api_info = API_KEYS[index]

        try:
            client = genai.Client(api_key=api_info["key"])

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_message,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )

            current_key_index = index
            return jsonify({"reply": response.text})

        except Exception as e:
            error_str = str(e)
            print(f"Key {index + 1} failed: {error_str}")
            if any(code in error_str for code in ["429", "RESOURCE_EXHAUSTED", "403"]):
                continue
            return jsonify({"error": error_str}), 500

    return jsonify({"error": "All API keys exhausted. Please try again later."}), 429