import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const TMP_DIR = path.join(process.cwd(), "tmp");

export const executeService = async (
  language: string,
  code: string,
): Promise<string> => {
  await fs.mkdir(TMP_DIR, { recursive: true });

  const TEST_FILE_PATH = path.join(TMP_DIR, `${crypto.randomUUID()}.js`);

  await fs.writeFile(TEST_FILE_PATH, code);

  try {
    const prm = await new Promise<string>((resolve, reject) => {
      execFile(
        "docker",
        [
          "run",
          "--rm",
          "--network",
          "none",
          "--memory=128m",
          "--cpus=0.5",
          "--read-only",
          "--cap-drop",
          "ALL",
          "-v",
          `${TEST_FILE_PATH}:/app/code.js`,
          "js-runner",
          "node",
          "/app/code.js",
        ],
        {
          timeout: 5000,
        },
        (error, stdout, stderr) => {
          if (error) {
            if (error.killed) {
              reject(new Error("Execution timed out"));
              return;
            }
            reject(error);
            return;
          }

          if (stderr) {
            reject(new Error(stderr));
            return;
          }

          resolve(stdout);
        },
      );
    });

    return prm;
  } finally {
    await fs.rm(TEST_FILE_PATH, { force: true });
  }
};
