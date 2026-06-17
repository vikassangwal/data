import requests
import pandas as pd
import numpy as np
import io

# 1. Create a dummy dataset for classification
np.random.seed(42)
n_samples = 200
data = {
    'Feature_1': np.random.rand(n_samples) * 100,
    'Feature_2': np.random.rand(n_samples) * 50,
    'Feature_3': np.random.rand(n_samples) * 10,
}
# Target depends perfectly on Feature_1 (No Noise)
target = (data['Feature_1'] > 50).astype(int)
data['Target'] = target

df = pd.DataFrame(data)
csv_buffer = io.StringIO()
df.to_csv(csv_buffer, index=False)
csv_content = csv_buffer.getvalue()

# 2. Send to FastAPI endpoint
url = "http://localhost:8000/api/train?target_column=Target"
files = {'file': ('test_data.csv', csv_content, 'text/csv')}

try:
    print("Sending dataset to Data Lab Python Engine...")
    response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("\n=== DATA LAB MODEL ACCURACY REPORT ===")
        print(f"Task Type: {result.get('task_type')}")
        print(f"Algorithm: {result.get('model_used')}")
        print(f"{result.get('metric')}: {result.get('score') * 100:.2f}%")
        print("\nFeature Importance:")
        for feature, importance in result.get('feature_importance', {}).items():
            print(f"- {feature}: {importance:.4f}")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Connection Failed: {e}")
