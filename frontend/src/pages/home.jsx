import { useState } from "react";
import {
    ingestText,
    extractClaims,
    getEvidence,
    verifyClaim
} from "../api/verinewsApi";

export default function Home() {
    const [text, setText] = useState("");
    const [claims, setClaims] = useState([]);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [evidence, setEvidence] = useState([]);
    const [verdict, setVerdict] = useState(null);

    async function analyze() {
        try {
            setClaims([]);
            setEvidence([]);
            setVerdict(null);

            const ingest = await ingestText(text);
            const claimsRes = await extractClaims(ingest.content);
            setClaims(claimsRes.claims);
        } catch (error) {
            console.error("Error analyzing text:", error);
            alert("An error occurred during analysis. Please check the console for details.");
        }
    }

    async function selectClaim(claim) {
        try {
            setSelectedClaim(claim);
            setVerdict(null);

            const evidenceRes = await getEvidence(claim);
            setEvidence(evidenceRes.evidence);

            const verifyRes = await verifyClaim(claim, evidenceRes.evidence);
            setVerdict(verifyRes);
        } catch (error) {
            console.error("Error verifying claim:", error);
            alert("An error occurred during verification. Please check the console for details.");
        }
    }

    return (
        <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
            <h1>VeriNews</h1>

            <textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste news article text here"
                style={{ width: "100%" }}
            />

            <button onClick={analyze} style={{ marginTop: "12px" }}>
                Analyze
            </button>

            <h2>Claims</h2>
            <ul>
                {claims.map((c, i) => (
                    <li key={i}>
                        <button onClick={() => selectClaim(c)}>{c}</button>
                    </li>
                ))}
            </ul>

            {selectedClaim && (
                <>
                    <h2>Evidence</h2>
                    {evidence.map((e, i) => (
                        <div key={i} style={{ marginBottom: "12px" }}>
                            <a href={e.url} target="_blank">{e.title}</a>
                            <p>{e.snippet}</p>
                        </div>
                    ))}
                </>
            )}

            {verdict && (
                <>
                    <h2>Verdict</h2>
                    <strong>{verdict.verdict}</strong>
                    <p>{verdict.reason}</p>
                </>
            )}
        </div>
    );
}
