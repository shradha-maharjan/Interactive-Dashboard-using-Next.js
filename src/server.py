from flask import Flask, request, jsonify
from flask_cors import CORS
import io, base64
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

app = Flask(__name__)
CORS(app)  # allows connection from your Next.js frontend

@app.route("/api/logistic-regression", methods=["POST"])
def logistic_regression():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
    df = df.dropna()

    # Assume the last column is the target
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap="Blues")

    # Convert to base64 image
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    buf.close()

    html_plot = f'<img src="data:image/png;base64,{img_base64}" alt="Confusion Matrix" />'

    return jsonify({
        "message": "Model trained successfully!",
        "plot_html": html_plot
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
