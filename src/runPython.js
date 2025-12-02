import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function runPython(csvText) {
  const tempFile = path.join(process.cwd(), "temp.csv");
  fs.writeFileSync(tempFile, csvText);

  return new Promise((resolve, reject) => {
    const py = spawn("python", ["ml_predict.py", tempFile]);
    let output = "";
    let error = "";

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (data) => (error += data.toString()));

    py.on("close", (code) => {
      fs.unlinkSync(tempFile);
      if (code !== 0 || error) reject(error || `Python exited with ${code}`);
      else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(`Invalid JSON from Python: ${output}`);
        }
      }
    });
  });
}
