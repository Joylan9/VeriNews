from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ingest import extract_article_from_url
from claims import extract_claims
from evidence import search_wikipedia
from verify import verify_claim


app = FastAPI(title="VeriNews API", version="0.1")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


class VerifyRequest(BaseModel):
    claim: str
    evidence: list[dict]


class VerifyResponse(BaseModel):
    verdict: str
    reason: str


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


@app.post("/verify", response_model=VerifyResponse)
def verify(request: VerifyRequest):
    return verify_claim(request.claim, request.evidence)
