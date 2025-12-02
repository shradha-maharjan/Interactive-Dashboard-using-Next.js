import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const modelName = formData.get("model") || "logistic_regression"; 

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = path.join(os.tmpdir(), "uploads");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const tempPath = path.join(tempDir, file.name);
    fs.writeFileSync(tempPath, buffer);

    const scriptPath = path.join(process.cwd(), "scripts", "eval.py");
    const pythonExe = "C:\\Users\\FLEX\\Documents\\lab-project\\ml_env1\\Scripts\\python.exe"; 
    console.log("Running Python:", pythonExe, scriptPath, tempPath, modelName);

    return new Promise((resolve) => {
      const py = spawn(pythonExe, [scriptPath, tempPath, modelName]);

      let stdout = "";
      let stderr = "";

      py.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
        console.log("PYTHON STDOUT:", chunk.toString());
      });

      py.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
        console.error("PYTHON STDERR:", chunk.toString());
      });

      py.on("close", (code) => {
        console.log("Python exited with code:", code);
        if (code !== 0 || stderr) {
          resolve(NextResponse.json({ error: stderr || "Python error" }, { status: 500 }));
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(NextResponse.json(parsed));
        } catch (err) {
          console.error("JSON Parse error:", err);
          console.log("Raw output:", stdout);
          resolve(NextResponse.json({ error: "Invalid JSON output" }, { status: 500 }));
        }
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
