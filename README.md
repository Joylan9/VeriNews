# VeriNews

Project setup and running instructions.

## Prerequisites

- [Node.js](https://nodejs.org/) (for the React frontend)
- [Python](https://www.python.org/) (for the FastAPI backend)

## 1. Backend (Python/FastAPI)

Open a terminal and navigate to the `backend` directory.

### Initial Setup (First time only)

Create a virtual environment:
```powershell
cd backend
python -m venv venv
```

Activate the virtual environment:
```powershell
.\venv\Scripts\Activate
```

Install dependencies:
```powershell
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Running the Server

To start the backend server:

```powershell
cd backend
.\venv\Scripts\Activate
uvicorn app:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`.  
API Documentation is available at `http://127.0.0.1:8000/docs`.

## 2. Frontend (React/Vite)

Open a **new** terminal and navigate to the `frontend` directory.

### Initial Setup (First time only)

Install the Node dependencies:

```powershell
cd frontend
npm install
```

### Running the Development Server

To start the frontend:

```powershell
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.
