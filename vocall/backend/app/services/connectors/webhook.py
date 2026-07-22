import httpx
import json
from typing import Dict, Any

async def fire_webhook(config: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom Webhook connector — FULL IMPLEMENTATION.
    Fields: url, method, headers
    Fires HTTP request to configured URL with call summary payload.
    """
    url = config.get("url", "")
    method = config.get("method", "POST").upper()
    raw_headers = config.get("headers", "{}")

    if not url:
        return {"status": "error", "message": "Webhook URL is missing"}

    headers = {"Content-Type": "application/json"}
    if isinstance(raw_headers, str):
        try:
            parsed = json.loads(raw_headers)
            headers.update(parsed)
        except Exception:
            pass
    elif isinstance(raw_headers, dict):
        headers.update(raw_headers)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            if method == "GET":
                res = await client.get(url, headers=headers, params=payload)
            else:
                res = await client.post(url, headers=headers, json=payload)

            return {
                "status": "success" if res.status_code < 400 else "error",
                "connector": "webhook",
                "http_status": res.status_code,
                "response_body": res.text[:500],
                "payload_sent": payload
            }
    except Exception as e:
        return {
            "status": "error",
            "connector": "webhook",
            "message": f"Webhook call failed: {str(e)}",
            "payload_sent": payload
        }
