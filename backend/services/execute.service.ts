import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";

import { languageConfig, supportedLanguage } from "../types";

const TMP_DIR = path.join(process.cwd(), "tmp");

const languages: Record<supportedLanguage, languageConfig> = {
  javascript: {
    image: "js-runner",
    fileName: "code.js",
    command: ["node", "/app/code.js"],
  },

  python: {
    image: "py-runner",
    fileName: "code.py",
    command: ["python", "/app/code.py"],
  },

  java: {
    image: "java-runner",
    fileName: "Main.java",
    command: ["sh", "-c", "javac -d /tmp /app/Main.java && java -cp /tmp Main"],
    //compiles java file into /tmp/main and then runs it
  },

  cpp: {
    image: "cpp-runner",
    fileName: "main.cpp",
    command: ["sh", "-c", "g++ /app/main.cpp -o /tmp/main && /tmp/main"],
    //compiles cpp file into /tmp/main and then runs it
  },
};

export const executeService = async (
  language: supportedLanguage,
  code: string,
): Promise<{
  stdout: string;
  stderr: string;
  runtime: number;
}> => {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const config = languages[language];

  const TEST_FILE_PATH = path.join(TMP_DIR, `${config.fileName}`);

  await fs.writeFile(TEST_FILE_PATH, code);

  const start = Date.now();

  try {
    const response = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      execFile(
        "docker",
        [
          "run", // create a container and run it
          "--rm", // remove it after completion
          "--net",
          "none", // disable networking, fetch, axios, etc will not work
          "--memory=128m", // continer max ram = 128mb, above it container is killed
          "--cpus=0.5", // limits cpu usage, roughly half a cpu core
          "--read-only", // filesystem is read-only, user cannot write files inside the container
          "--tmpfs", // create a temporary filesystem
          "/tmp:exec", // files inside tmp is writable and execitable too, needed for java and cpp
          "--cap-drop",
          "ALL", // all linux codes are removed for user, eg - CAP_NET_RAW, CAP_SYS_ADMIN
          "-v", // makes a way for host file to appear inside container, does not copy just opens a window for hostfile
          `${TEST_FILE_PATH}:/app/${config.fileName}`, // host_file:container_file mapping
          config.image, // selecting container image as per language
          ...config.command, // selecting run commands as per language
        ],
        {
          timeout: 5000, // timeout for container, if takes more time, container will be killed
        },
        (error, stdout, stderr) => {
          console.log("stdout", stdout);
          console.log("stderr", stderr);
          console.log("error", error);
          if (error) {
            if (error.killed) {
              reject(new Error("Execution timed out"));
              return;
            }
            reject(stderr);
            return;
          }
          resolve({
            stdout: stdout.toString(),
            stderr: stderr?.toString() || "",
          });
        },
      );
    });

    const end = Date.now();

    const runtime = end - start;

    return { ...response, runtime };
  } finally {
    await fs.rm(TEST_FILE_PATH, { force: true });
  }
};
