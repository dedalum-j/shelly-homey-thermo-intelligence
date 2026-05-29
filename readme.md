# 🌡️ AI-Driven Smart Water Heater Management (100L)
### Advanced energy optimization, 3-gear load shedding, local machine learning, & custom Web UI.

## 🏆 Shelly Smart Home Challenge 2026 Submission
* **Category:** 01. Scripting & Logic (Build the Logic)
* **Hardware Core:** * **Shelly 2PM Gen3:** Dual-resistance power management (800W + 1200W).
  * **Shelly Plus Add-on + DS18B20:** Digital thermal precision replacing the factory mechanical probe.
  * **Shelly EM:** Whole-house power balance monitor at the main breaker.
* **Software Core:** **Homey Pro Mini** (Node.js Scripting) & Netlify Serverless Web App architecture.
* **Project Status:** Fully deployed, production-ready, and historically validated.

---

## 1. The Real-World Problem
Electric storage water heaters are massive energy consumers. Standard temporal scheduling completely fails to address three modern domestic challenges:
1. **Grid Overload vs. Induction Cooking:** In homes with optimized power contracts (e.g., 5.75 kW), running a dual-element water heater (2000W) simultaneously with an induction cooktop trips the main circuit breaker.
2. **The Mechanical Inaccuracy & Mid-Tank Dilemma:** Factory mechanical thermostats are notoriously imprecise and slow to react. Furthermore, probes placed at mid-height suffer massive reading drops when cold water enters the tank during a shower, triggering short-cycling and wasting immense energy.
3. **Seasonal Waste:** Grid water temperature changes significantly between winter and summer. Keeping a static heating target all year round results in continuous standing heat loss.

---

## 2. Hardware Architecture & "The Hack"
To unlock the true potential of the AI and eliminate the unreliability of analog components, the water heater's factory mechanical thermostat was completely bypassed. 

A digital **DS18B20 temperature probe**, wired through a **Shelly Plus Add-on** directly attached to the Shelly 2PM, was inserted into the tank's thermal well. This provides absolute real-time reliability and decimal-level precision, empowering the algorithm to detect even the slightest micro-drops in temperature.

---

## 3. The "3-Gear" Smart Load Shedding
Unlike standard ON/OFF relays, this project utilizes a **Shelly 2PM Gen3** wired to two independent heating elements inside the 100L tank. This creates a "3-gear gearbox":
* **Gear 1 (800W):** Used for temperature maintenance and Eco modes.
* **Gear 2 (1200W):** Used for standard scheduled pre-heating.
* **Gear 3 (2000W Combined):** Both relays activate simultaneously for urgent showers, thermal sanitation, or massive temperature drops ($\ge 20^\circ\text{C}$).

**Live Grid Protection:** The script continuously analyzes live total house consumption via the **Shelly EM**. If the house approaches the 5.75kW limit while cooking (e.g., induction hob turns on), the Homey Pro Mini dynamically downshifts the heater's gears (2000W -> 1200W -> 800W -> 0W) to prevent house-wide blackouts. Once the kitchen appliance turns off, the heater resumes its scheduled operation.

---

## 4. Just-In-Time Smart Scheduling & Thermal Profiling
Instead of maintaining water at 54°C 24/7—which causes massive thermal leakage—the system uses a highly optimized JSON scheduling agenda (`Termo_Horaris_JSON`) tailored to actual household habits (e.g., Monday-Friday showers at 06:00 and 14:00; Weekends at 09:00).

**How it optimizes energy:**
* **Deep Setback:** During off-hours, the tank rests at a low Base Temperature (e.g., 35°C). 
* **Dynamic Pre-Heating Calculation:** The script does not turn on at a fixed hour. It calculates the exact $\Delta^\circ\text{C}$ needed to reach Comfort Temperature (e.g., 51°C) and divides it by the thermal transfer rate learned from the last 50 cycles. 
* **The Result:** If the algorithm calculates it needs exactly 68 minutes to heat up, and a shower is scheduled for 14:00, the Shelly relays will activate at exactly 12:52. The water hits peak temperature precisely when the user steps into the shower, eliminating hours of wasted standing heat.

---

## 5. Core Software Features (The "Full Brain")
The HomeyScript runs an idempotent asynchronous routine every 5 minutes, executing an incredibly deep layer of advanced logic:

