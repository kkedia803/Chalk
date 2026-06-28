import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import EditorPanel from "../components/EditorPanel";
import OutputPanel from "../components/OutputPanel";

import { useChalk } from "../context/ChalkContext";
import { DEFAULT_CODE, LANGUAGES, type Language, type Project, type ProjectFile } from "../types";

export const ExecutionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { ui, code, language, loadCode } = useChalk();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("chalkToken") ?? ""}`,
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (!res.ok) return;

      const data = await res.json();
      setProject(data.project);
      setFiles(data.files);
      if (data.files[0]) {
        setSelectedFileId(data.files[0].id);
        loadCode(data.files[0].language, data.files[0].code);
      }
    };

    fetchProject();
  }, [projectId, loadCode]);

  useEffect(() => {
    if (!selectedFile || selectedFile.code === code) return;

    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedFile.projectId}/files/${selectedFile.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: authHeaders(),
          body: JSON.stringify({ code, language }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setFiles((prev) => prev.map((file) => (file.id === data.file.id ? data.file : file)));
      }
    }, 500);

    return () => window.clearTimeout(saveTimer.current);
  }, [code, language, selectedFile]);

  const createFile = async () => {
    if (!projectId) return;

    const defaultLanguage = selectedFile?.language ?? language;
    const requestedName = window.prompt("Enter file name", `untitled-${files.length + 1}`);
    const fileNameWithoutExt = requestedName?.trim();
    if (!fileNameWithoutExt) return;

    const languageOptions = LANGUAGES.map((lang) => `${lang.id} (${lang.ext})`).join(", ");
    const requestedLanguage = window.prompt(`Choose code language: ${languageOptions}`, defaultLanguage);
    const nextLanguage = LANGUAGES.some((lang) => lang.id === requestedLanguage)
      ? (requestedLanguage as Language)
      : null;
    if (!nextLanguage) {
      window.alert("Please choose one of: javascript, python, java, cpp");
      return;
    }

    const meta = LANGUAGES.find((lang) => lang.id === nextLanguage);
    const fileName = meta && fileNameWithoutExt.endsWith(meta.ext)
      ? fileNameWithoutExt
      : `${fileNameWithoutExt}${meta?.ext ?? ""}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/files`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({
        fileName,
        language: nextLanguage,
        code: DEFAULT_CODE[nextLanguage],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setFiles((prev) => [...prev, data.file]);
      setSelectedFileId(data.file.id);
      loadCode(data.file.language, data.file.code);
    }
  };

  const selectFile = (file: ProjectFile) => {
    setSelectedFileId(file.id);
    loadCode(file.language, file.code);
  };

  const createProject = async () => {
    const name = window.prompt("Enter project name", "Untitled");
    const projectName = name?.trim();
    if (!projectName) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({ projectName }),
    });
    if (res.ok) {
      const data = await res.json();
      navigate(`/dashboard/${data.project.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <TopBar title={project?.projectName} onCreateProject={createProject} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${ui.sidebarOpen ? "w-[14rem] opacity-100" : "w-0 opacity-0"}
          `}
        >
          <SideBar
            files={files}
            selectedFileId={selectedFileId}
            onCreateFile={createFile}
            onSelectFile={selectFile}
            onSelectLanguage={(nextLanguage) => loadCode(nextLanguage, code)}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <EditorPanel />

          <div
            className={`
              overflow-hidden border-t border-zinc-800
              transition-all duration-300 ease-in-out
              ${ui.outputOpen ? "h-[260px]" : "h-0"}
            `}
          >
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
