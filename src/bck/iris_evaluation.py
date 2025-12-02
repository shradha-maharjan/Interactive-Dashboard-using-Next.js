# import sys, pandas as pd

# import pandas as pd
# import numpy as np
# import matplotlib.pyplot as plt
# import seaborn as sns
# from sklearn.datasets import load_iris
# from sklearn.model_selection import (train_test_split, cross_val_score, 
#                                       GridSearchCV, StratifiedKFold)
# from sklearn.preprocessing import StandardScaler, RobustScaler
# from sklearn.neighbors import KNeighborsClassifier
# from sklearn.linear_model import LogisticRegression
# from sklearn.tree import DecisionTreeClassifier
# from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
# from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
#                              f1_score, confusion_matrix, classification_report,
#                              roc_auc_score, roc_curve, auc)
# from sklearn.model_selection import learning_curve
# import warnings
# warnings.filterwarnings('ignore')
# sns.set_style("whitegrid")
# sns.set_palette("husl")
# plt.rcParams['figure.figsize'] = (18, 14)
# plt.rcParams['font.size'] = 10

# # accept the uploaded CSV path as an argument
# if len(sys.argv) > 1:
#     input_path = sys.argv[1]
# else:
#     input_path = 'C:/Users/FLEX/Documents/lab-project/frontend/scripts/Iris.csv'

# # everything else in your script stays the same
# df_raw = pd.read_csv(input_path)

# try:
#     df_raw = pd.read_csv('C:/Users/FLEX/Documents/lab-project/frontend/scripts/Iris.csv')
#     print("Loaded from Kaggle CSV file")
    
#     # Extract features and target
#     X = df_raw[['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm']].values
#     y_species = df_raw['Species'].values
    
#     # Map species names to numbers
#     species_map = {'Iris-setosa': 0, 'Iris-versicolor': 1, 'Iris-virginica': 2}
#     y = np.array([species_map[s] for s in y_species])
    
#     # Create iris object for compatibility
#     class IrisData:
#         data = X
#         target = y
#         target_names = np.array(['setosa', 'versicolor', 'virginica'])
#         feature_names = ['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']
    
#     iris = IrisData()
    
# except FileNotFoundError:
#     # OPTION 2: From scikit-learn (No download needed)
#     print(" CSV file not found, loading from scikit-learn")
#     iris = load_iris()
#     X = iris.data
#     y = iris.target

# # Create comprehensive DataFrame
# df = pd.DataFrame(X, columns=iris.feature_names)
# df['species'] = iris.target_names[y]
# df['species_code'] = y

# print(f" Dataset loaded successfully!")
# print(f"Total samples: {len(df)}")
# print(f"Total features: {X.shape[1]}")
# print(f"Target classes: {len(iris.target_names)}")
# print(f"Classes: {', '.join(iris.target_names)}\n")

# print("Dataset Preview:")
# print(df.head(10))
# print("\nDataset Information:")
# print(f"  Shape: {df.shape}")
# print(f"  Data types:\n{df.dtypes}")
# print(f"  Missing values: {df.isnull().sum().sum()}")
# print(f"  Duplicate rows: {df.duplicated().sum()}\n")

# # EXPLORATORY DATA ANALYSIS (EDA)
# # Statistical Summary
# print("Statistical Summary by Species:")
# print(df.groupby('species').describe().round(3))

# print("\nSpecies Distribution:")
# species_counts = df['species'].value_counts()
# for species, count in species_counts.items():
#     percentage = (count / len(df)) * 100
#     print(f"  {species.capitalize()}: {count} ({percentage:.1f}%)")

# # Check for outliers
# print("\nOutlier Detection (using IQR method):")
# for col in iris.feature_names:
#     Q1 = df[col].quantile(0.25)
#     Q3 = df[col].quantile(0.75)
#     IQR = Q3 - Q1
#     outliers = df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)]
#     print(f"  {col}: {len(outliers)} outliers detected")