* **🌤️ Dynamic Climate Adaptation:** The script reads exterior temperatures from a **Netatmo Weather Station**. It dynamically shifts the heating baseline according to the season. In Winter (<12°C), the target comfort temperature scales up to **54°C**. In Summer (>22°C), it drops to **46°C**, drastically reducing energy consumption since incoming grid water is already warmer.
* **🧠 Predictive Machine Learning (JSON Analytics):** The system constantly monitors the DS18B20 probe. If it detects a sudden temperature drop of $1.5^\circ\text{C}$ outside of the scheduled agenda (indicating an off-schedule shower), it logs a timestamp. If this pattern repeats for 3 days at the same hour, the AI autonomously generates a "Micro-Comfort" proactive pre-heating window for future days, learning new family habits without human intervention.
* **🛡️ Hardware Health Check & Push Notifications:** If the Homey script commands a Shelly relay to turn ON, but the Shelly 2PM channel reports $<20\text{W}$ of power for over 8 minutes, the engine diagnoses a burned-out physical heating element. It instantly isolates the broken element, shifts operations to the remaining healthy one to prevent cold water, and sends a critical **Push Notification** to the user's smartphone.
* **✈️ Holiday Mode & Anti-Legionella:** Users can input exact departure and return dates via the Web UI. The tank drops to an Anti-freeze state (**15°C**) while the house is empty. Automatically, hours before the family's scheduled return, the script triggers a massive **70°C Anti-Legionella thermal shock** to sanitize the tank. (A standard Anti-Legionella cycle also runs automatically every 15 days on Sunday dawns).
* **🔥 Urgent Shower (Boost Mode):** A manual bypass that instantly engages Gear 3 (2000W) to quickly push the water to a high **65°C**. The Web UI displays a live countdown timer calculating exactly how many minutes are left until the water hits a usable 43°C threshold.
* **🚨 Emergency Stop & Safe-Mode:** A hard-lock toggle on the Web UI that instantly kills power to both Shelly 2PM channels, overriding any AI routine or schedule. Additionally, an automatic Safe-Mode triggers if the water reaches a dangerous $\ge 80^\circ\text{C}$ or if the DS18B20 probe reads a corrupted `null` value, sending an immediate Push Notification to prevent boiling.

---

## 6. Web Front-End Interface (`termo.html`)
The system's status is exposed through a secure, native-feeling custom web dashboard deployed on Netlify. It acts as the ultimate remote control and analytics center, bypassing standard proprietary apps.
* **Intelligent Dynamic Thermostat:** UI shifts colors (Blue/Orange/Red) based on tank status and visually flags states like "CONSERVING", "HEATING", or "STANDBY".
* **Interactive Modals:** Add, remove, or modify the JSON heating schedules, activate Urgent Showers, Emergency Stops, or Holiday Modes directly from your phone.
* **Dual-Granularity Consumption Charts:** The Homey Pro Mini stores energy logs in a persistent JSON variable. The Web UI pulls this data to render interactive Chart.js graphics: **24-Hour Power Demand Profiles (Stepped Watts)** showing exactly when the 800W or 1200W relays trigger, and **30-Day Energy Metrics (kWh Bars)**, including accurate monthly billing estimations.

*(Add your screenshots here)*
`![Dashboard Overview](screenshots/dashboard.jpg)`
`![Analytics & Charts](screenshots/analytics.jpg)`
`![Visual Architecture Flow](screenshots/architecture.png)`

---

## ⚙️ Setup Instructions

### Prerequisites
* 1x **Homey Pro Mini** (Running HomeyScript).
* 1x **Shelly 2PM Gen3** (Wired to the 800W and 1200W heating elements).
* 1x **Shelly Plus Add-on** + **DS18B20 Temperature Sensor** (Replacing the factory mechanical probe).
* 1x **Shelly EM** (Installed at the main breaker to measure total house consumption).
* 1x **Netatmo Weather Station** (Or any outdoor temperature sensor).
* **Netlify** account (For the Web UI).

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
2. Setup a Serverless Function on Netlify (`/.netlify/functions/homey`) pointing to your Homey Cloud API endpoint to allow secure, PIN-protected bidirectional communication.