with open(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\build_new_conference_paper.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add if not text: continue
content = content.replace(
    '    text = src_texts[i].strip()\n',
    '    text = src_texts[i].strip()\n    if not text:\n        i += 1\n        continue\n'
)

# 2. Update Abstract replacements
content = content.replace(
    \"    ('The novelty will be to combine', 'The novelty lies in integrating'),\",
    \"    ('The twin digitally represents', 'The proposed framework integrates'),\n    ('The estimated savings per ward per year is \u20b95.79 crores', 'Financial projections indicate potential annual savings of \u20b95.79 crores per ward'),\n    ('The novelty will be to combine these modules into a comprehensive digital twin system for urban decision making.', 'This study provides a scalable blueprint for integrating disjointed municipal data into actionable urban policies.'),\"
)

# 3. Update Intro replacement
content = content.replace(
    \"    ('The innovation is in the ability to combine these modules', 'The principal contribution is the integration of these modules'),\",
    \"    ('The innovation is in the ability to combine these modules into a single digital twin for the ward.', 'The primary contribution is a scalable blueprint that transforms disjointed municipal data into actionable, scenario-driven urban policies.'),\"
)

# 4. Add Related Work compression before text_replacements
content = content.replace(
    \"text_replacements = [\",
    \"text_replacements = [\n    ('3.1 Emission-Capacitated Vehicle Routing', ''),\n    ('3.2 Digital Twin for Smart Cities', ''),\n    ('Prior work has shown that the time-of-day speed variability in route planning has a significant impact on route feasibility and total emissions, especially in urban corridors with high congestion levels in the morning, which is the time period used for collection in this study (i.e., 06:00–10:00). These formulations allocate speed profiles for each road class for each time period, which results in more realistic arrival time accumulation along long routes. The speed model used by AstraCity is a two-speed model (06:00-08:00 = low-congestion; 08:00-10:00 = peak) per road category and is used as a design specification for use in future calibration.', 'AstraCity addresses this by incorporating a two-speed time-dependent model (low-congestion and peak) per road category to ensure realistic arrival time accumulation.'),\n    ('Digital twin in smart city contexts has been increasingly used to connect physical infrastructure and data-driven decision support. The urban digital twin is generally used to model physical assets, simulate operational scenarios and present relevant physical and decision outputs to the administrators without the need for any live sensor infrastructure initially. However, in the waste management sector, similar approaches have been advocated for logistics tracking, landfill site evaluation, or waste collection planning, among others, but none of them are truly a pipeline. Previous literature usually focuses on just one or two of these elements separately. AstraCity brings together spatial surveillance, waste modelling, constrained routing, and environment assessment within a single ward level decision-support framework, making it a multi-function digital twin and not a single analytical module.', 'While digital twins increasingly connect physical infrastructure to decision support [16], prior waste management applications [17] typically isolate logistics or site evaluation. AstraCity advances this by unifying spatial surveillance, waste modelling, constrained routing, and environmental assessment into a continuous ward-level pipeline.'),\"
)

with open(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\build_new_conference_paper.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Patched successfully!')