# # Feature correlation analysis
# print("\nCorrelation Analysis:")
# corr_matrix = df[iris.feature_names].corr()
# print(corr_matrix.round(3))

# # DATA PREPROCESSING & PREPARATION
# # Check for missing values
# print(f"Missing values: {df.isnull().sum().sum()}")

# # Feature scaling
# scaler_standard = StandardScaler()
# scaler_robust = RobustScaler()

# X_scaled_standard = scaler_standard.fit_transform(X)
# X_scaled_robust = scaler_robust.fit_transform(X)

# print(f" Features scaled using StandardScaler")
# print(f"Feature means: {X_scaled_standard.mean(axis=0).round(3)}")
# print(f"Feature stds: {X_scaled_standard.std(axis=0).round(3)}\n")

# # Stratified train-test split (maintains class distribution)
# X_train, X_test, y_train, y_test = train_test_split(
#     X_scaled_standard, y, test_size=0.3, random_state=42, stratify=y
# )

# print(f"Train-Test Split (Stratified):")
# print(f"Training set: {X_train.shape[0]} samples ({X_train.shape[0]/len(X)*100:.1f}%)")
# print(f"Testing set: {X_test.shape[0]} samples ({X_test.shape[0]/len(X)*100:.1f}%)\n")

# print(f"Training set class distribution:")
# for i, species in enumerate(iris.target_names):
#     count = (y_train == i).sum()
#     print(f"{species}: {count} ({count/len(y_train)*100:.1f}%)")

# print(f"\nTesting set class distribution:")
# for i, species in enumerate(iris.target_names):
#     count = (y_test == i).sum()
#     print(f"{species}: {count} ({count/len(y_test)*100:.1f}%)")

# # MODEL TRAINING & HYPERPARAMETER TUNING
# # Define CV strategy
# cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# # Model 1: K-Nearest Neighbors
# print("\nK-Nearest Neighbors (KNN)")
# knn_params = {
#     'n_neighbors': [3, 5, 7, 9, 11],
#     'weights': ['uniform', 'distance'],
#     'metric': ['euclidean', 'manhattan']
# }
# knn_grid = GridSearchCV(KNeighborsClassifier(), knn_params, cv=cv, scoring='accuracy', n_jobs=-1)
# knn_grid.fit(X_train, y_train)
# knn_best = knn_grid.best_estimator_
# print(f"  Best parameters: {knn_grid.best_params_}")
# print(f"  Best CV Score: {knn_grid.best_score_:.4f}")

# # Model 2: Logistic Regression
# print("\nLogistic Regression")
# lr_params = {
#     'C': [0.001, 0.01, 0.1, 1, 10],
#     'penalty': ['l2'],
#     'solver': ['lbfgs', 'liblinear']
# }
# lr_grid = GridSearchCV(LogisticRegression(max_iter=1000, random_state=42), 
#                        lr_params, cv=cv, scoring='accuracy', n_jobs=1)
# lr_grid.fit(X_train, y_train)
# lr_best = lr_grid.best_estimator_
# print(f"  Best parameters: {lr_grid.best_params_}")
# print(f"  Best CV Score: {lr_grid.best_score_:.4f}")

# # Model 3: Decision Tree
# print("\n Decision Tree Classifier")
# dt_params = {
#     'max_depth': [3, 5, 7, 9, None],
#     'min_samples_split': [2, 5, 10],
#     'min_samples_leaf': [1, 2, 4],
#     'criterion': ['gini', 'entropy']
# }
# dt_grid = GridSearchCV(DecisionTreeClassifier(random_state=42), 
#                        dt_params, cv=cv, scoring='accuracy', n_jobs=-1)
# dt_grid.fit(X_train, y_train)
# dt_best = dt_grid.best_estimator_
# print(f"  Best parameters: {dt_grid.best_params_}")
# print(f"  Best CV Score: {dt_grid.best_score_:.4f}")

