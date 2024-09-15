from transformers import pipeline
import math
import requests
from bs4 import BeautifulSoup

def get_online_content(url):
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        page_text = soup.get_text(separator=' ', strip=True)
        
        return page_text
    else:
        return f"Error: Unable to fetch page (status code: {response.status_code})"

def chunkify(text):
    max_length = 512
    chunks = []
    while text:
        chunks.append(text[:max_length])
        text = text[max_length:]

    return chunks

def scale_value(value):
    if value < 0 or value > 1:
        raise ValueError("Input value must be between 0 and 1")
    
    if value < 0.01:
        transformed_value = math.pow(value, 0.5)
        result = transformed_value * 10
    elif (value > 0.01) and (value < 0.05):
        transformed_value = math.pow(value, 0.05)
        result = transformed_value * 10
    else:
        transformed_value = math.pow(value, 0.005)
        result = transformed_value * 100
    
    rounded_result = round(result)
    
    return max(0, min(rounded_result, 100))

def get_score(chunks):
    toxicity_scores = []
    for c in chunks:
        pipe = pipeline("text-classification", model="unitary/toxic-bert")

        output = pipe(c)

        toxicity_scores.append(output[0]['score'])

    avg_toxicity_score = sum(toxicity_scores) / len(toxicity_scores)

    scaled_result = scale_value(avg_toxicity_score)
    rounded_result = round(scaled_result)

    return rounded_result

def check_if_keywords_present(online_content, keyword_list):
    online_content_lower = online_content.lower()
    keywords = {}

    for k in keyword_list:
        k_lower = k.lower()
        keywords[k] = keywords.get(k, 0) + online_content_lower.count(k_lower)

    return keywords