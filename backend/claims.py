import spacy
from functools import lru_cache


@lru_cache(maxsize=1)
def get_nlp():
    return spacy.load("en_core_web_sm")


def extract_claims(text: str) -> list[str]:
    nlp = get_nlp()  # loaded once, reused

    claims = []
    doc = nlp(text)

    for sent in doc.sents:
        sentence = sent.text.strip()

        if len(sentence) < 30:
            continue

        sent_doc = nlp(sentence)

        has_entity = any(
            ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "NORP"}
            for ent in sent_doc.ents
        )
        has_verb = any(token.pos_ == "VERB" for token in sent_doc)

        if has_entity and has_verb:
            claims.append(sentence)

    return claims