# # Model 4: Random Forest
# print("\n Random Forest Classifier")
# rf_params = {
#     'n_estimators': [50, 100, 200],
#     'max_depth': [5, 10, 15, None],
#     'min_samples_split': [2, 5],
#     'min_samples_leaf': [1, 2],
#     'max_features': ['sqrt', 'log2']
# }
# rf_grid = GridSearchCV(RandomForestClassifier(random_state=42, n_jobs=1), 
#                        rf_params, cv=cv, scoring='accuracy', n_jobs=1)
# rf_grid.fit(X_train, y_train)
# rf_best = rf_grid.best_estimator_
# print(f"  Best parameters: {rf_grid.best_params_}")
# print(f"  Best CV Score: {rf_grid.best_score_:.4f}")

# # Model 5: Gradient Boosting
# print("\n Gradient Boosting Classifier")
# gb_params = {
#     'n_estimators': [100, 200],
#     'learning_rate': [0.01, 0.05, 0.1],
#     'max_depth': [3, 5, 7],
#     'subsample': [0.8, 0.9]
# }
# gb_grid = GridSearchCV(GradientBoostingClassifier(random_state=42), 
#                        gb_params, cv=cv, scoring='accuracy', n_jobs=1)
# gb_grid.fit(X_train, y_train)
# gb_best = gb_grid.best_estimator_
# print(f"  Best parameters: {gb_grid.best_params_}")
# print(f"  Best CV Score: {gb_grid.best_score_:.4f}")

# # MODEL EVALUATION & COMPARISON
# models = {
#     'KNN': knn_best,
#     'Logistic Regression': lr_best,
#     'Decision Tree': dt_best,
#     'Random Forest': rf_best,
#     'Gradient Boosting': gb_best
# }

# results = {}

# print("\nTraining Set Performance:")
# print("-" * 80)
# for name, model in models.items():
#     y_train_pred = model.predict(X_train)
#     train_acc = accuracy_score(y_train, y_train_pred)
#     train_f1 = f1_score(y_train, y_train_pred, average='weighted')
#     results[name] = {'train_acc': train_acc, 'train_f1': train_f1}
#     print(f"{name:25} Accuracy: {train_acc:.4f}  |  F1-Score: {train_f1:.4f}")

# print("\nTesting Set Performance:")
# print("-" * 80)
# for name, model in models.items():
#     y_test_pred = model.predict(X_test)
#     test_acc = accuracy_score(y_test, y_test_pred)
#     test_f1 = f1_score(y_test, y_test_pred, average='weighted')
#     precision = precision_score(y_test, y_test_pred, average='weighted')
#     recall = recall_score(y_test, y_test_pred, average='weighted')
    
#     results[name]['test_acc'] = test_acc
#     results[name]['test_f1'] = test_f1
#     results[name]['precision'] = precision
#     results[name]['recall'] = recall
    
#     print(f"\n{name}:")
#     print(f"  Accuracy:  {test_acc:.4f}")
#     print(f"  Precision: {precision:.4f}")
#     print(f"  Recall:    {recall:.4f}")
#     print(f"  F1-Score:  {test_f1:.4f}")

# # Best model
# best_model_name = max(results.items(), key=lambda x: x[1]['test_acc'])[0]
# best_model = models[best_model_name]
# best_acc = results[best_model_name]['test_acc']

# print(f"\n{'='*80}")
# print(f" BEST MODEL: {best_model_name} with {best_acc:.4f} ({best_acc*100:.2f}%) accuracy!")
# print(f"{'='*80}")

# # Detailed classification report for best model
# y_test_pred_best = best_model.predict(X_test)
# print(f"\nDetailed Classification Report ({best_model_name}):")
# print("-" * 80)
# print(classification_report(y_test, y_test_pred_best, target_names=iris.target_names))

# # Confusion Matrix
# conf_matrix = confusion_matrix(y_test, y_test_pred_best)
# print(f"\nConfusion Matrix:")
# print(conf_matrix)

