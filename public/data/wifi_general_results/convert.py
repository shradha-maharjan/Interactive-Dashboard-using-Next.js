import os
import csv
import matplotlib.pyplot as plt

def process_file(input_file):
    base, ext = os.path.splitext(input_file)
    output_csv = base + ".csv"
    output_img = base + ".png"

    titles = []
    datasets = []
    current_data = []

    with open(input_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith('plot'):
                # Extract dataset titles
                parts = line.split('title')
                for p in parts[1:]:
                    title = p.split("with")[0].strip().strip('"')
                    titles.append(title)
            elif line == "e":  # end of one dataset
                if current_data:
                    datasets.append(current_data)
                current_data = []
            else:
                parts = line.split()
                if len(parts) == 2:
                    try:
                        x, y = float(parts[0]), float(parts[1])
                        current_data.append((x, y))
                    except ValueError:
                        continue

    if current_data:
        datasets.append(current_data)

    # --- Save CSV ---
    with open(output_csv, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        header = ["SNR(dB)"] + titles
        writer.writerow(header)

        max_len = max(len(d) for d in datasets)
        for i in range(max_len):
            row = []
            for j, d in enumerate(datasets):
                if i < len(d):
                    if j == 0:
                        row = [d[i][0], d[i][1]]
                    else:
                        row.append(d[i][1])
                else:
                    if not row:
                        row = ["", ""]
                    row.append("")
            writer.writerow(row)

    print(f"✅ CSV saved: {output_csv}")

    # --- Create Plot ---
    plt.figure(figsize=(8, 6))
    for idx, data in enumerate(datasets):
        x_vals = [p[0] for p in data]
        y_vals = [p[1] for p in data]
        plt.plot(x_vals, y_vals, label=titles[idx] if idx < len(titles) else f"Series {idx+1}")

    plt.title("Results")
    plt.xlabel("SNR (dB)")
    plt.ylabel("Rate (Mb/s)")
    plt.grid(True)
    plt.legend()
    plt.savefig(output_img, dpi=300)
    plt.close()

    print(f"✅ Plot saved: {output_img}")


# --- Main loop: process all files in current folder & subfolders ---
for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".plt") or file.endswith(".gp"):
            full_path = os.path.join(root, file)
            print(f"\n📂 Processing {full_path}")
            try:
                process_file(full_path)
            except Exception as e:
                print(f"❌ Error processing {full_path}: {e}")