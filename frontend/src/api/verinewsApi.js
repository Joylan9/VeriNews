const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function handleResponse(res) {
    if (res.status === 429) {
        throw new Error("Too many requests. Please wait a moment.");
    }
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${res.status}`);
    }
    return res.json();
}

export async function ingestText(text) {
    const res = await fetch(`${BASE_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    return handleResponse(res);
}

export async function extractClaims(content) {
    const res = await fetch(`${BASE_URL}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
    return handleResponse(res);
}

export async function getEvidence(claim) {
    const res = await fetch(`${BASE_URL}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim })
    });
    return handleResponse(res);
}

export async function verifyClaim(claim, evidence) {
    const res = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, evidence })
    });
    return handleResponse(res);
}
