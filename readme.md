# 🌡️ AI-Driven Smart Water Heater Management (100L)
### Advanced energy optimization, 3-gear load shedding, local machine learning, & custom Web UI.

## 🏆 Shelly Smart Home Challenge 2026 Submission
* **Category:** 01. Scripting & Logic (Build the Logic)
* **Hardware Core:** * **Shelly 2PM Gen3 + Temperature Probe:** Dual-resistance management and mid-tank thermal reading.
  * **Shelly EM:** Whole-house power balance monitor at the main breaker.
* **Software Core:** **Homey Pro Mini** (Node.js Scripting) & Netlify Serverless Web App architecture.
* **Project Status:** Fully deployed, production-ready, and historically validated.

---

## 1. The Real-World Problem
Electric storage water heaters are massive energy consumers. Standard temporal scheduling completely fails to address three modern domestic challenges:
1. **Grid Overload vs. Induction Cooking:** In homes with optimized power contracts (e.g., 5.75 kW), running a dual-element water heater (2000W) simultaneously with an induction cooktop trips the main circuit breaker.
2. **The Mid-Tank Probe Dilemma:** Temperature probes are usually placed at mid-height. When a shower starts, cold water enters from the bottom, causing a massive drop in the probe's reading long before the upper usable water volume actually cools down. This triggers short-cycling and wastes immense energy.
3. **Seasonal Waste:** Grid water temperature changes significantly between winter and summer. Keeping a static heating target all year round results in continuous standing heat loss.

---

## 2. System Architecture & The "3-Gear" Logic
This ecosystem unifies local multi-sensor inputs into a single, idempotent asynchronous routine running every few minutes on a **Homey Pro Mini**, commanding Shelly execution units.

### ⚙️ The 3-Gear Heating System (800W / 1200W / 2000W)
Unlike standard ON/OFF relays, this project utilizes a **Shelly 2PM** wired to two independent heating elements inside the 100L tank. This creates a "3-gear gearbox" to optimize either heating speed or energy efficiency:
* **Gear 1 (800W):** Used for temperature maintenance and Eco modes.
* **Gear 2 (1200W):** Used for standard scheduled pre-heating.
* **Gear 3 (2000W Combined):** Both relays activate simultaneously for urgent showers, thermal sanitation (Anti-Legionella), or massive temperature drops ($\ge 20^\circ\text{C}$).

### Core Algorithmic Layers:
* **🛑 Real-Time Smart Load Shedding:** Analyzes live total house consumption via the **Shelly EM**. If the house approaches the 5.75kW limit while cooking, the Homey Pro Mini dynamically downshifts the heater's gears (2000W -> 1200W -> 800W -> 0W) to prevent blackouts.
* **⚡ Bidirectional Safe-Mode Firewall:** Validates probe integrity (`null` or $>110^\circ\text{C}$) and checks for critical overheat ($\ge 80^\circ\text{C}$). Cuts power to both Shelly 2PM channels instantly if breached.
* **☀️ Seasonal Matrix (Climate-Adaptive):** Dynamically shifts the operational baseline based on outdoor weather (e.g., Target drops to 46°C in summer, scales to 54°C in winter).
* **🧠 Predictive JSON Analytics & AI:** Tracks the last 50 heating events to calculate precise thermal transfer. If anomalous temperature drops repeat 3 times at the same hour, the internal AI automatically builds a pre-heating window for that timeframe.
* **🕵️ Hardware Health Check:** If a Shelly relay is ON but the channel reports $<20\text{W}$ for over 8 minutes, the engine diagnoses a burned-out heating element, isolates it, and shifts operations to the remaining healthy element.

---

## 3. Web Front-End Interface (`termo.html`)
The system's status is exposed through a secure, native-feeling custom web dashboard deployed on Netlify.
* **Intelligent Dynamic Thermostat:** UI shifts colors (Blue/Orange/Red) based on tank status and visually flags states like "CONSERVING" or "HEATING".
* **Grid Baseline Monitor:** Displays active power demand breakdown and tracks raw household base load.
* **Dual-Granularity Analytics:** Chart.js integration showing 24-Hour Power Demand Profiles (Stepped Watts) and 30-Day Energy Metrics (kWh Bars) with realistic cost estimations.

*(Add your screenshots here)*
`![Dashboard Overview](screenshots/dashboard.jpg)`
`![Analytics & Charts](screenshots/analytics.jpg)`

---

## ⚙️ Setup Instructions

### Prerequisites
* 1x **Homey Pro Mini** (Running HomeyScript).
* 1x **Shelly 2PM Gen3** (Connected to the 800W and 1200W heating elements + Add-on with Temp Probe).
* 1x **Shelly EM** (Installed at the main breaker to measure total house consumption).
* 1x **Netatmo Weather Station** (Or any outdoor temperature sensor).

### Step 1: Homey Logic Variables
Create the following persistent variables in Homey Logic (Text/Boolean/Number):
* `TempTermo`, `TempObjectiu`, `ConsumoTermo`, `ConsumoTotal`, `TempExterior` (Numbers)
* `DutxaUrgent`, `ParadaEmergencia`, `ModoAusencia`, `Termo_Avaria_800W`, `Termo_Avaria_1200W` (Booleans)
* `ModeTermo`, `Termo_Historic_JSON`, `Termo_Patrons_USO`, `Termo_Log_Consumo`, `Termo_Horaris_JSON` (Strings)

### Step 2: Deploy HomeyScript
1. Open Homey Web App -> HomeyScript.
2. Create a new script named `Thermo_Controller_V7.js`.
3. Paste the contents of `homeyscript-termo-v7.2.js` from this repository.
4. Create an Advanced Flow in Homey to run this script every 5 minutes.

### Step 3: Deploy Web Dashboard
1. Upload the `web-interface/termo.html` file to a new Netlify site.
2. Setup a Serverless Function on Netlify (`/.netlify/functions/homey`) pointing to your Homey Cloud API endpoint.