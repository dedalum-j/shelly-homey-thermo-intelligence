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

**Live Grid Protection:** The script continuously analyzes live total house consumption via the **Shelly EM**. If the house approaches the 5.75kW limit while cooking, the Homey Pro Mini dynamically downshifts the heater's gears (2000W -> 1200W -> 800W -> 0W) to prevent house-wide blackouts.

---

## 4. Core Software Features (The "Full Brain")
The HomeyScript runs an idempotent asynchronous routine every 5 minutes, executing the following advanced logic layers:

* **🌤️ Dynamic Climate Adaptation:** The script reads exterior temperatures from a **Netatmo Weather Station**. It dynamically shifts the heating baseline according to the season. In Winter (<12°C), the target comfort temperature scales up to **54°C**. In Summer (>22°C), it drops to **46°C**, drastically reducing standing heat loss.
* **🧠 Predictive Machine Learning (JSON Analytics):** The system tracks the last 50 heating events to calculate precise thermal transfer rates. If the DS18B20 probe detects an anomalous temperature drop (e.g., an off-schedule shower) 3 times at the same hour, the AI learns this habit and automatically creates a proactive pre-heating window for future days.
* **🛡️ Hardware Health Check & Push Notifications:** If a Shelly relay is turned ON but the channel reports $<20\text{W}$ for over 8 minutes, the engine diagnoses a burned-out heating element. It isolates the broken element, shifts operations to the remaining healthy one, and sends an urgent **Push Notification** to the user's mobile via Homey.
* **✈️ Holiday Mode & Anti-Legionella:** Users can input exact departure and return dates via the Web UI. The tank drops to an Anti-freeze state (**15°C**). Hours before the family returns, it automatically triggers a **70°C Anti-Legionella thermal shock**. (A standard Anti-Legionella cycle also runs automatically every 15 days on Sunday dawns).
* **🔥 Urgent Shower (Boost):** A manual bypass that instantly engages Gear 3 (2000W) to quickly push the water to **65°C**. The Web UI displays a live countdown timer calculating exactly how many minutes are left until the water hits a usable 43°C.
* **🚨 Emergency Stop & Safe-Mode:** A hard-lock toggle that instantly kills power to both Shelly 2PM channels, overriding any AI routine or schedule. Additionally, an automatic Safe-Mode triggers if the water reaches $\ge 80^\circ\text{C}$ or if the DS18B20 probe reads a corrupted `null` value, sending an immediate Push Notification.

---

## 5. Web Front-End Interface (`termo.html`)
The system's status is exposed through a secure, native-feeling custom web dashboard deployed on Netlify. It acts as the ultimate remote control and analytics center.
* **Intelligent Dynamic Thermostat:** UI shifts colors (Blue/Orange/Red) based on tank status and visually flags states like "CONSERVING" or "HEATING".
* **Interactive Toggles:** Activate Urgent Showers, Emergency Stops, or Holiday Modes directly from your phone.
* **Dual-Granularity Consumption Charts:** The Homey Pro Mini stores energy logs in a persistent JSON variable. The Web UI pulls this data to render interactive Chart.js graphics: **24-Hour Power Demand Profiles (Stepped Watts)** and **30-Day Energy Metrics (kWh Bars)**, including accurate monthly billing estimations.

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
3.