import sys, os, json, warnings
warnings.filterwarnings("ignore")

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc
)
from sklearn.metrics import roc_curve, auc
from sklearn.preprocessing import label_binarize

os.environ["LOKY_MAX_CPU_COUNT"] = str(min(os.cpu_count() or 2, 4))

def load_dataset_from_csv(csv_path: str):
    """Load dataset strictly from the provided CSV file."""
    if not csv_path or not os.path.exists(csv_path):
        raise FileNotFoundError("No CSV file provided or file does not exist.")

    df = pd.read_csv(csv_path)
    if df.shape[1] < 2:
        raise ValueError("CSV must have at least one feature column and one target column.")

    # Assume last column is the label
    X = df.iloc[:, :-1].select_dtypes(include=[np.number])
    y = df.iloc[:, -1]

    # Encode labels if categorical
    if y.dtype == "object" or y.dtype.name == "category":
        le = LabelEncoder()
        y = le.fit_transform(y)
        target_names = list(le.classes_)
    else:
        target_names = [str(v) for v in np.unique(y)]

    feature_names = list(X.columns)
    return X.to_numpy(), y, feature_names, target_names, df

try:
    csv_arg = sys.argv[1] if len(sys.argv) > 1 else None
    selected_model = sys.argv[2] if len(sys.argv) > 2 else "logistic_regression"

    X, y, feature_names, target_names, df = load_dataset_from_csv(csv_arg)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.30, random_state=42, stratify=y
    )

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    # Model selection
    models = {}
    if selected_model == "logistic_regression":
        models = {"Logistic Regression": LogisticRegression(max_iter=500, random_state=42)}
    elif selected_model == "random_forest":
        models = {"Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42)}
    elif selected_model == "decision_tree":
        models = {"Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42)}
    elif selected_model == "knn":
        models = {"KNN": KNeighborsClassifier(n_neighbors=5)}
    elif selected_model == "gradient_boosting":
        models = {"Gradient Boosting": GradientBoostingClassifier(n_estimators=120, learning_rate=0.1, random_state=42)}
    else:
        models = {
            "KNN": KNeighborsClassifier(n_neighbors=5),
            "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
            "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42),
            "Gradient Boosting": GradientBoostingClassifier(n_estimators=120, learning_rate=0.1, random_state=42)
        }

    results = {}
    cv_scores_all = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        train_acc = model.score(X_train, y_train)

        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy", n_jobs=1)
        cv_scores_all[name] = cv_scores.tolist()

        results[name] = {
            "train_acc": float(train_acc),
            "test_acc": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "test_f1": float(f1),
        }

    best_model_name = max(results.items(), key=lambda kv: kv[1]["test_acc"])[0]
    best_model = models[best_model_name]
    y_best = best_model.predict(X_test)
    conf_mat = confusion_matrix(y_test, y_best).tolist()

    # Feature importance
    if hasattr(best_model, "feature_importances_"):
        feat_imp = best_model.feature_importances_.astype(float).tolist()
    else:
        feat_imp = [0.0] * len(feature_names)

    roc_points = []
    roc_auc_value = None
    if len(np.unique(y_test)) == 2 and hasattr(best_model, "predict_proba"):
        y_prob = best_model.predict_proba(X_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_auc_value = float(auc(fpr, tpr))
        roc_points = [{"fpr": float(f), "tpr": float(t)} for f, t in zip(fpr, tpr)]

    try:
        y_test_bin = label_binarize(y_test, classes=np.unique(y_test))
        if y_test_bin.shape[1] == 1:  
            y_test_bin = np.hstack([1 - y_test_bin, y_test_bin])

        if hasattr(best_model, "predict_proba"):
            y_score = best_model.predict_proba(X_test)
        elif hasattr(best_model, "decision_function"):
            y_score = best_model.decision_function(X_test)
            if y_score.ndim == 1:
                y_score = np.vstack([1 - y_score, y_score]).T
        else:
            y_score = np.zeros_like(y_test_bin, dtype=float)

        fpr, tpr, _ = roc_curve(y_test_bin.ravel(), y_score.ravel())
        roc_auc = auc(fpr, tpr)
        roc_points = [{"fpr": float(f), "tpr": float(t)} for f, t in zip(fpr, tpr)]
    except Exception as e:
        print("ROC curve calculation failed:", e)
        roc_points, roc_auc = [], 0.0

    model_names = list(results.keys())
    payload = {
        "model_names": model_names,
        "model_accuracy": [results[m]["test_acc"] for m in model_names],
        "train_accuracy": [results[m]["train_acc"] for m in model_names],
        "metrics": {
            "precision": [results[m]["precision"] for m in model_names],
            "recall": [results[m]["recall"] for m in model_names],
            "f1": [results[m]["test_f1"] for m in model_names]
        },
        "feature_importance": {"Feature": feature_names, "Importance": feat_imp},
        "confusion_matrix": conf_mat,
        "best_model_name": best_model_name,
        "target_names": target_names,
        "cv_scores": cv_scores_all,
        "roc_points": roc_points,
        "roc_auc": roc_auc_value,
        "summary": {
            "best_model": best_model_name,
            "best_accuracy": round(max([results[m]["test_acc"] for m in model_names]), 4),
            "total_samples": len(df),
            "num_features": len(feature_names)
        },
        "n_samples": int(len(df)),
        "n_features": int(len(feature_names))
    }

    print(json.dumps(payload, ensure_ascii=False, default=lambda o: float(o)))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