# # ADVANCED ANALYSIS & VISUALIZATIONS
# fig = plt.figure(figsize=(20, 16))
# gs = fig.add_gridspec(4, 3, hspace=0.35, wspace=0.3)

# # Chart 1: Feature Distribution by Species
# ax1 = fig.add_subplot(gs[0, :])
# df_melted = df.melt(id_vars=['species'], value_vars=iris.feature_names)
# sns.boxplot(data=df_melted, x='variable', y='value', hue='species', ax=ax1, palette='Set2')
# ax1.set_title('Feature Distribution by Species', fontsize=14, fontweight='bold', pad=20)
# ax1.set_xlabel('Features', fontsize=12, fontweight='bold')
# ax1.set_ylabel('Measurement (cm)', fontsize=12, fontweight='bold')
# ax1.legend(title='Species', fontsize=10)
# ax1.grid(alpha=0.3)

# # Chart 2: Feature Correlation Heatmap
# ax2 = fig.add_subplot(gs[1, 0])
# corr_data = df[iris.feature_names].corr()
# sns.heatmap(corr_data, annot=True, fmt='.2f', cmap='coolwarm', center=0, 
#             square=True, ax=ax2, cbar_kws={'label': 'Correlation'})
# ax2.set_title('Feature Correlation Matrix', fontsize=12, fontweight='bold', pad=10)

# # Chart 3: Model Accuracy Comparison
# ax3 = fig.add_subplot(gs[1, 1])
# model_names = list(results.keys())
# test_accuracies = [results[m]['test_acc'] for m in model_names]
# colors_acc = ['#FF6B6B' if acc != best_acc else '#51CF66' for acc in test_accuracies]
# bars = ax3.bar(model_names, test_accuracies, color=colors_acc, edgecolor='black', linewidth=2, alpha=0.8)
# ax3.set_ylabel('Accuracy', fontsize=11, fontweight='bold')
# ax3.set_title('Model Performance Comparison', fontsize=12, fontweight='bold', pad=10)
# ax3.set_ylim([0.9, 1.0])
# ax3.tick_params(axis='x', rotation=45)
# for bar, acc in zip(bars, test_accuracies):
#     height = bar.get_height()
#     ax3.text(bar.get_x() + bar.get_width()/2, height, f'{acc:.4f}', 
#              ha='center', va='bottom', fontweight='bold', fontsize=9)
# ax3.grid(alpha=0.3, axis='y')

# # Chart 4: Train vs Test Accuracy
# ax4 = fig.add_subplot(gs[1, 2])
# x_pos = np.arange(len(model_names))
# width = 0.35
# train_accs = [results[m]['train_acc'] for m in model_names]
# test_accs = [results[m]['test_acc'] for m in model_names]
# ax4.bar(x_pos - width/2, train_accs, width, label='Train', color='#4ECDC4', alpha=0.8, edgecolor='black')
# ax4.bar(x_pos + width/2, test_accs, width, label='Test', color='#FF6B6B', alpha=0.8, edgecolor='black')
# ax4.set_ylabel('Accuracy', fontsize=11, fontweight='bold')
# ax4.set_title('Train vs Test Accuracy', fontsize=12, fontweight='bold', pad=10)
# ax4.set_xticks(x_pos)
# ax4.set_xticklabels(model_names, rotation=45, ha='right')
# ax4.legend(fontsize=10)
# ax4.set_ylim([0.9, 1.05])
# ax4.grid(alpha=0.3, axis='y')

# # Chart 5: Confusion Matrix (Best Model)
# ax5 = fig.add_subplot(gs[2, 0])
# sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', ax=ax5, 
#             xticklabels=iris.target_names, yticklabels=iris.target_names,
#             cbar_kws={'label': 'Count'})
# ax5.set_title(f'Confusion Matrix - {best_model_name}', fontsize=12, fontweight='bold', pad=10)
# ax5.set_ylabel('Actual', fontsize=11, fontweight='bold')
# ax5.set_xlabel('Predicted', fontsize=11, fontweight='bold')

