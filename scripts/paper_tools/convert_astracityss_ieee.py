import sys
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

src = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCityss.docx')
tmpl = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\template_clean.docx')

ns_w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
body = tmpl.element.body

# ── Preserve section breaks ───────────────────────────────────
keep_elements = []
for child in list(body):
    tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
    if tag == 'sectPr':
        keep_elements.append(('final_sectPr', child))
    elif tag == 'p':
        inner_sect = child.find('.//{%s}sectPr' % ns_w)
        if inner_sect is not None:
            keep_elements.append(('para_sectPr', child))

for child in list(body):
    body.remove(child)

for kind, elem in keep_elements:
    body.append(elem)

body_children = list(body)
first_sect_para = None
final_sect_elem = None

for child in body_children:
    tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
    if tag == 'p' and first_sect_para is None:
        inner = child.find('.//{%s}sectPr' % ns_w)
        if inner is not None:
            first_sect_para = child
    elif tag == 'sectPr':
        final_sect_elem = child

# ── Process Elements ──────────────────────────────────────────
def create_run(parent_p, text, bold=False, italic=False, size=None, font_name="Times New Roman"):
    r = parse_xml('<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
    rPr = parse_xml('<w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
    if bold:
        rPr.append(parse_xml('<w:b xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>'))
    if italic:
        rPr.append(parse_xml('<w:i xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>'))
    if size:
        sz_val = str(size * 2)
        rPr.append(parse_xml('<w:sz xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="%s"/>' % sz_val))
        rPr.append(parse_xml('<w:szCs xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="%s"/>' % sz_val))
    if font_name:
        rPr.append(parse_xml('<w:rFonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:ascii="%s" w:hAnsi="%s"/>' % (font_name, font_name)))
    r.insert(0, rPr)
    t_elem = parse_xml('<w:t xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xml:space="preserve"/>')
    t_elem.text = text
    r.append(t_elem)
    parent_p.append(r)
    return r

elements_list = list(src.element.body)

# In AstraCityss, first few paras are Title, Authors, Abstract.
# Let's count them or just scan for "1. Introduction" or "Introduction" to split.
split_idx = 0
for idx, element in enumerate(elements_list):
    if isinstance(element, CT_P):
        text = "".join(t.text for t in element.findall('.//{%s}t' % ns_w) if t.text)
        if "Introduction" in text and ("1" in text or "I." in text):
            split_idx = idx
            break

if split_idx == 0:
    # Fallback if not found
    split_idx = 10 

for idx, element in enumerate(elements_list):
    # Skip the body-level sectPr that belongs to the source document
    if not isinstance(element, (CT_P, CT_Tbl)):
        continue
        
    if isinstance(element, CT_P):
        text = "".join(t.text for t in element.findall('.//{%s}t' % ns_w) if t.text)
        if not text.strip():
            continue
            
        p = parse_xml('<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
        pPr = parse_xml('<w:pPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
        
        if idx < split_idx:
            # 1-column section (centered)
            pPr.append(parse_xml('<w:jc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="center"/>'))
        else:
            # 2-column section (justified)
            pPr.append(parse_xml('<w:jc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="both"/>'))
            
        p.append(pPr)
        
        for child in element:
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag == 'r':
                t = child.find('.//{%s}t' % ns_w)
                if t is not None and t.text:
                    b = child.find('.//{%s}b' % ns_w) is not None
                    i = child.find('.//{%s}i' % ns_w) is not None
                    
                    # Style abstract explicitly bold/italic if it's before split_idx and starts with Abstract
                    if idx < split_idx and ("Abstract" in t.text):
                        b, i = True, True
                    
                    # Formatting size: title is big
                    size = 10
                    if idx == 0:
                        size = 18
                        b = True
                    elif idx < 5:
                        size = 12
                        
                    create_run(p, t.text, bold=b, italic=i, size=size)
        
        if idx < split_idx:
            if first_sect_para is not None:
                first_sect_para.addprevious(p)
            else:
                final_sect_elem.addprevious(p)
        else:
            final_sect_elem.addprevious(p)
            
    elif isinstance(element, CT_Tbl):
        # Format table perfectly
        tblPr = element.find('.//{%s}tblPr' % ns_w)
        if tblPr is None:
            tblPr = parse_xml('<w:tblPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
            element.insert(0, tblPr)
            
        tblBorders = parse_xml(
            '<w:tblBorders xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
            '</w:tblBorders>'
        )
        old_borders = tblPr.find('.//{%s}tblBorders' % ns_w)
        if old_borders is not None:
            old_borders.getparent().replace(old_borders, tblBorders)
        else:
            tblPr.append(tblBorders)
            
        tblW = parse_xml('<w:tblW xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:w="5000" w:type="pct"/>')
        old_w = tblPr.find('.//{%s}tblW' % ns_w)
        if old_w is not None:
            old_w.getparent().replace(old_w, tblW)
        else:
            tblPr.append(tblW)
            
        for p_elem in element.findall('.//{%s}p' % ns_w):
            pPr = p_elem.find('.//{%s}pPr' % ns_w)
            if pPr is None:
                pPr = parse_xml('<w:pPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
                p_elem.insert(0, pPr)
            jc = pPr.find('.//{%s}jc' % ns_w)
            if jc is not None:
                jc.set(qn('w:val'), 'both')
            else:
                pPr.append(parse_xml('<w:jc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="both"/>'))
                
            for r_elem in p_elem.findall('.//{%s}r' % ns_w):
                rPr = r_elem.find('.//{%s}rPr' % ns_w)
                if rPr is None:
                    rPr = parse_xml('<w:rPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>')
                    r_elem.insert(0, rPr)
                rFonts = parse_xml('<w:rFonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>')
                old_fonts = rPr.find('.//{%s}rFonts' % ns_w)
                if old_fonts is not None:
                    old_fonts.getparent().replace(old_fonts, rFonts)
                else:
                    rPr.append(rFonts)
                    
        final_sect_elem.addprevious(element)

output_path = r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCity_Perfect_IEEE.docx'
tmpl.save(output_path)
print('Successfully created AstraCity_Perfect_IEEE.docx')
