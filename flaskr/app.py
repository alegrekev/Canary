from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import sentiment_analysis

app = Flask(__name__)
CORS(app)

# Endpoint to receive current web url
@app.route('/', methods=['POST'])
def receive_url():
    data = request.get_json()
    
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    url = data.get('url', '')
    keywords = data.get('keywords', [])

    if not url:
        return jsonify({"status": "error", "message": "URL missing"}), 400
    
    print(f"Received URL: {url}")
    print(f"Received Keywords: {keywords}")

    online_content = sentiment_analysis.get_online_content(url)
    chunks = sentiment_analysis.chunkify(online_content)
    score = sentiment_analysis.get_score(chunks)
    keyword_count = sentiment_analysis.check_if_keywords_present(online_content, keywords)

    return jsonify({"status": "success", "score": score, "keyword_count": keyword_count})

if __name__ == '__main__':
    app.run(debug=True, port=5000)