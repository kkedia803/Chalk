export type Job = {
  id: string;
  language: supportedLanguage;
  code: string;
  resolve: (result: any) => void;
  reject: (error: any) => void;
};

export type languageConfig = {
  image: string;
  fileName: string;
  command: string[];
};

export type supportedLanguage = "javascript" | "python" | "java" | "cpp";