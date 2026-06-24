# 🚥 Neural Traffic Grid (NTG)

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-orange.svg)

> 🎓 **Project Presentation:** [View the Presentation Slides here](https://drive.google.com/file/d/1PbjFDtK3bcinOvuxLYL2Gpxp97h9oyL6/view?usp=sharing)

An AI-driven Intelligent Traffic Signal Optimization platform that utilizes **Soft Computing** techniques to dynamically adapt traffic signal timings, reduce wait times, and minimize city congestion.

This project was built as a comprehensive implementation of multiple Artificial Intelligence and Soft Computing modules including **Artificial Neural Networks (ANN)**, **Fuzzy Logic Control**, and **Particle Swarm Optimization (PSO)**.

---

## 🌟 Key Features

1. **Backpropagation Neural Network (ANN) Analytics**
   - Predicts real-time junction congestion scores using variables such as vehicle counts (N/S/E/W), average speed, queue length, and time of day.
   - Interactive live predictor with confidence gauges and feature importance tracking.

2. **Fuzzy Logic Decision Engine**
   - Uses Linguistic Rule-Based Inference.
   - Computes dynamic "Green Signal Duration" based on crisp inputs: *Congestion Score* and *Waiting Time*.
   - Live evaluations of membership functions (High/Medium/Low density) and rule activation.

3. **Particle Swarm Optimization (PSO)**
   - Computes global optimal signal splits across the junction.
   - Iteratively refines green signal timing allocations to minimize total intersection waiting times.
   - Live swarm convergence visualization.

4. **Live Command Center Dashboard**
   - Combines the backend AI output into a single, sleek UI.
   - Interactive animated Simulation Lab demonstrating cars moving through a smart junction responding to the AI's timing directives.
   
---

## 🛠️ Tech Stack

### Frontend (User Interface & Simulation)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + Custom CSS (`globals.css`)
- **Visuals:** HTML5 Canvas (for traffic simulation and PSO particles), Chart.js / Recharts
- **Icons:** Lucide React

### Backend (AI & Optimization Engine)
- **Framework:** FastAPI (Python)
- **Machine Learning:** PyTorch (for the Backpropagation Neural Network)
- **Fuzzy Logic:** `scikit-fuzzy`
- **Optimization Algorithms:** Custom Python-based Particle Swarm Optimization
- **Data Generation:** Synthetic traffic dataset generator (`pandas`, `numpy`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Start the Backend (FastAPI + AI Engine)

Navigate to the `backend/` directory:
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 2. Start the Frontend (Next.js Dashboard)

Open a new terminal and navigate to the project root:
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend UI will run on `http://localhost:3000`.

---

## 🧠 Project Architecture

```text
NeuralTrafficGrid/
├── app/                  # Next.js Frontend App Router
│   ├── fuzzy/            # Fuzzy Logic Controller UI
│   ├── neural/           # ANN Analytics UI
│   ├── pso/              # Particle Swarm Optimization UI
│   ├── simulation/       # Traffic Lab Simulation
│   └── page.tsx          # Main Dashboard
├── components/           # Reusable UI components & Canvas renders
├── lib/                  # Shared utilities and API fetchers
└── backend/              # Python FastAPI Backend
    ├── data/             # Synthetic 10k traffic records
    ├── models/           # PyTorch ANN models & scalers
    ├── fuzzy/            # Scikit-Fuzzy logic inference engine
    ├── optimization/     # PSO algorithm implementation
    └── api/              # FastAPI route controllers
```

---

## 📚 Educational Value / Syllabus Modules Covered

This application serves as an applied representation of the following Soft Computing modules:
- **Module 1 (Neural Networks):** Backpropagation network, learning rules, feature scaling.
- **Module 3 (Fuzzy Sets):** Fuzzification, membership functions, properties of sets.
- **Module 4 (Fuzzy Logic):** Fuzzy rule-based systems, fuzzy decision-making (Defuzzification).
- **Module 6 (Optimization):** Swarm Intelligence (Particle Swarm Optimization).

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
