import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.oxml.ns import qn
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

doc = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCityss.docx')

ns_w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

print('=== SOURCE DOCUMENT ELEMENT ORDER ===')
for idx, elem in enumerate(doc.element.body):
    tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
    if isinstance(elem, CT_P):
        text = ''.join(t.text for t in elem.findall('.//{%s}t' % ns_w) if t.text)
        text_short = text[:100].replace('\n', ' ')
        # get style
        pPr = elem.find('.//{%s}pStyle' % ns_w)
        style = pPr.get(qn('w:val')) if pPr is not None else 'None'
        print(f'[{idx}] PARA style=[{style}] text=[{text_short}]')
    elif isinstance(elem, CT_Tbl):
        rows = elem.findall('.//{%s}tr' % ns_w)
        print(f'[{idx}] TABLE rows={len(rows)}')
        for ri, row in enumerate(rows):
            cells = row.findall('.//{%s}tc' % ns_w)
            cell_texts = []
            for c in cells:
                ct = ''.join(t.text for t in c.findall('.//{%s}t' % ns_w) if t.text)
                cell_texts.append(ct[:50])
            print(f'       Row {ri}: {cell_texts}')
    else:
        print(f'[{idx}] OTHER tag={tag}')

print(f'\n=== SECTIONS ===')
for i, section in enumerate(doc.sections):
    sectPr = section._sectPr
    cols = sectPr.find(qn('w:cols'))
    if cols is not None:
        num = cols.get(qn('w:num'))
        space = cols.get(qn('w:space'))
        print(f'Section {i}: columns num={num}, space={space}')
    else:
        print(f'Section {i}: single column')
