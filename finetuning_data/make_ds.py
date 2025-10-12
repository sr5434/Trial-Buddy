from datasets import Dataset
from huggingface_hub import login
import json

#!/usr/bin/env python3
"""
Script to convert data.jsonl to a HuggingFace dataset and upload it to the hub.
"""


def load_jsonl(file_path):
    """Load data from a JSONL file."""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line))
    return data

def main():
    # Load the JSONL file
    print("Loading data.jsonl...")
    data = load_jsonl('data.jsonl')
    
    # Create a HuggingFace dataset
    print(f"Creating dataset with {len(data)} examples...")
    dataset = Dataset.from_list(data)
    
    # Login to HuggingFace Hub (will prompt for token if not already logged in)
    print("Logging in to HuggingFace Hub...")
    login()
    
    # Upload to the hub
    repo_name = input("Enter repository name (e.g., username/dataset-name): ")
    print(f"Uploading dataset to {repo_name}...")
    
    dataset.push_to_hub(repo_name)
    
    print(f"Successfully uploaded dataset to https://huggingface.co/datasets/{repo_name}")

if __name__ == "__main__":
    main()