import json, sys, os, warnings
warnings.filterwarnings("ignore")

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

def load_iris_dataset(csv_path=None):
    """Load Iris dataset (CSV or sklearn fallback)."""
    if csv_path and os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        if "Species" in df.columns:
            df["species_code"] = df["Species"].astype("category").cat.codes
            X = df.iloc[:, :-2].to_numpy()
            y = df["species_code"].to_numpy()
            feature_names = list(df.columns[:-2])
            target_names = list(df["Species"].unique())
            return X, y, feature_names, target_names
    iris = load_iris()
    return iris.data, iris.target, list(iris.feature_names), list(iris.target_names)

def split_and_scale(X, y):
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return train_test_split(X_scaled, y, test_size=0.3, random_state=42, stratify=y)

def evaluate_model(model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="weighted")),
        "recall": float(recall_score(y_test, y_pred, average="weighted")),
        "f1": float(f1_score(y_test, y_pred, average="weighted")),
    }
    cm = confusion_matrix(y_test, y_pred).tolist()
    return metrics, cm
