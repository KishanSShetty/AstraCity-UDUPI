import docx
import os

# Load the source document
doc_src = docx.Document('AstraCityss.docx')

# Load the clean template document
doc_template = docx.Document('template_clean.docx')

# Delete all existing paragraphs in the template
for p in doc_template.paragraphs:
    p._element.getparent().remove(p._element)

# Delete all existing tables in the template
for t in doc_template.tables:
    t._element.getparent().remove(t._element)

# Now, iterate over all block-level elements in the source document and append them to the template
# This ensures we get exactly every word, paragraph, and table.
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph

for element in doc_src.element.body:
    if isinstance(element, CT_P):
        p = Paragraph(element, doc_src)
        new_p = doc_template.add_paragraph()
        for run in p.runs:
            new_run = new_p.add_run(run.text)
            new_run.bold = run.bold
            new_run.italic = run.italic
            new_run.underline = run.underline
            new_run.font.name = 'Times New Roman'
    elif isinstance(element, CT_Tbl):
        table = Table(element, doc_src)
        new_table = doc_template.add_table(rows=len(table.rows), cols=len(table.columns))
        new_table.style = 'Table Grid'
        for i, row in enumerate(table.rows):
            for j, cell in enumerate(row.cells):
                new_table.cell(i, j).text = cell.text

doc_template.save('AstraCity_Exact_Conference_Format.docx')