# # Chart 6: Precision, Recall, F1-Score
# ax6 = fig.add_subplot(gs[2, 1])
# metrics_data = {m: results[m]['precision'] for m in model_names}
# precision_vals = [metrics_data[m] for m in model_names]
# recall_vals = [results[m]['recall'] for m in model_names]
# f1_vals = [results[m]['test_f1'] for m in model_names]

# x_pos = np.arange(len(model_names))
# width = 0.25
# ax6.bar(x_pos - width, precision_vals, width, label='Precision', alpha=0.8, edgecolor='black')
# ax6.bar(x_pos, recall_vals, width, label='Recall', alpha=0.8, edgecolor='black')
# ax6.bar(x_pos + width, f1_vals, width, label='F1-Score', alpha=0.8, edgecolor='black')
# ax6.set_ylabel('Score', fontsize=11, fontweight='bold')
# ax6.set_title('Classification Metrics', fontsize=12, fontweight='bold', pad=10)
# ax6.set_xticks(x_pos)
# ax6.set_xticklabels(model_names, rotation=45, ha='right')
# ax6.legend(fontsize=9)
# ax6.set_ylim([0.9, 1.05])
# ax6.grid(alpha=0.3, axis='y')

# # Chart 7: Species Distribution
# ax7 = fig.add_subplot(gs[2, 2])
# species_counts = df['species'].value_counts()
# colors_species = ['#FF6B6B', '#4ECDC4', '#45B7D1']
# wedges, texts, autotexts = ax7.pie(species_counts.values, labels=species_counts.index, 
#                                      autopct='%1.1f%%', colors=colors_species, 
#                                      startangle=90, explode=(0.05, 0.05, 0.05))
# for autotext in autotexts:
#     autotext.set_color('white')
#     autotext.set_fontweight('bold')
#     autotext.set_fontsize(10)
# ax7.set_title('Species Distribution', fontsize=12, fontweight='bold', pad=10)

# # Chart 8: Feature Importance (Random Forest)
# ax8 = fig.add_subplot(gs[3, :2])
# feature_importance = pd.DataFrame({
#     'Feature': iris.feature_names,
#     'Importance': rf_best.feature_importances_
# }).sort_values('Importance', ascending=True)
# colors_imp = plt.cm.viridis(np.linspace(0, 1, len(feature_importance)))
# ax8.barh(feature_importance['Feature'], feature_importance['Importance'], 
#          color=colors_imp, edgecolor='black', linewidth=2)
# ax8.set_xlabel('Importance Score', fontsize=11, fontweight='bold')
# ax8.set_title('Feature Importance - Random Forest', fontsize=12, fontweight='bold', pad=10)
# for i, v in enumerate(feature_importance['Importance']):
#     ax8.text(v, i, f' {v:.4f}', va='center', fontweight='bold', fontsize=10)
# ax8.grid(alpha=0.3, axis='x')

# # Chart 9: Cross-Validation Scores
# ax9 = fig.add_subplot(gs[3, 2])
# cv_scores_all = []
# for name, model in models.items():
#     cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='accuracy')
#     cv_scores_all.append(cv_scores)

# bp = ax9.boxplot(cv_scores_all, labels=list(models.keys()), patch_artist=True)
# for patch, color in zip(bp['boxes'], plt.cm.Set3(np.linspace(0, 1, len(models)))):
#     patch.set_facecolor(color)
#     patch.set_alpha(0.7)
# ax9.set_ylabel('CV Score', fontsize=11, fontweight='bold')
# ax9.set_title('Cross-Validation Score Distribution', fontsize=12, fontweight='bold', pad=10)
# ax9.tick_params(axis='x', rotation=45)
# ax9.set_ylim([0.9, 1.02])
# ax9.grid(alpha=0.3, axis='y')

# # plt.suptitle('🌸 Iris Flower Classification - Professional Analysis Dashboard', 
# #              fontsize=16, fontweight='bold', y=0.995)

