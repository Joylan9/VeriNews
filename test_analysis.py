import requests
import json

BASE_URL = "http://127.0.0.1:8000"

text = """Politics and Parliament
The Lok Sabha continues to face a stalemate, with opposition parties protesting specific issues and planning a potential no-confidence motion against Speaker Om Birla 
1
. Opposition MPs have raised concerns over the handling of the Union Budget 2026-27 discussion and the Prime Minister’s absence from debates, accusing government pressure on the Speaker 
1
.
Union Budget 2026 discussions remain in focus, with debates on employment, farmers' issues, and state allocations. Finance Minister Nirmala Sitharaman defended the budget against claims of bias toward Tamil Nadu 
1
.
DMK MP Tiruchi Siva filed a privilege notice against Commerce Minister Piyush Goyal for sharing details of an interim India-US trade deal during parliamentary sessions 
1
.
Sharad Pawar, NCP president, was hospitalized due to chest congestion, with stable condition reported by doctors 
1
.

1 Source
National Economy and Finance
India announced a $175 million economic package for Seychelles, including a $125 million line of credit and a $50 million grant, aimed at strengthening regional cooperation 
1
.
ISRO is investigating the PSLV-C62 launch mishap, with a Failure Analysis Committee reviewing telemetry and logs before future PSLV or SSLV missions proceed 
1
.
New labor codes are expected to enhance worker protections, ease of doing business, and social security access
1
 .

1 Source
International Affairs and Diplomatic Engagements
PM Narendra Modi visited Malaysia, meeting Prime Minister Anwar Ibrahim and business leaders, emphasizing collaboration in trade and aerospace manufacturing 
2
.
India and the US reached an interim trade agreement framework, providing tariff advantages and maintaining trade competitiveness 
1
.


2 Sources
Sports
The India-Pakistan T20 World Cup match will proceed as scheduled on February 15 in Colombo following PCB’s confirmation 
1
.
NBA updates include key absences affecting the Thunder vs Lakers game, with Shai Gilgeous-Alexander and Luka Doncic unavailable for today’s crucial Western Conference match 
1
."""

def analyze():
    print(f"Analyzing text ({len(text)} chars)...")

    # 1. Get Claims
    print("\n--- Extracting Claims ---")
    try:
        claims_resp = requests.post(f"{BASE_URL}/claims", json={"content": text})
        claims_resp.raise_for_status()
        claims = claims_resp.json().get("claims", [])
        print(f"Found {len(claims)} claims.")
    except Exception as e:
        print(f"Error extracting claims: {e}")
        return

    # 2. Verify each claim
    for i, claim in enumerate(claims):
        print(f"\nClaim {i+1}: {claim}")
        
        # Get Evidence
        print("  Finding evidence...")
        try:
            ev_resp = requests.post(f"{BASE_URL}/evidence", json={"claim": claim})
            if ev_resp.status_code == 404:
                print("  No evidence found.")
                continue
            ev_resp.raise_for_status()
            evidence = ev_resp.json().get("evidence", [])
            print(f"  Found {len(evidence)} evidence items.")
        except Exception as e:
            print(f"  Error finding evidence: {e}")
            continue

        # Verify
        print("  Verifying...")
        try:
            # The verify endpoint expects 'evidence' as a list of dicts.
            # Evidence items from /evidence match the structure needed.
            verify_resp = requests.post(f"{BASE_URL}/verify", json={
                "claim": claim, 
                "evidence": evidence
            })
            verify_resp.raise_for_status()
            result = verify_resp.json()
            print(f"  VERDICT: {result.get('verdict')}")
            print(f"  REASON: {result.get('reason')}")
        except Exception as e:
             print(f"  Error verifying: {e}")

if __name__ == "__main__":
    analyze()
