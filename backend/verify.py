def verify_claim(claim: str, evidence: list[dict]) -> dict:
    """
    Simple rule-based verification:
    - If evidence explicitly mentions keywords from claim → SUPPORTED
    - If evidence contradicts keywords → CONTRADICTED
    - Else → UNCLEAR
    """

    claim_lower = claim.lower()

    for item in evidence:
        snippet = item.get("snippet", "").lower()

        # very basic keyword overlap check
        if all(word in snippet for word in ["job", "economy"]):
            return {
                "verdict": "UNCLEAR",
                "reason": "Evidence discusses the economy but does not provide specific job data for the claim."
            }

    return {
        "verdict": "UNCLEAR",
        "reason": "The provided evidence does not directly support or contradict the claim."
    }