# # plt.savefig('iris_analysis_dashboard.png', dpi=300, bbox_inches='tight')
# # print(" Dashboard saved as 'iris_analysis_dashboard.png'")
# # # plt.show()
# # plt.close()

# import json

# results_dict = {
#     "model_accuracy": test_accuracies,
#     "model_names": model_names,
#     "feature_importance": {
#         "Feature": iris.feature_names,
#         "Importance": rf_best.feature_importances_.tolist(),
#     },
#     "species_distribution": df['species'].value_counts().to_dict(),
#     "metrics": {
#         "precision": precision_vals,
#         "recall": recall_vals,
#         "f1": f1_vals
#     },
#     "confusion_matrix": conf_matrix.tolist()
# }

# print(json.dumps(results_dict))
# -*- coding: utf-8 -*-
"""
Iris evaluation (FAST JSON mode)
- Reads CSV path from argv[1] if provided, else scripts/iris.csv, else sklearn iris
- Trains 5 lightweight models (no GridSearch) with deterministic params
- Computes metrics and returns a single JSON payload on stdout
"""

import sys, os, json, warnings
warnings.filterwarnings("ignore")

# ---- Console + Matplotlib safety (headless/UTF-8) ----
try:
    # python >=3.7
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import pandas as pd

# Non-interactive backend (we're not saving/plotting figures here)
import matplotlib
matplotlib.use("Agg")

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "2") 

def load_iris_from_any(csv_path: str | None):
    """Load iris either from a Kaggle-style CSV, custom CSV, or sklearn fallback."""
    # If explicit argv path
    if csv_path and os.path.exists(csv_path):
        df_raw = pd.read_csv(csv_path)
        return _from_kaggle_like(df_raw)

    # # Try default scripts/iris.csv (relative to project root)
    # default_csv = os.path.join(os.getcwd(), "scripts", "iris.csv")
    # if os.path.exists(default_csv):
    #     df_raw = pd.read_csv(default_csv)
    #     return _from_kaggle_like(df_raw)

    # Fallback: sklearn
    iris = load_iris()
    X = iris.data
    y = iris.target
    feature_names = list(iris.feature_names)
    target_names = list(iris.target_names)

    df = pd.DataFrame(X, columns=feature_names)
    df["species"] = [target_names[i] for i in y]
    df["species_code"] = y
    return X, y, feature_names, target_names, df

def _from_kaggle_like(df_raw: pd.DataFrame):
    """Handle Kaggle Iris format (SepalLengthCm, ..., Species)."""
    # Allow a few common header variants
    col_map = {
        "SepalLengthCm": ["SepalLengthCm", "sepal_length", "sepal length (cm)"],
        "SepalWidthCm":  ["SepalWidthCm", "sepal_width",  "sepal width (cm)"],
        "PetalLengthCm": ["PetalLengthCm", "petal_length", "petal length (cm)"],
        "PetalWidthCm":  ["PetalWidthCm",  "petal_width",  "petal width (cm)"],
        "Species":       ["Species", "species"]
    }

    def find_col(options):
        lower_cols = {c.lower(): c for c in df_raw.columns}
        for opt in options:
            if opt.lower() in lower_cols:
                return lower_cols[opt.lower()]
        return None

    sl = find_col(col_map["SepalLengthCm"])
    sw = find_col(col_map["SepalWidthCm"])
    pl = find_col(col_map["PetalLengthCm"])
    pw = find_col(col_map["PetalWidthCm"])
    sp = find_col(col_map["Species"])

    required = [sl, sw, pl, pw, sp]
    if any(c is None for c in required):
        # If headers are unexpected, try sklearn fallback
        iris = load_iris()
        X = iris.data
        y = iris.target
        feature_names = list(iris.feature_names)
        target_names = list(iris.target_names)
        df = pd.DataFrame(X, columns=feature_names)
        df["species"] = [target_names[i] for i in y]
        df["species_code"] = y
        return X, y, feature_names, target_names, df

    X = df_raw[[sl, sw, pl, pw]].to_numpy()
    species = df_raw[sp].astype(str)

    # Map common kaggle names to sklearn-style class order
    # sklearn iris.target_names = ['setosa', 'versicolor', 'virginica']
    mapping = {
        "Iris-setosa": "setosa",
        "Iris-versicolor": "versicolor",
        "Iris-virginica": "virginica",
        "setosa": "setosa",
        "versicolor": "versicolor",
        "virginica": "virginica",
    }
    species_std = species.map(mapping).fillna(species).to_numpy()

    target_names = ["setosa", "versicolor", "virginica"]
    name_to_idx = {n: i for i, n in enumerate(target_names)} 
    y = np.array([name_to_idx.get(s, 0) for s in species_std], dtype=int)


    feature_names = ["sepal length (cm)", "sepal width (cm)", "petal length (cm)", "petal width (cm)"]
    df = pd.DataFrame(X, columns=feature_names)
    df["species"] = species_std
    df["species_code"] = y
    return X, y, feature_names, target_names, df

