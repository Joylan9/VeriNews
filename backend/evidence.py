import requests
from bs4 import BeautifulSoup
import spacy

nlp = spacy.load("en_core_web_sm")

WIKI_API = "https://en.wikipedia.org/w/api.php"

HEADERS = {
    "User-Agent": "VeriNews/1.0 (contact: dev@example.com)"
}


def extract_core_entities(claim: str) -> dict:
    """
    Extract core entities needed for constrained search.
    """
    doc = nlp(claim)

    entities = {
        "countries": [],
        "dates": [],
        "numbers": [],
        "keywords": []
    }

    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC"]:
            entities["countries"].append(ent.text)
        elif ent.label_ == "DATE":
            entities["dates"].append(ent.text)
        elif ent.label_ in ["CARDINAL", "QUANTITY"]:
            entities["numbers"].append(ent.text)

    # fallback keywords (nouns)
    entities["keywords"] = [
        token.text
        for token in doc
        if token.pos_ == "NOUN" and not token.is_stop
    ]

    return entities


def search_wikipedia(claim: str, limit: int = 3) -> list[dict]:
    """
    Enterprise-safe evidence retrieval:
    - Entity-aware search
    - Relevance filtering
    - No crashes on upstream failure
    """

    entities = extract_core_entities(claim)
    countries = entities["countries"]

    # Build constrained query
    query_parts = []
    if countries:
        query_parts.append(countries[0])
    query_parts.extend(entities["keywords"][:3])

    search_query = " ".join(query_parts)

    params = {
        "action": "query",
        "list": "search",
        "srsearch": search_query,
        "format": "json",
    }

    try:
        res = requests.get(
            WIKI_API,
            params=params,
            headers=HEADERS,
            timeout=10,
        )
    except requests.RequestException:
        return []

    if res.status_code != 200:
        return []

    data = res.json()
    results = data.get("query", {}).get("search", [])[:limit]

    evidence = []

    for item in results:
        title = item["title"]
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"

        try:
            page_res = requests.get(url, headers=HEADERS, timeout=10)
        except requests.RequestException:
            continue

        if page_res.status_code != 200:
            continue

        soup = BeautifulSoup(page_res.text, "html.parser")

        for p in soup.find_all("p"):
            text = p.get_text(" ", strip=True)

            # HARD relevance filter
            if countries and countries[0].lower() not in text.lower():
                continue

            if len(text) < 80:
                continue

            evidence.append({
                "source": "Wikipedia",
                "title": title,
                "url": url,
                "snippet": text
            })
            break

    return evidence
