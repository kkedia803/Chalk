export type JobStatus = "queued" | "running" | "completed" | "failed";

export type DBJob = {
  id: string;
  language: supportedLanguage;
  code: string;
  status: JobStatus;
  output: string | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
};

export type JobType = {
  id: string;
  language: supportedLanguage;
  code: string;
};

export type languageConfig = {
  image: string;
  fileName: string;
  command: string[];
};

export type supportedLanguage = "javascript" | "python" | "java" | "cpp";