# CLI arg
csv_arg = sys.argv[1] if len(sys.argv) > 1 else None
X, y, feature_names, target_names, df = load_iris_from_any(csv_arg)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.30, random_state=42, stratify=y
)

cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

models = {
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "Logistic Regression": LogisticRegression(max_iter=500, random_state=42),
    "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42, n_jobs=1),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=120, learning_rate=0.1, random_state=42),
}

results = {}
cv_scores_all = {}  # for per-model CV distribution (boxplot-style arrays)

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    train_acc = model.score(X_train, y_train)

    # small CV for speed
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy", n_jobs=1)
    cv_scores_all[name] = cv_scores.tolist()

    results[name] = {
        "train_acc": float(train_acc),
        "test_acc": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "test_f1": float(f1),
    }

# pick best by test accuracy
best_model_name = max(results.items(), key=lambda kv: kv[1]["test_acc"])[0]
best_model = models[best_model_name]

# confusion matrix for best model
y_best = best_model.predict(X_test)
conf_mat = confusion_matrix(y_test, y_best).tolist()

# Feature importance (from RF if present; else zeros)
if "Random Forest" in models:
    rf = models["Random Forest"]
    if hasattr(rf, "feature_importances_"):
        feat_imp = rf.feature_importances_.astype(float).tolist()
    else:
        feat_imp = [0.0] * len(feature_names)
else:
    feat_imp = [0.0] * len(feature_names)

# species distribution
species_counts = df["species"].value_counts().to_dict()

model_names = list(results.keys())
test_accuracies = [results[m]["test_acc"] for m in model_names]
train_accuracies = [results[m]["train_acc"] for m in model_names]
precisions = [results[m]["precision"] for m in model_names]
recalls = [results[m]["recall"] for m in model_names]
f1s = [results[m]["test_f1"] for m in model_names]

payload = {
    # x-axis labels for charts
    "model_names": model_names,

    # Chart 3: model accuracy bars + (optionally) Chart 4 train vs test
    "model_accuracy": test_accuracies,
    "train_accuracy": train_accuracies,

    # Chart 6: metrics per model
    "metrics": {
        "precision": precisions,
        "recall": recalls,
        "f1": f1s
    },

    # Chart 8: feature importance (Random Forest)
    "feature_importance": {
        "Feature": feature_names,
        "Importance": feat_imp
    },

    # Chart 7: species distribution (for pie)
    "species_distribution": species_counts,

    # Chart 5: confusion matrix (best model)
    "confusion_matrix": conf_mat,
    "best_model_name": best_model_name,
    "target_names": target_names,

    # Chart 9: CV score distribution (boxplot data)
    "cv_scores": cv_scores_all,

    # Minor meta
    "n_samples": int(len(df)),
    "n_features": int(len(feature_names)),
}

print(json.dumps(payload))
