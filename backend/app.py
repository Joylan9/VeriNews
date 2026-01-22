from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ingest import extract_article_from_url
from claims import extract_claims
from evidence import search_wikipedia


app = FastAPI(title="VeriNews API", version="0.1")

# =====================
# MODELS
# =====================

class HealthResponse(BaseModel):
    status: str


class IngestRequest(BaseModel):
    url: str | None = None
    text: str | None = None


class IngestResponse(BaseModel):
    title: str
    content: str


class ClaimsRequest(BaseModel):
    content: str


class ClaimsResponse(BaseModel):
    claims: list[str]


class EvidenceRequest(BaseModel):
    claim: str


class EvidenceItem(BaseModel):
    source: str
    title: str
    url: str
    snippet: str


class EvidenceResponse(BaseModel):
    evidence: list[EvidenceItem]


# =====================
# ROUTES
# =====================

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}


@app.post("/ingest", response_model=IngestResponse)
def ingest_article(request: IngestRequest):
    try:
        if request.url:
            article = extract_article_from_url(request.url)

        elif request.text:
            article = {
                "title": "User Provided Text",
                "content": request.text
            }

        else:
            raise ValueError("Either 'url' or 'text' must be provided")

        if not article["content"].strip():
            raise ValueError("No content extracted")

        return article

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"{type(e).__name__}: {str(e)}"
        )


@app.post("/claims", response_model=ClaimsResponse)
def get_claims(request: ClaimsRequest):
    claims = extract_claims(request.content)

    if not claims:
        raise HTTPException(
            status_code=400,
            detail="No claims found"
        )

    return {"claims": claims}


@app.post("/evidence", response_model=EvidenceResponse)
def get_evidence(request: EvidenceRequest):
    evidence = search_wikipedia(request.claim)

    if not evidence:
        raise HTTPException(
            status_code=404,
            detail="No evidence found"
        )

    return {"evidence": evidence}
