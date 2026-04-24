# CLV Workspace

Complete production-style CLV analytics platform is available in:

- `/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project`

See project README:

- `/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/README.md`




==========
📦 1. Frontend (UI Layer)

Located in:

clv_showcase_project/frontend
Tech Stack
⚛️ React
⚡ Vite (fast dev + build)
🌐 JavaScript / HTML / CSS
📡 Axios (API calls)
What it does
Upload CSV data
Show EDA charts
Display:
CLV predictions
Customer segments
SHAP explanations
Calls backend APIs
⚙️ 2. Backend (API Layer)

Located in:

clv_showcase_project/backend
Tech Stack
🚀 FastAPI
🔥 Uvicorn / Gunicorn (server)
🐍 Python
What it does
Accepts data from frontend
Runs:
EDA
Feature engineering
Model inference
Returns results as JSON
🤖 3. Machine Learning Layer

Inside backend (usually under app/ or models/)

Tech Stack
🐼 pandas
🔢 scikit-learn
🌲 XGBoost
🌳 Random Forest
🔍 SHAP
What it does
Data cleaning & preprocessing
Feature engineering (RFM, behavioral)
Model training:
Regression → CLV value
Classification → High-value customer
Model explainability using SHAP
📊 4. Data Layer
Tech Stack
CSV files
Pandas DataFrames
What it does
Input data from user
Temporary processing
Output predictions
🌐 5. API Communication
Tech Stack
REST APIs
JSON format
Axios (frontend)
Flow
Frontend (React)
        ↓
Backend (FastAPI)
        ↓
ML Models
        ↓
Response → Frontend UI
☁️ 6. Deployment Stack (what you're doing now)
Backend
Azure App Service
Gunicorn + Uvicorn
Frontend
Azure Static Web Apps
🧩 Full Stack Summary
Layer	Tech Used
Frontend	React, Vite, Axios
Backend	FastAPI, Python
ML	Pandas, scikit-learn, XGBoost, SHAP
Server	Gunicorn, Uvicorn
Data	CSV
Deployment	Azure (App Service + Static Web Apps)
