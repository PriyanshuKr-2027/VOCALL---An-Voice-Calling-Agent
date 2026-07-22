"""
VoCall LLM Service — multi-provider with automatic Groq → Cerebras fallback.

generate(prompt, messages, api_keys):
  1. Try Groq llama-3.3-70b-versatile
  2. On HTTP 429 (rate-limit) → switch to Cerebras llama-3.3-70b
  Both use the OpenAI-compatible chat completions API.
  Only the base_url differs between providers.

api_keys dict keys (passed from agent config or org-level API key store):
  - groq_api_key   (falls back to settings.GROQ_API_KEY)
  - cerebras_api_key (falls back to settings.CEREBRAS_API_KEY)
"""

import logging
from typing import Optional, List, Dict, Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


GROQ_BASE_URL = "https://api.groq.com/openai/v1"
CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"
MODEL_NAME = "llama-3.3-70b-versatile"


class LLMService:
    """
    Stateless LLM service that wraps Groq and Cerebras via their
    OpenAI-compatible chat completions endpoint.

    The same request payload is re-used for both providers —
    only the Authorization header and base URL change on fallback.
    """

    async def generate(
        self,
        prompt: str,
        messages: Optional[List[Dict[str, str]]] = None,
        api_keys: Optional[Dict[str, str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 512,
    ) -> str:
        """
        Generates a completion from the LLM for the given prompt + message history.

        Args:
            prompt:     System instruction (injected as the first system message).
            messages:   Conversation history in [{"role": ..., "content": ...}] format.
            api_keys:   Optional overrides for provider API keys.
            temperature: Sampling temperature (default 0.7).
            max_tokens: Maximum tokens in response (default 512).

        Returns:
            The assistant's reply as a plain string.

        Raises:
            RuntimeError: If both providers fail.
        """
        api_keys = api_keys or {}

        groq_key = api_keys.get("groq_api_key") or settings.GROQ_API_KEY
        cerebras_key = api_keys.get("cerebras_api_key") or settings.CEREBRAS_API_KEY

        payload = self._build_payload(prompt, messages or [], temperature, max_tokens)

        # ---- 1. Try Groq ----
        if groq_key:
            try:
                logger.debug("LLM: calling Groq %s", MODEL_NAME)
                return await self._call_provider(
                    base_url=GROQ_BASE_URL,
                    api_key=groq_key,
                    payload=payload,
                )
            except RateLimitError:
                logger.warning("Groq rate-limited (429) — falling back to Cerebras")
            except Exception as exc:
                logger.error("Groq request failed: %s — trying Cerebras", exc)
        else:
            logger.debug("Groq API key not set, trying Cerebras directly")

        # ---- 2. Fallback: Cerebras ----
        if cerebras_key:
            try:
                logger.debug("LLM: calling Cerebras %s", MODEL_NAME)
                return await self._call_provider(
                    base_url=CEREBRAS_BASE_URL,
                    api_key=cerebras_key,
                    payload=payload,
                )
            except RateLimitError:
                raise RuntimeError("Both Groq and Cerebras are rate-limited. Retry later.")
            except Exception as exc:
                raise RuntimeError(f"Cerebras request also failed: {exc}") from exc

        raise RuntimeError(
            "No LLM API key available. Configure GROQ_API_KEY or CEREBRAS_API_KEY."
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _build_payload(
        prompt: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
    ) -> dict:
        """Assembles the OpenAI-format request body."""
        chat_messages = [{"role": "system", "content": prompt}] + messages
        return {
            "model": MODEL_NAME,
            "messages": chat_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

    @staticmethod
    async def _call_provider(base_url: str, api_key: str, payload: dict) -> str:
        """
        Makes a single HTTP POST to the provider's /chat/completions endpoint.
        Raises RateLimitError on HTTP 429, HTTPStatusError on other 4xx/5xx.
        """
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)

        if response.status_code == 429:
            raise RateLimitError(f"Rate limit hit at {base_url}")

        response.raise_for_status()

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise ValueError(f"Unexpected LLM response shape: {data}") from exc


class RateLimitError(Exception):
    """Raised when a provider returns HTTP 429."""


# Module-level singleton
llm_service = LLMService()
