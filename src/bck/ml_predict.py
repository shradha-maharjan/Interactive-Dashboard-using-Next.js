import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import json

def main():
    path = sys.argv[1]
    df = pd.read_csv(path)
    df.columns = ["snr", "rate_selected", "observed"]

    X = df[["snr", "rate_selected"]]
    y = df["observed"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    metrics = {
        "mae": round(mean_absolute_error(y_test, y_pred), 3),
        "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
        "r2": round(r2_score(y_test, y_pred), 3),
        "accuracy": round(1 - (mean_absolute_error(y_test, y_pred) / y_test.mean()), 3),
    }

    print(json.dumps({"metrics": metrics}))

if __name__ == "__main__":
    main()

