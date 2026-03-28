from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from groq import Groq
import os

app = Flask(__name__)
CORS(app)

API_KEYS = [
    {"key": os.getenv("GEMINI_KEY_1"), "provider": "gemini"},
    {"key": os.getenv("GEMINI_KEY_2"), "provider": "gemini"},
    {"key": os.getenv("GROQ_KEY_1"), "provider": "groq"},
]

current_key_index = 0

def generate_response(api_info, user_message):
    if api_info["provider"] == "gemini":
        client = genai.Client(api_key=api_info["key"])
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        return response.text

    elif api_info["provider"] == "groq":
        client = Groq(api_key=api_info["key"])
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": user_message}]
        )
        return response.choices[0].message.content

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
            reply = generate_response(api_info, user_message)
            current_key_index = index
            return jsonify({"reply": reply})

        except Exception as e:
            error_str = str(e)
            print(f"Key {index + 1} ({api_info['provider']}) failed: {error_str}")
            if any(code in error_str for code in ["429", "RESOURCE_EXHAUSTED", "403", "rate_limit"]):
                continue
            return jsonify({"error": error_str}), 500

    return jsonify({"error": "All API keys exhausted. Please try again later."}), 429