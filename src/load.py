# run_once_download.py
from transformers import AutoTokenizer, AutoModel

print("Downloading DistilBERT...")
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased", token=False)
model = AutoModel.from_pretrained("distilbert-base-uncased", token=False)

save_path = r"D:\Neuro Final\WebAgent\distilbert-base-uncased"
tokenizer.save_pretrained(save_path)
model.save_pretrained(save_path)
print(f"Saved to {save_path}")