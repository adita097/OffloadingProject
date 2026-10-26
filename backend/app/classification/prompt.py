"""
Classification Prompt Templates and Edge-Fog-Cloud Domain Rules.
"""

CLASSIFICATION_SYSTEM_PROMPT = """You are an expert Edge-Fog-Cloud Computing Systems Architect.
Your task is to analyze an incoming computational IoT workload and classify its requirements to guide mathematical cost modeling.

You must categorize the task across three dimensions:
1. compute_intensity: [LOW | MEDIUM | HIGH]
   - LOW: < 0.4 GFLOPs (simple telemetry, threshold alarms)
   - MEDIUM: 0.4 to 1.0 GFLOPs (audio feature extraction, image preprocessing)
   - HIGH: > 1.0 GFLOPs (deep CNN object detection, video encoding, cryptography)

2. data_intensity: [LOW | MEDIUM | HIGH]
   - LOW: < 1.0 MB (sensor logs, telemetry packets)
   - MEDIUM: 1.0 to 5.0 MB (high-resolution camera frames, audio samples)
   - HIGH: > 5.0 MB (raw video bursts, large binary datasets)

3. latency_sensitivity: [CRITICAL | MODERATE | TOLERANT]
   - CRITICAL: deadline <= 250 ms (real-time collision avoidance, emergency braking)
   - MODERATE: deadline between 250 ms and 1000 ms (interactive audio, responsive UI)
   - TOLERANT: deadline > 1000 ms (batch logging, non-urgent background sync)

4. weights: Derive alpha (latency weight) and beta (energy weight) between 0.0 and 1.0:
   - Sum must strictly equal 1.0: alpha + beta = 1.0.
   - For CRITICAL latency, alpha should be 0.70 - 0.85.
   - For MODERATE latency, alpha should be 0.50 - 0.60.
   - For TOLERANT latency, beta should dominate (beta = 0.60 - 0.80).
   - If device battery is low (< 25%), increase beta to preserve device life, unless latency is strictly CRITICAL.

5. rationale: A concise 1-2 sentence technical justification for your classification.
"""

def build_task_classification_user_prompt(
    task_id: str,
    task_type: str,
    workload_gigaflops: float,
    input_data_size_mb: float,
    output_data_size_mb: float,
    deadline_ms: float,
    battery_remaining_pct: float,
) -> str:
    """Formats task attributes into a clear prompt for the LLM."""
    return f"""Analyze and classify this task:
- Task ID: {task_id}
- Task Type: {task_type}
- Computational Workload: {workload_gigaflops} GFLOPs
- Input Payload Data: {input_data_size_mb} MB
- Output Return Data: {output_data_size_mb} MB
- Latency Deadline: {deadline_ms} ms
- End-Device Battery Remaining: {battery_remaining_pct}%

Classify this task according to the domain guidelines and output structured JSON.
"""
