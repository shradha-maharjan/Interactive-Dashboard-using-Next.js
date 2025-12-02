import sys, json
from sklearn.neighbors import KNeighborsClassifier
from utils_eval import load_iris_dataset, split_and_scale, evaluate_model

def run(file_path=None):
    X, y, feature_names, target_names = load_iris_dataset(file_path)
    X_train, X_test, y_train, y_test = split_and_scale(X, y)
    model = KNeighborsClassifier(n_neighbors=5)
    metrics, cm = evaluate_model(model, X_train, X_test, y_train, y_test)

    result = {
        "model": "KNN Classifier",
        "metrics": metrics,
        "confusion_matrix": cm,
        "feature_names": feature_names,
        "target_names": target_names,
        "n_samples": int(len(X)),
        "n_features": int(len(feature_names))
    }

    print(json.dumps(result))
    sys.stdout.flush()

if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else None)
