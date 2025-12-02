# import sys, os, json, importlib

# # Add current directory to sys.path so local imports work
# sys.path.append(os.path.dirname(__file__))

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"error": "Usage: run_model_eval.py <model_name> [file_path]"}))
#         sys.exit(1)

#     model_name = sys.argv[1]
#     file_path = sys.argv[2] if len(sys.argv) > 2 else None

#     # 🔹 Remove the "scripts." prefix completely
#     mapping = {
#         "logistic_regression": "models.logistic_regression_eval",
#         "random_forest": "models.random_forest_eval",
#         "decision_tree": "models.decision_tree_eval",
#         "knn": "models.knn_eval",
#     }

#     if model_name not in mapping:
#         print(json.dumps({"error": f"Unknown model: {model_name}"}))
#         sys.exit(1)

#     module_path = mapping[model_name]

#     try:
#         module = importlib.import_module(module_path)
#         if hasattr(module, "run"):
#             module.run(file_path)
#         else:
#             print(json.dumps({"error": f"Module {module_path} missing run() function"}))
#             sys.exit(1)
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         print(json.dumps({"error": str(e)}))
#         sys.exit(1)
import sys, os, importlib, json
sys.path.append(os.path.dirname(__file__))

print(">>> Starting script")
sys.stdout.flush()

if len(sys.argv) < 2:
    print(json.dumps({"error": "Usage"}))
    sys.exit(1)

model_name = sys.argv[1]
file_path = sys.argv[2] if len(sys.argv) > 2 else None

mapping = {
    "logistic_regression": "models.logistic_regression_eval",
}

print(">>> Importing", mapping[model_name])
sys.stdout.flush()

module = importlib.import_module(mapping[model_name])
print(">>> Imported successfully")
sys.stdout.flush()

module.run(file_path)
print(">>> run() completed")
sys.stdout.flush()
