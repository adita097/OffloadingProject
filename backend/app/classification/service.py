"""
Task Classification Service: Master Orchestrator for Stage 3.
Provides caching, batch processing, and transparent LLM/Rule-based routing.
"""
from typing import Dict, List, Optional
from app.ingestion.schemas import TaskProfile, TaskClassification
from app.classification.llm_classifier import LLMTaskClassifier
from app.classification.rule_classifier import RuleBasedTaskClassifier


class TaskClassificationService:
    """Provides managed classification access with in-memory caching."""

    def __init__(self, use_llm: bool = True):
        self.use_llm = use_llm
        self.llm_classifier = LLMTaskClassifier() if use_llm else None
        self._cache: Dict[str, TaskClassification] = {}

    def classify(self, task: TaskProfile, force_refresh: bool = False) -> TaskClassification:
        """Classifies a task, using cache when available to avoid redundant LLM invocations."""
        if not force_refresh and task.task_id in self._cache:
            return self._cache[task.task_id]

        if self.use_llm and self.llm_classifier:
            classification = self.llm_classifier.classify_task(task)
        else:
            classification = RuleBasedTaskClassifier.classify(task)

        self._cache[task.task_id] = classification
        return classification

    def classify_batch(self, tasks: List[TaskProfile]) -> List[TaskClassification]:
        """Classifies a list of tasks."""
        return [self.classify(t) for t in tasks]
