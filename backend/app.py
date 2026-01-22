from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="VeriNews API", version="0.1")

class HealthResponse(BaseModel):
    status: str

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}
