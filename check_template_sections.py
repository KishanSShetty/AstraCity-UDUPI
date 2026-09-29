import sys
from docx import Document
from docx.oxml.ns import qn

doc = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\template_clean.docx')
for i, section in enumerate(doc.sections):
    print(f'Section {i}:')
    type_elem = section._sectPr.find(qn('w:type'))
    if type_elem is not None:
        print(f'  type: {type_elem.get(qn("w:val"))}')
    else:
        print('  type: None (default is Next Page)')
