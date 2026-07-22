from app.services.emotion.text_signal import analyze_text_emotion
from app.services.emotion.audio_signal import analyze_audio_emotion
from app.services.emotion.fusion import fuse_emotion_signals
from app.services.emotion.tone_adapter import (
    get_tone_instruction,
    fire_frustration_connector,
)

__all__ = [
    "analyze_text_emotion",
    "analyze_audio_emotion",
    "fuse_emotion_signals",
    "get_tone_instruction",
    "fire_frustration_connector",
]
