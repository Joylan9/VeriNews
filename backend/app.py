from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from dotenv import load_dotenv

load_dotenv()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)


from ingest import extract_article_from_url
from claims import extract_claims
from evidence import search_wikipedia
from verify import verify_claim


app = FastAPI(title="VeriNews API", version="0.1")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    url: HttpUrl | None = None
    text: str | None = Field(None, max_length=10000, description="Raw text input, max 10k chars")


class IngestResponse(BaseModel):
    title: str
    content: str


class ClaimsRequest(BaseModel):
    content: str = Field(..., min_length=10, max_length=10000)


class ClaimsResponse(BaseModel):
    claims: list[str]


class EvidenceRequest(BaseModel):
    claim: str = Field(..., min_length=5, max_length=500)


class EvidenceItem(BaseModel):
    source: str
    title: str
    url: str
    snippet: str


class EvidenceResponse(BaseModel):
    evidence: list[EvidenceItem]


class VerifyRequest(BaseModel):
    claim: str = Field(..., min_length=5, max_length=500)
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
@limiter.limit("5/minute")
def ingest_article(request: IngestRequest, request_raw: Request):
    try:
        if request.url:
            article = extract_article_from_url(str(request.url))

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
@limiter.limit("10/minute")
def get_claims(request: ClaimsRequest, request_raw: Request):
    claims = extract_claims(request.content)

    if not claims:
        raise HTTPException(
            status_code=400,
            detail="No claims found"
        )

    return {"claims": claims}


@app.post("/evidence", response_model=EvidenceResponse)
@limiter.limit("10/minute")
def get_evidence(request: EvidenceRequest, request_raw: Request):
    evidence = search_wikipedia(request.claim)

    if not evidence:
        raise HTTPException(
            status_code=404,
            detail="No evidence found"
        )

    return {"evidence": evidence}


@app.post("/verify", response_model=VerifyResponse)
@limiter.limit("10/minute")
def verify(request: VerifyRequest, request_raw: Request):
    return verify_claim(request.claim, request.evidence)
