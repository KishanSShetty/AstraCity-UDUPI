import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import fitz
doc = fitz.open(r'udupi_Waste_Routing_PRD.pdf')
print(f'Total Pages: {len(doc)}')

all_text = []
for i, page in enumerate(doc):
    text = page.get_text()
    all_text.append(f'===== PAGE {i+1} =====\n{text}')

full = '\n'.join(all_text)
with open('prd_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(full)

print(full)
doc.close()
