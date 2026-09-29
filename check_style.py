import requests
import json

try:
    r = requests.get('https://tiles.openfreemap.org/styles/dark/style.json', timeout=10)
    data = r.json()
    print('Sources:', list(data.get('sources', {}).keys()))
    for layer in data.get('layers', []):
        if 'building' in layer.get('id', '').lower() or 'building' in layer.get('source-layer', '').lower():
            print(f"Layer: {layer['id']}, Source: {layer.get('source', 'None')}, Source-Layer: {layer.get('source-layer', 'None')}")
except Exception as e:
    print('Error:', e)
