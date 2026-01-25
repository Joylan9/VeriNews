const BASE_URL = "http://127.0.0.1:8000";

export async function ingestText(text) {
    const res = await fetch(`${BASE_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    return res.json();
}

export async function extractClaims(content) {
    const res = await fetch(`${BASE_URL}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
    return res.json();
}

export async function getEvidence(claim) {
    const res = await fetch(`${BASE_URL}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim })
    });
    return res.json();
}

export async function verifyClaim(claim, evidence) {
    const res = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, evidence })
    });
    return res.json();
}
