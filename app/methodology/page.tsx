'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden relative pb-24">
      {/* Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-teal-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 space-y-12"
      >
        <header className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Digital Twin Core Engine
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-light leading-relaxed">
            The Digital Twin Core Engine is the analytical layer of the Udupi Smart Waste Management system. It converts geospatial, demographic, environmental, and operational data into a continuously updated representation of the city's waste-generation and collection requirements.
          </p>
          <div className="mt-6 bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-indigo-900 font-medium text-sm">
            <span className="block mb-2 font-bold text-indigo-700 uppercase tracking-widest text-xs">Pipeline Overview</span>
            Geospatial Data → Urban Growth → Population Estimation → Waste Forecast → Fleet & Route Optimization
          </div>
          <p className="mt-4 text-slate-500 italic text-sm">
            The purpose is not simply to forecast how much waste Udupi will generate, but to estimate <strong>where future waste-generation pressure is likely to occur and how municipal resources should respond spatially</strong>.
          </p>
        </header>

        {/* Section 1 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-indigo-500 pl-4">1. Spatial Urban Growth Model</h2>
          
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.1 Objective</h3>
              <p className="text-slate-600 leading-relaxed">
                Population does not increase uniformly throughout a district. New population tends to concentrate in locations experiencing residential, commercial, institutional, and infrastructure development. Therefore, the Digital Twin does not use population growth alone to determine future SWM demand. Instead, it uses historical building development and spatial characteristics to identify areas where urban expansion is occurring.
              </p>
              <blockquote className="mt-4 bg-slate-100 border-l-4 border-slate-400 p-4 text-slate-700 italic">
                The model predicts: <strong>Where future development is likely to occur, rather than simply applying the same population-growth percentage everywhere.</strong>
              </blockquote>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.2 GIS Grid Discretization</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Udupi study area is divided into regular spatial cells of approximately <strong>100 m × 100 m</strong>. Each grid cell becomes a spatial unit of analysis. For each cell, the system calculates features such as:
              </p>
              <ul className="list-disc list-inside text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <li>Number of building footprints</li>
                <li>Total building footprint area</li>
                <li>Building density</li>
                <li>Built-up-area ratio</li>
                <li>Building growth over time</li>
                <li>Residential building proportion</li>
                <li>Commercial/institutional development</li>
                <li>Distance to major roads</li>
                <li>Distance to existing settlements</li>
                <li>Distance to commercial centres</li>
                <li>Distance to water bodies</li>
                <li>Land-use characteristics</li>
                <li>Terrain/slope where available</li>
                <li>Existing waste-generation intensity</li>
              </ul>
              <p className="text-slate-500 text-sm mt-3">These features form the input vector for the urban-growth model.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.3 Building Footprint Definition</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                A <strong>building footprint</strong> means the 2D polygon representing the ground area occupied by one mapped physical structure. For example: Building A footprint area = 250 m². This does <strong>NOT</strong> mean:
              </p>
              <ul className="list-disc list-inside text-rose-700/80 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm mb-4">
                <li>250 m² of total floor area</li>
                <li>One household or apartment</li>
                <li>A particular population</li>
                <li>A particular building height</li>
              </ul>
              <p className="text-slate-600 leading-relaxed">
                The footprint is only the horizontal geometric representation of the structure. If building-height or floor-count data is available from a reliable source, it may be incorporated separately. <strong>The model must not invent building height or floor count where such data is unavailable.</strong>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.4 Historical Building Growth</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                For historical datasets (t₁, t₂, ..., tₙ), the model calculates building growth:
              </p>
              <div className="bg-slate-900 text-indigo-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                BuildingGrowth_i = (B_i(t₂) - B_i(t₁)) / B_i(t₁)<br/><br/>
                <span className="text-slate-400">// where B_i = number of building footprints in grid cell i</span>
              </div>
              <p className="text-slate-600 leading-relaxed mt-4 mb-4">
                A similar calculation can be performed using built-up area:
              </p>
              <div className="bg-slate-900 text-indigo-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                BuiltUpGrowth_i = (A_i(t₂) - A_i(t₁)) / A_i(t₁)
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                Using both building count and built-up area is preferable because a cell may experience many small new houses, or a small number of large apartment/commercial buildings. These represent different forms of development.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.5 Machine-Learning Development Probability</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The model estimates the probability that a currently undeveloped or low-density cell will experience development using algorithms like Random Forest, XGBoost, or Logistic Regression as a baseline.
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                <span className="text-indigo-400">X_i</span> = [<br/>
                &nbsp;&nbsp;BuildingDensity, BuiltUpGrowth, RoadDistance,<br/> 
                &nbsp;&nbsp;SettlementDistance, LandUse, NeighbourDensity,<br/>
                &nbsp;&nbsp;Slope, CommercialProximity, ...<br/>
                ]<br/><br/>
                <span className="text-emerald-400">P_i</span> = P(NewDevelopment_i=1 | X_i)
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                Where P_i represents the probability of future development in cell i. The model should be trained using historical development observations wherever multiple years of building data are available.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1.6 Cellular Automata Expansion</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The ML probability is then combined with a Cellular Automata (CA) process. For each iteration/year:
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                S_i(t+1) = f(P_i, N_i, S_i(t), C_i)<br/><br/>
                <span className="text-slate-400">
                // S_i(t) = development state of cell i<br/>
                // P_i = ML-derived development probability<br/>
                // N_i = neighbouring development influence<br/>
                // C_i = geographic constraints<br/>
                // S_i(t+1) = predicted future state
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                Neighbouring developed cells increase development pressure, while restricted areas reduce or eliminate development probability. The CA therefore represents the spatial spreading process rather than simply multiplying every location by a fixed growth rate.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-emerald-500 pl-4">2. Population Regression Analysis</h2>
          
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2.1 Purpose</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The spatial-growth model predicts where development occurs. The population model then estimates how population is associated with that development. These are separate problems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Urban Growth Model:</div>
                  <div className="font-medium text-slate-800">Where is development occurring?</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Population Model:</div>
                  <div className="font-medium text-slate-800">How much population is associated with the development?</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2.2 Important Data Definitions</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The model must distinguish between:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block mb-1">Building Footprint:</strong> One mapped physical structure.</li>
                <li className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block mb-1">Dwelling Unit:</strong> One residential housing unit/household.</li>
                <li className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block mb-1">Population:</strong> Number of people.</li>
              </ul>
              <p className="text-rose-600 font-medium mb-4">These quantities must never be treated as interchangeable.</p>
              <div className="bg-slate-900 text-slate-300 p-5 rounded-xl font-mono text-sm overflow-x-auto text-center">
                1 building footprint<br/>
                ↓<br/>
                could contain<br/>
                ↓<br/>
                1 house OR 10 apartments OR 100 apartments
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                The number of dwellings cannot be determined solely from the existence of a footprint.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2.3 Population Features</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The population model can use features such as: Residential building count, Residential footprint area, Residential built-up area, Building-density change, Dwelling-unit information where available, Historical population, Historical population density, Land-use characteristics, Urban/rural classification, and Development intensity.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-medium">
                If building height/floor information is unavailable, the model must not fabricate floor area from arbitrary floor assumptions.
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2.4 Regression Model</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                A baseline regression can be represented as:
              </p>
              <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                P_i = β₀ + β₁B_i + β₂A_i + β₃G_i + β₄D_i + ε_i<br/><br/>
                <span className="text-slate-400">
                // P_i = population<br/>
                // B_i = residential building count<br/>
                // A_i = residential built-up/footprint area<br/>
                // G_i = building growth<br/>
                // D_i = development-density indicators<br/>
                // β = learned coefficients<br/>
                // ε = unexplained error
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                The model should be trained and validated using historical population data. Performance should be reported using MAE, RMSE, and R². This prevents the system from presenting an arbitrary population figure as an exact measurement.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2.5 Spatial Population Allocation</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Once district/taluk/ward population estimates are available, population can be spatially allocated using development intensity:
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                PopulationShare_i = DevelopmentWeight_i / Σ(DevelopmentWeight)<br/><br/>
                Population_i = Population_Total × PopulationShare_i
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                This creates a spatial population surface that reflects actual development patterns instead of assuming uniform distribution.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-amber-500 pl-4">3. Waste Generation Model</h2>
          
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">3.1 Per-Capita Baseline</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                If Daily municipal waste = 72,000 kg/day and Population = 165,401, then:
              </p>
              <div className="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                WastePerCapita = 72,000 / 165,401 = 0.435 kg/person/day
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                <strong>Estimated baseline = 435 g/person/day.</strong> This parameter should be treated as a calibrated baseline derived from the selected Udupi SWM data period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">3.2 Future Waste Forecast</h3>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto mb-4">
                Waste_i(t) = Population_i(t) × WPC_i(t)
              </div>
              <p className="text-slate-600 leading-relaxed">
                If sufficient historical data exists, WPC can vary according to residential/commercial composition, season, economic activity, historical waste trends, rainfall, and special events. The model should avoid applying arbitrary multipliers unless they are supported by historical data or clearly identified as scenario assumptions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">3.3 Waste Composition</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Waste can be divided into categories such as Wet/organic, Dry/recyclable, Domestic hazardous, Sanitary, and Other. Instead of assigning a universal multiplier to every grid, the composition can be linked to land-use/activity type.
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                WetWaste_i = TotalWaste_i × WetFraction_i<br/>
                DryWaste_i = TotalWaste_i × DryFraction_i
              </div>
              <p className="text-slate-600 leading-relaxed mt-4">
                The fractions should be obtained from available Udupi SWM composition studies or municipal measurements where possible.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">3.4 Temporal Factors</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Digital Twin can introduce scenario modifiers for events that influence waste generation, such as Rainfall, Festivals, and Seasonal Tourism. These should be represented as <strong>scenario parameters</strong>, not automatically treated as universal physical laws.
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                WasteAdjusted = BaselineWaste × M_event<br/>
                <span className="text-slate-400">// where M_event is a documented/calibrated event multiplier</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-sky-500 pl-4">4. SWM Fleet Sizing</h2>
          
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <p className="text-slate-600 leading-relaxed">
              Fleet requirements are calculated from predicted waste quantities and operational constraints. The system should distinguish between <strong>Primary Collection</strong> (from households to DWCC) and <strong>Secondary Transportation</strong> (from DWCC to disposal).
            </p>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">4.1 Auto-Tipper Requirement</h3>
              <div className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-sm overflow-x-auto mb-4">
                N_p = ⌈ W_p / C_p ⌉<br/><br/>
                <span className="text-slate-400">
                // W_p = Daily primary collection requirement<br/>
                // C_p = Effective capacity per vehicle per day
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                For example, if an auto tipper can effectively transport 1.5T/trip × 2 trips/day = 3T/day, then N_p = ⌈ W_p / 3 ⌉. The actual usable capacity should account for operational constraints rather than assuming that nominal vehicle capacity is always achieved.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">4.2 Compactor Requirement</h3>
              <div className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-sm overflow-x-auto mb-4">
                N_c = ⌈ W_s / 20 ⌉<br/><br/>
                <span className="text-slate-400">// where W_s is the secondary transportation load (assuming 10T/trip × 2 trips = 20T/day)</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">4.3 Operational Buffer</h3>
              <div className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-sm overflow-x-auto mb-4">
                N_final = ⌈ N × 1.10 ⌉
              </div>
              <p className="text-slate-600 leading-relaxed">
                This represents standby/maintenance redundancy and should be explicitly labelled as an operational planning assumption.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-rose-500 pl-4">5. Route Optimization</h2>
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <p className="text-slate-600 leading-relaxed">Fleet quantity alone does not guarantee an efficient SWM system. The Digital Twin therefore uses spatial optimization.</p>
            
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">5.1 Clustering</h3>
              <p className="text-slate-600 leading-relaxed">
                K-Means or another spatial clustering method can group collection points according to geographic proximity, waste quantity, vehicle capacity, and DWCC location. The number of clusters should not be selected arbitrarily; it should be validated against the available fleet and operational constraints.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">5.2 Vehicle Routing Problem</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Google OR-Tools can solve a constrained Vehicle Routing Problem. The optimization objective can minimize:
              </p>
              <div className="bg-slate-900 text-rose-300 p-4 rounded-xl font-mono text-sm overflow-x-auto mb-4">
                Objective = α(Distance) + β(Time) + γ(Vehicles) + δ(OverloadPenalty)
              </div>
              <p className="text-slate-600 leading-relaxed">
                Subject to vehicle capacity, maximum route distance, service requirements, depot/DWCC constraints, operating hours, and waste demand. This converts the Digital Twin from a forecasting system into a <strong>decision-support system</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 & 7 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 border-l-4 border-fuchsia-500 pl-4 mb-6">6. Complete Pipeline</h2>
            <div className="bg-slate-900 text-fuchsia-300 p-6 rounded-2xl font-mono text-sm shadow-xl text-center leading-loose">
              GIS / Building Data<br/>↓<br/>
              Building Footprint Analysis<br/>↓<br/>
              Building Growth Detection<br/>↓<br/>
              Spatial Development Features<br/>↓<br/>
              XGBoost / Random Forest<br/>↓<br/>
              Development Probability<br/>↓<br/>
              Cellular Automata<br/>↓<br/>
              Future Spatial Development<br/>↓<br/>
              Population Regression<br/>↓<br/>
              Spatial Population Estimate<br/>↓<br/>
              Waste Generation Model<br/>↓<br/>
              Waste Composition<br/>↓<br/>
              Future TPD<br/>↓<br/>
              Fleet Sizing<br/>↓<br/>
              K-Means / Spatial Clustering<br/>↓<br/>
              OR-Tools Vehicle Routing<br/>↓<br/>
              <strong className="text-white">SWM Decision Support</strong>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 border-l-4 border-cyan-500 pl-4 mb-6">7. Feedback Loop</h2>
            <div className="bg-slate-900 text-cyan-300 p-6 rounded-2xl font-mono text-sm shadow-xl text-center leading-loose h-full">
              Citizen Complaints<br/>
              Field Ingestion<br/>
              GPS/Vehicle Data<br/>
              Actual Waste Collection<br/>
              New Building Data<br/>
              Population Updates<br/>
              Weather/Event Data<br/>↓<br/>
              <strong className="text-white">Database</strong><br/>↓<br/>
              Model Update<br/>↓<br/>
              Digital Twin State<br/>↓<br/>
              New Forecast<br/>↓<br/>
              <strong className="text-emerald-400">Updated SWM Recommendation</strong>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 border-l-4 border-violet-500 pl-4">8. Model Transparency and Data Integrity</h2>
          <div className="space-y-8 pl-5 border-l border-slate-200 ml-1">
            <p className="text-slate-600 leading-relaxed">
              Every number displayed by the Digital Twin must have a traceable origin. The interface should distinguish:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block">Observed</strong>Directly obtained from municipal/GIS data.</div>
              <div className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block">Calculated</strong>Derived mathematically from observed data.</div>
              <div className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block">Estimated</strong>Produced using a statistical or ML model.</div>
              <div className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block">Assumed</strong>A planning parameter supplied by the municipality.</div>
              <div className="bg-white p-4 rounded-xl border border-slate-200"><strong className="text-slate-900 block">Predicted</strong>Future model output.</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-900">Parameter</th>
                    <th className="p-4 font-bold text-slate-900">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-4 font-medium">Building footprint area</td><td className="p-4 text-slate-600">Observed/calculated from GIS</td></tr>
                  <tr className="bg-slate-50/50"><td className="p-4 font-medium">Building count</td><td className="p-4 text-slate-600">Observed from GIS</td></tr>
                  <tr><td className="p-4 font-medium">Building height</td><td className="p-4 text-rose-600 font-medium">Observed only if reliable height data exists</td></tr>
                  <tr className="bg-slate-50/50"><td className="p-4 font-medium">Population</td><td className="p-4 text-slate-600">Observed/model-calibrated</td></tr>
                  <tr><td className="p-4 font-medium">Future buildings</td><td className="p-4 text-indigo-600 font-medium">Predicted</td></tr>
                  <tr className="bg-slate-50/50"><td className="p-4 font-medium">Future population</td><td className="p-4 text-indigo-600 font-medium">Predicted</td></tr>
                  <tr><td className="p-4 font-medium">Waste TPD</td><td className="p-4 text-slate-600">Calculated/predicted</td></tr>
                  <tr className="bg-slate-50/50"><td className="p-4 font-medium">Vehicle requirement</td><td className="p-4 text-slate-600">Calculated</td></tr>
                  <tr><td className="p-4 font-medium">10% fleet reserve</td><td className="p-4 text-amber-600 font-medium">Assumption</td></tr>
                  <tr className="bg-slate-50/50"><td className="p-4 font-medium">Route</td><td className="p-4 text-emerald-600 font-medium">Optimized</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-rose-600 font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
              The system must never present an assumption as a measured GIS fact.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-8 md:p-12 text-center shadow-xs relative overflow-hidden">
          <h2 className="text-sm font-bold text-emerald-800 mb-4 uppercase tracking-widest">9. Core Principle</h2>
          <p className="text-xl md:text-2xl font-black text-slate-900 leading-snug mb-8 max-w-3xl mx-auto">
            "Population indicates the magnitude of waste demand, while spatial development and building data indicate where that demand is emerging and how the urban system is changing."
          </p>
          <div className="text-slate-600 font-medium flex flex-col md:flex-row items-center justify-center gap-4 text-xs md:text-sm">
            <span className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs w-full md:w-auto">"How much waste will Udupi generate?"</span>
            <span className="text-emerald-600 text-lg font-bold">→</span>
            <span className="bg-emerald-100/70 px-5 py-3 rounded-xl border border-emerald-300 text-emerald-950 font-semibold w-full md:w-auto">
              "Where is waste-generation demand likely to increase, how much additional waste will be generated, and what collection infrastructure and fleet capacity should be prepared?"
            </span>
          </div>
        </section>

      </motion.div>
    </div>
  );
}

