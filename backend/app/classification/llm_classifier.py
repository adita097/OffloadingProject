"""
LLM Task Classifier using LangChain / Compatible Providers.
Implements structured output extraction with automatic fallback to RuleBasedTaskClassifier.
"""
import os
import logging
from typing import Optional
from app.ingestion.schemas import TaskProfile, TaskClassification
from app.classification.prompt import (
    CLASSIFICATION_SYSTEM_PROMPT,
    build_task_classification_user_prompt,
)
from app.classification.rule_classifier import RuleBasedTaskClassifier

logger = logging.getLogger(__name__)


class LLMTaskClassifier:
    """Invokes LLM with structured outputs to classify task requirements."""

    def __init__(
        self,
        provider: str = "auto",
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.provider = provider
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model_name = model_name
        self._llm = None
        self._init_model()

    def _init_model(self):
        """Initializes the underlying LangChain chat model if credentials exist."""
        if not self.api_key:
            return

        try:
            # Check for Google Gemini
            if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
                from langchain_google_genai import ChatGoogleGenerativeAI
                model = self.model_name or "gemini-1.5-flash"
                self._llm = ChatGoogleGenerativeAI(
                    model=model,
                    google_api_key=self.api_key,
                    temperature=0.1,
                )
            # Check for OpenAI
            elif os.getenv("OPENAI_API_KEY"):
                from langchain_openai import ChatOpenAI
                model = self.model_name or "gpt-4o-mini"
                self._llm = ChatOpenAI(
                    model=model,
                    api_key=self.api_key,
                    temperature=0.1,
                )
        except Exception as e:
            logger.warning(f"Could not initialize LLM model: {e}. Falling back to Rule-Based Classifier.")
            self._llm = None

    def classify_task(self, task: TaskProfile) -> TaskClassification:
        """
        Classifies task using LLM structured output.
        Falls back seamlessly to RuleBasedTaskClassifier if LLM is unavailable.
        """
        if not self._llm:
            return RuleBasedTaskClassifier.classify(task)

        user_prompt = build_task_classification_user_prompt(
            task_id=task.task_id,
            task_type=task.task_type,
            workload_gigaflops=task.workload_gigaflops,
            input_data_size_mb=task.input_data_size_mb,
            output_data_size_mb=task.output_data_size_mb,
            deadline_ms=task.deadline_ms,
            battery_remaining_pct=task.device_context.battery_remaining_pct,
        )

        try:
            # LangChain structured output
            structured_llm = self._llm.with_structured_output(TaskClassification)
            messages = [
                {"role": "system", "content": CLASSIFICATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]
            result = structured_llm.invoke(messages)
            if isinstance(result, TaskClassification):
                return result
            elif isinstance(result, dict):
                return TaskClassification(**result)
            else:
                return RuleBasedTaskClassifier.classify(task)
        except Exception as e:
            logger.warning(f"LLM classification invocation error: {e}. Using deterministic fallback.")
            fallback = RuleBasedTaskClassifier.classify(task)
            fallback.rationale += " (Note: LLM offline, evaluated via domain heuristic rules)"
            return fallback
