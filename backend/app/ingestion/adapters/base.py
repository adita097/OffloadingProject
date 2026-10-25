"""
Abstract Base Class for Dataset Adapters.
Enforces the Adapter pattern for parsing heterogeneous CSV/JSON files.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import os
import pandas as pd
from app.ingestion.schemas import TaskProfile


class BaseDatasetAdapter(ABC):
    """Abstract base class that all specific dataset adapters must implement."""

    def __init__(self, default_file_path: Optional[str] = None):
        self.default_file_path = default_file_path

    @abstractmethod
    def parse_row(self, row: pd.Series) -> TaskProfile:
        """Translates a single raw row (pandas Series/dict) into a unified TaskProfile."""
        pass

    def load_tasks(self, file_path: Optional[str] = None) -> List[TaskProfile]:
        """Loads and parses an entire CSV or JSON into a list of unified TaskProfiles."""
        target_path = file_path or self.default_file_path
        if not target_path or not os.path.exists(target_path):
            raise FileNotFoundError(f"Dataset file not found at: {target_path}")

        if target_path.endswith(".csv"):
            df = pd.read_csv(target_path)
        elif target_path.endswith(".json"):
            df = pd.read_json(target_path)
        else:
            raise ValueError(f"Unsupported file format: {target_path}. Must be .csv or .json")

        tasks: List[TaskProfile] = []
        for _, row in df.iterrows():
            try:
                task = self.parse_row(row)
                tasks.append(task)
            except Exception as e:
                # Log or skip corrupted rows
                continue

        return tasks
