import requests
from bs4 import BeautifulSoup

WIKI_API = "https://en.wikipedia.org/w/api.php"

HEADERS = {
    "User-Agent": "VeriNews/1.0 (contact: dev@example.com)"
}


def search_wikipedia(claim: str, limit: int = 3) -> list[dict]:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": claim,
        "format": "json",
    }

    res = requests.get(
        WIKI_API,
        params=params,
        headers=HEADERS,
        timeout=10,
    )

    # DO NOT crash on external failure
    if res.status_code != 200:
        return []

    data = res.json()
    results = data.get("query", {}).get("search", [])[:limit]

    evidence = []

    for item in results:
        title = item["title"]
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"

        page_res = requests.get(url, headers=HEADERS, timeout=10)
        if page_res.status_code != 200:
            continue

        soup = BeautifulSoup(page_res.text, "html.parser")

        snippet = ""
        for p in soup.find_all("p"):
            text = p.get_text(" ", strip=True)
            if len(text) > 60:
                snippet = text
                break

        if snippet:
            evidence.append({
                "source": "Wikipedia",
                "title": title,
                "url": url,
                "snippet": snippet
            })

    return evidence
