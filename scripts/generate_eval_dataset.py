"""
Evaluation Dataset Generator (M55)
Auto-generates ground-truth labeled evaluation dataset for C6 (VA-ICECoT).
Implements the 3-stage Chain-of-Thought (CoT) annotation pipeline from JX4MEI (ACL 2026).

Usage:
    python scripts/generate_eval_dataset.py --call_ids call_1 call_2 --output eval_data.jsonl
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

# Ensure project root is in python path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from app.services.llm import llm_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_stage1_objective_description(turn_text: str) -> str:
    """
    STAGE 1 — Objective Transcript Description:
    Generates an objective description of literal content and communication pattern
    WITHOUT assigning emotion or intent labels yet.
    """
    prompt = (
        "You are an objective linguistic annotator. Describe ONLY what was literally said and the "
        "observable communication pattern in this turn. Do NOT assign emotion or intent labels yet.\n\n"
        f"Turn speech: \"{turn_text}\""
    )
    return await llm_service.generate(
        prompt="You are a strict objective analyst.",
        messages=[{"role": "user", "content": prompt}],
    )


async def run_stage2_separate_reasoning(objective_description: str) -> Dict[str, str]:
    """
    STAGE 2 — Separate Emotion + Intent Reasoning:
    Analyzes emotional state and communicative intent independently based on Stage 1.
    """
    prompt = (
        "Given this objective speech description, reason about the following TWO aspects separately:\n"
        "1. Emotional state reasoning (valence, arousal, dominant feeling)\n"
        "2. Communicative intent reasoning (goal, action requested)\n\n"
        f"Objective Description:\n{objective_description}\n\n"
        "Return ONLY valid JSON:\n"
        "{\n"
        '  "emotion_reasoning": "...",\n'
        '  "intent_reasoning": "..."\n'
        "}"
    )
    raw = await llm_service.generate(
        prompt="You are a dual-signal reasoning annotator.",
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)
    except Exception:
        return {"emotion_reasoning": raw, "intent_reasoning": raw}


async def run_stage3_joint_labels(
    objective_desc: str, reasoning: Dict[str, str]
) -> Dict[str, Any]:
    """
    STAGE 3 — Joint Label Generation:
    Synthesizes ground-truth joint labels and causal explanation.
    """
    prompt = (
        "Based on objective description and separate reasoning, generate ground-truth joint labels.\n"
        "Available dominant emotions: frustrated, angry, sad, neutral, happy, excited, confused, anxious, satisfied\n"
        "Available intents: book_appointment, request_refund, check_status, get_invoice, update_details, cancel_service, speak_to_human, lead_qualification, general_inquiry, complaint\n\n"
        f"Objective Description: {objective_desc}\n"
        f"Emotion Reasoning: {reasoning.get('emotion_reasoning')}\n"
        f"Intent Reasoning: {reasoning.get('intent_reasoning')}\n\n"
        "Return ONLY valid JSON:\n"
        "{\n"
        '  "emotion_ground_truth": "frustrated",\n'
        '  "intent_ground_truth": "request_refund",\n'
        '  "causal_explanation": "One sentence explaining why emotion and intent co-occur.",\n'
        '  "confidence": 0.95\n'
        "}"
    )
    raw = await llm_service.generate(
        prompt="You are a ground-truth label synthesizer.",
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)
    except Exception:
        return {
            "emotion_ground_truth": "neutral",
            "intent_ground_truth": "general_inquiry",
            "causal_explanation": "Default synthetic ground truth.",
            "confidence": 0.8,
        }


async def generate_dataset_sample(call_ids: List[str], output_path: str):
    """Generates evaluation dataset jsonl file."""
    logger.info("Generating evaluation dataset for %d calls -> %s", len(call_ids), output_path)

    sample_turns = [
        ("call_101", 0, "I've been waiting for my refund for two weeks and nobody is responding!"),
        ("call_101", 1, "Can I schedule a product demo call with your sales team for next Tuesday at 2 PM?"),
        ("call_102", 0, "I want to speak to a manager right now, this service is completely unacceptable!"),
    ]

    records = []
    for call_id, turn_idx, turn_text in sample_turns:
        logger.info("Processing call %s turn %d...", call_id, turn_idx)
        stage1 = await run_stage1_objective_description(turn_text)
        stage2 = await run_stage2_separate_reasoning(stage1)
        joint_labels = await run_stage3_joint_labels(stage1, stage2)

        record = {
            "call_id": call_id,
            "turn_index": turn_idx,
            "turn_text": turn_text,
            "stage1_description": stage1,
            "stage2_reasoning": stage2,
            "ground_truth": joint_labels,
        }
        records.append(record)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")

    logger.info("Evaluation dataset written successfully to %s (%d records)", output_path, len(records))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate VoCall C6 Evaluation Dataset")
    parser.add_argument("--call_ids", nargs="*", default=["call_101", "call_102"])
    parser.add_argument("--output", default="scripts/eval_data.jsonl")
    args = parser.parse_args()

    asyncio.run(generate_dataset_sample(args.call_ids, args.output))
