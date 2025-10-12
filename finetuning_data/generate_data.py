from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, Mapping, MutableMapping

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import asyncio
import tqdm

PROJECT_ID = "trial-buddy-474913"
LOCATION = "us-central1"
MODEL = "openai/gpt-oss-120b-maas"
SERVICE_ACCOUNT_FILE = Path(__file__).resolve().parent.parent / "trial-buddy-474913-e55afe6f6db5.json"
ENDPOINT = (
    f"https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/openapi/chat/completions"
)
SCOPES = ("https://www.googleapis.com/auth/cloud-platform",)


def _get_access_token() -> str:
    """Create a short-lived OAuth token using the service account JSON."""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    credentials.refresh(Request())
    return credentials.token


def build_payload(
    messages: Iterable[Mapping[str, object]],
    *,
    stream: bool = False,
    max_tokens: int = 8192,
    temperature: float = 1.0,
    top_p: float = 1.0,
) -> MutableMapping[str, object]:
    payload: MutableMapping[str, object] = {
        "model": MODEL,
        "stream": stream,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "messages": list(messages),
    }
    return payload


def send_chat_completion(payload: Mapping[str, object]) -> requests.Response:
    token = _get_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    response = requests.post(ENDPOINT, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    return response

def get_studies(n: 1000) -> list:
    response = requests.get(f"https://clinicaltrials.gov/api/v2/studies?pageSize={n}")
    response.raise_for_status()
    return response.json().get("studies", [])


def generateQuestions(nct_id: str) -> None:
    clinicalTrialData = requests.get(f"https://clinicaltrials.gov/api/v2/studies/{nct_id}").json()
    example_messages = [
        # {
        #     "role": "system",
        #     "content": """You are ChatGPT, a large language model trained by OpenAI.
        #     Knowledge cutoff: 2024-06
        #     Current date: 2025-10-12

        #     Reasoning: medium

        #     # Valid channels: analysis, commentary, final. Channel must be included for every message."""
        # },
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
            "content": [{"type": "text", "text": f"Here is the clinical trial data: {json.dumps(clinicalTrialData)}. What are 5 important questions you should ask the patient to better understand their needs?"}],
        },
    ]

    payload = build_payload(example_messages)
    response = send_chat_completion(payload)

    res_json = response.json()
    reasoning_content = res_json.get("choices", [{}])[0].get("message", {}).get("reasoning_content", "")
    content = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
    return reasoning_content, content
    print("Reasoning Content:", reasoning_content)
    print("Content:", content)

if __name__ == "__main__":
    studies = get_studies(1000)
    data = []
    for i in tqdm.tqdm(studies):
        nct_id = i.get("protocolSection").get("identificationModule").get("nctId")
        reasoning, questions = generateQuestions(nct_id)
        data.append({"nct_id": nct_id, "reasoning": reasoning, "questions": questions})
        with open("./data.jsonl", "w") as f:
            for item in data:
                json.dump(item, f)
                f.write("\n")
    print("Data written to ./data.jsonl")