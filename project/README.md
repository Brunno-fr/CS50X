# DYSONOS — Self-Expanding Network

**Final Project for CS50x**
Developed by **Brunno Alr**

#### Video Demo: https://youtu.be/dox1g25N0tA
**Location:** Sete Lagoas, Minas Gerais, Brazil
**Date:** August 28, 2026
---

## 📖 Description

**DYSONOS** is an academic prototype that simulates a self-expanding network infrastructure capable of automatically increasing its capacity as demand grows.

Inspired by the concept of a **Dyson Swarm** — a hypothetical megastructure composed of numerous orbiting structures designed to capture energy from a star — DYSONOS applies this idea to distributed computing infrastructure.

The system continuously monitors network utilization. When overall utilization reaches or exceeds **80%**, DYSONOS autonomously expands the infrastructure by creating a new zone and adding **4 additional nodes**. This increases the available capacity and allows the simulated network to continue operating under higher demand.

The project combines a **Flask backend**, **SQLite database**, interactive frontend, real-time network visualization, and a dynamic 3D-inspired interface to demonstrate how autonomous infrastructure expansion could work in a simplified environment.

Users can increase demand manually through the dashboard, monitor the network's status, observe topology changes, and reset the simulation to its initial state.

This project was developed as the final project for **Harvard University's CS50x** course.

---

## ✨ Features

* **🌌 Interactive 3D Hero**
  A dynamic Dyson-inspired visualization that reacts to mouse movement and page scrolling, creating an immersive representation of the self-expanding network.

* **📊 Live Dashboard**
  Displays the current number of nodes, zones, total capacity, network utilization, and number of autonomous expansion events.

* **📈 Demand Simulator**
  Allows the user to artificially increase network demand and observe how the infrastructure responds.

* **🤖 Autonomous Expansion**
  When network utilization reaches **80% or higher**, the system automatically creates a new zone and adds 4 nodes.

* **🗺️ Network Visualization**
  A Canvas-based visualization represents zones, nodes, and connections, updating as the network expands.

* **🔄 Reset Simulation**
  Allows the simulation to return to its initial state, providing a clean environment for testing the expansion mechanism.

* **⚡ Real-Time Updates**
  The dashboard periodically communicates with the Flask backend to retrieve the current state of the network.

---

## 🧠 How It Works

The core of DYSONOS is an autonomous expansion cycle:

```text
                    USER
                     │
                     ▼
              Increase Demand
                     │
                     ▼
             Network Utilization
                     │
          ┌──────────┴──────────┐
          │                     │
       < 80%                 ≥ 80%
          │                     │
          ▼                     ▼
   Continue Operation      Trigger Expansion
                                │
                                ▼
                         Create New Zone
                                │
                                ▼
                         Add 4 New Nodes
                                │
                                ▼
                       Increase Capacity
                                │
                                ▼
                         Continue Network
```

This creates a simplified model of infrastructure that can respond to increasing demand without requiring manual intervention.

---

## 🛠️ Technologies

| Layer                         | Technologies                        |
| ----------------------------- | ----------------------------------- |
| **Backend**                   | Python, Flask, Flask-SQLAlchemy     |
| **Database**                  | SQLite                              |
| **Frontend**                  | HTML5, CSS3, JavaScript             |
| **Visualization**             | Canvas API, CSS animations          |
| **3D / Interactive Graphics** | Three.js                            |
| **Animations**                | GSAP                                |
| **Fonts**                     | Google Fonts — Inter, Space Grotesk |

---

## 📁 Project Structure

```text
DYSONOS/
│
├── app.py
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   ├── app.js
│   └── images/
│       └── dyson-sphere.png
│
└── dysonos/
    ├── __init__.py
    └── expansion.py
```

---

## 🚀 How to Run

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd DYSONOS
```

### 2. Install the dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Flask application

```bash
python app.py
```

### 4. Open the application

Visit:

```text
http://127.0.0.1:5000
```

The application will initialize the SQLite database automatically and create the initial network with one zone and four nodes.

---

## 🎮 Using the Simulation

After launching DYSONOS:

1. Observe the current network status on the dashboard.
2. Click **"AUMENTAR DEMANDA"** to increase network utilization.
3. Monitor the utilization percentage.
4. When utilization reaches **80%**, autonomous expansion is triggered.
5. A new zone is created.
6. Four new nodes are added to the network.
7. Total capacity increases.
8. The topology visualization updates to represent the expanded infrastructure.
9. Use the reset functionality to restart the simulation from its initial state.

---

## 🎓 CS50x Final Project

DYSONOS was created as a **CS50x Final Project** to demonstrate concepts learned throughout the course, including:

* Python programming
* Web application development
* Databases and SQL
* JavaScript
* APIs
* Data visualization
* Application architecture
* Problem solving
* Integration between frontend and backend

The project also demonstrates how these concepts can be combined to create an interactive software system rather than an isolated programming exercise.

---

 ## 🤖 Use of AI

AI-assisted development tools were used during the development process for tasks such as initial code structuring, debugging assistance, interface ideas, and implementation suggestions.

The final project architecture, functionality, integration, and implementation were reviewed and adapted as part of the development process.

---

## --- Author

**Brunno Augusto Lacerda Reis**

CS50x Final Project
Harvard University — CS50x
