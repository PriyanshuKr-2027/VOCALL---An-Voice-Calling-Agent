import time
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


def fuse_emotion_signals(
    text: Optional[Dict[str, Any]],
    audio: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Fuses text-based (Groq NLP) and audio-based (Hume AI) emotion signals
    into a single unified emotion state.

    Fusion weighting rules:
      - If audio is available and text is available:
          valence = 0.6 * audio['valence'] + 0.4 * text['valence']
          arousal = 0.6 * audio['arousal'] + 0.4 * text['arousal']
          dominant = audio['dominant'] if audio['confidence'] > 0.6 else text['dominant']
          confidence = max(audio['confidence'], text['confidence'])
      - If audio is available and text is None:
          uses audio signal values directly.
      - If audio is None and text is available:
          uses text signal values directly (text-only mode).
      - If both are None:
          returns fallback neutral state.

    Returns:
        dict: {
            "valence": float (-1.0 to 1.0),
            "arousal": float (0.0 to 1.0),
            "dominant": str,
            "confidence": float (0.0 to 1.0),
            "timestamp": int (unix timestamp ms)
        }
    """
    now_ms = int(time.time() * 1000)

    if audio is not None and isinstance(audio, dict):
        audio_val = float(audio.get("valence", 0.0))
        audio_aro = float(audio.get("arousal", 0.5))
        audio_dom = str(audio.get("dominant", "neutral"))
        audio_conf = float(audio.get("confidence", 0.5))

        if text is not None and isinstance(text, dict):
            text_val = float(text.get("valence", 0.0))
            text_aro = float(text.get("arousal", 0.5))
            text_dom = str(text.get("dominant", "neutral"))
            text_conf = float(text.get("confidence", 0.5))

            valence = 0.6 * audio_val + 0.4 * text_val
            arousal = 0.6 * audio_aro + 0.4 * text_aro
            dominant = audio_dom if audio_conf > 0.6 else text_dom
            confidence = max(audio_conf, text_conf)
        else:
            # Audio-only mode
            valence = audio_val
            arousal = audio_aro
            dominant = audio_dom
            confidence = audio_conf

    elif text is not None and isinstance(text, dict):
        # Text-only mode
        valence = float(text.get("valence", 0.0))
        arousal = float(text.get("arousal", 0.5))
        dominant = str(text.get("dominant", "neutral"))
        confidence = float(text.get("confidence", 0.5))

    else:
        # Fallback neutral mode
        valence = 0.0
        arousal = 0.5
        dominant = "neutral"
        confidence = 0.0

    # Clamp ranges
    valence = round(max(-1.0, min(1.0, valence)), 3)
    arousal = round(max(0.0, min(1.0, arousal)), 3)
    confidence = round(max(0.0, min(1.0, confidence)), 3)

    return {
        "valence": valence,
        "arousal": arousal,
        "dominant": dominant,
        "confidence": confidence,
        "timestamp": now_ms,
    }
