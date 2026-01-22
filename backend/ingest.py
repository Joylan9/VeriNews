import requests
from bs4 import BeautifulSoup


def extract_article_from_url(url: str) -> dict:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=15,
        allow_redirects=True,
    )

    if response.status_code != 200:
        raise ValueError(
            f"Upstream site returned status {response.status_code}"
        )

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "noscript", "header", "footer", "aside"]):
        tag.decompose()

    title = "Untitled"
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    paragraphs = []

    for p in soup.find_all("p"):
        text = p.get_text(" ", strip=True)
        if len(text) >= 30:
            paragraphs.append(text)

    if not paragraphs:
        raise ValueError("No readable paragraphs found on page")

    return {
        "title": title,
        "content": "\n".join(paragraphs)
    }
