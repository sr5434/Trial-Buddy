from tqdm import tqdm
import json
import requests
with open('data.jsonl', 'r') as json_file:
    json_list = list(json_file)

data = [json.loads(line) for line in json_list]

new_data = []
for item in tqdm(data):
    clinicalTrialData = requests.get(f"https://clinicaltrials.gov/api/v2/studies/{item['nct_id']}").json()
    
    new_item = {
        "messages": [
            {
                "role": "system",
                "content": """# Instructions
                You are a helpful clinical trial explainer. A patient wanted to know more about a clinical trial before they join. Before you make the research report, you want to ask them 5 questions to better understand their needs. Remember to explain things in layman\'s terms. Do not group 2 questions into one spot.
                # Response Formats
                ## questions
                {"properties":{"items":{"type":"array","description":"","items":{"type":"string"}}},"type":"object"}"""
            },
            {
                "role": "user",
                "content": f"Here is the clinical trial data: {json.dumps(clinicalTrialData)}. What are 5 important questions you should ask the patient to better understand their needs?"
            },
            {
                "role": "assistant",
                "content": item["questions"]
            }
        ]
    }
    if item["questions"] != None:
        new_data.append(new_item)
with open('reformatted_data.jsonl', 'w') as f:
    for entry in new_data:
        json.dump(entry, f)
        f.write('\n')