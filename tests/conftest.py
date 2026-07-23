"""
conftest.py — Shared pytest setup & sys.modules mock initialization.

Mocks optional heavy third-party packages (livekit, twilio, supabase, etc.)
so that tests can run cleanly in light Python environments without external dependencies installed.
"""
import sys
from unittest.mock import MagicMock

# ── 1. Create dummy modules for optional third-party packages ───────────

class DummyModule(MagicMock):
    pass

def mock_missing_modules():
    missing = [
        "livekit",
        "livekit.api",
        "twilio",
        "twilio.rest",
        "twilio.request_validator",
        "supabase",
        "postgrest",
        "falkordb",
        "redis",
        "asyncpg",
    ]
    for mod_name in missing:
        if mod_name not in sys.modules:
            mock_mod = MagicMock()
            sys.modules[mod_name] = mock_mod

mock_missing_modules()

import pytest
from unittest.mock import patch


@pytest.fixture(scope="session", autouse=True)
def patch_external_services():
    """Patch all external service imports before any module loads them."""
    with patch("app.services.supabase_client.supabase", None), \
         patch("app.services.supabase_client.get_supabase_client", return_value=None):
        yield
