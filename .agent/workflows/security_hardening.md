---
description: Standard workflow for hardening application security and implementing the Security Check splash screen.
---

# Security Hardening Standard

This workflow outlines the mandatory security measures and visual standards for all AI models working on this project or future projects.

## 1. Rate Limiting (Backend)
-   **Requirement**: Implement rate limiting on ALL public endpoints.
-   **Method**: Use IP-based and/or user-based limits.
-   **Configuration**:
    -   Set sensible defaults (e.g., 5-10 requests/minute for heavy endpoints, 60/minute for light ones).
    -   Ensure `429 Too Many Requests` responses are graceful (JSON with `detail` message).
-   **Implementation (Python/FastAPI)**: Use `slowapi`.
-   **Implementation (Node/Express)**: Use `express-rate-limit`.

## 2. Input Validation (Backend & Frontend)
-   **Requirement**: Strict validation on ALL user inputs.
-   **Method**: Use schema-based validation libraries.
-   **Checks**:
    -   **Length Limits**: Enforce maximum character lengths (e.g., `MAX_CHARS = 10000`).
    -   **Type Safety**: Validate data types (e.g., specific URL types, integers vs strings).
    -   **Sanitization**: Reject unexpected fields and sanitize inputs to prevent injection (SQL/XSS).
-   **Frontend**: Add visual feedback (character counters, error toasts) and block submission of invalid data.
-   **Backend**: Return `422 Unprocessable Entity` for invalid payloads.

## 3. Secure Configuration (DevOps)
-   **Requirement**: No hardcoded secrets.
-   **Method**: Use Environment Variables (`.env`).
-   **Keys**: Store API keys, DB credentials, and secrets in `.env`.
-   **CORS**: Configure CORS allowed origins via environment variables.
-   **Rotation**: Design for easy key rotation.
-   **Client-Side**: NEVER expose backend secrets to the client.

## 4. "Security Check" Splash Screen (UX)
-   **Requirement**: Display a seamless security verification screen on initial load.
-   **Visual Style**:
    -   **Background**: Plain empty background (White/Dark).
    -   **Typography**: Clean, modern font (Sans-serif, light/regular weight).
    -   **Animation**: Typing effect ("Security Check..." or similar).
    -   **Duration**: 1-2 seconds.
    -   **Elements**: NOTHING ELSE on screen (no logos, spinners, or clutter).
-   **Behavior**: Blocks app interaction until the "check" completes.

## 5. Verification Steps
1.  **Test Rate Limits**: Script rapid requests to trigger 429.
2.  **Test Oversized Input**: Submit payload > MAX_CHARS and verify 422 error.
3.  **Test Splash Screen**: Verify clean typing animation on load.
