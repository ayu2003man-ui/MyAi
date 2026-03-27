from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.getenv("API_KEY"))

# ✅ Home route (for browser)
@app.route("/", methods=["GET"])
def home():
    return "Backend is running 🚀"

# ✅ Chat route (for frontend)
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_message
    )

    return jsonify({"reply": response.text})

if __name__ == "__main__":
    app.run(debug=True)