import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import EditorPanel from "../components/EditorPanel";
import OutputPanel from "../components/OutputPanel";

import { useChalkLayout, useEditorCode, useEditorMeta } from "../context/ChalkContext";
import { DEFAULT_CODE, fileNameForLanguage, LANGUAGES, type Language, type ProjectFile } from "../types";
import { useFeedback } from "../context/FeedbackContext";
import { useProjects } from "../context/ProjectsContext";
import ChalkLoader from "../components/ChalkLoader";

export const ExecutionPage = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const { alert, toast } = useFeedback();
  const { code } = useEditorCode();
  const { language, loadCode } = useEditorMeta();
  const { ui } = useChalkLayout();
  const {
    projectDetails,
    loadProject,
    createProject: createCachedProject,
    createFile: createCachedFile,
    updateFile,
  } = useProjects();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [scratchName, setScratchName] = useState("scratch.js");
  const [createMode, setCreateMode] = useState<"project" | "file" | null>(null);
  const [createName, setCreateName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState<Language>("javascript");
  const saveTimer = useRef<number | undefined>(undefined);
  const lastLoadedFileId = useRef<string | null>(null);
  const savedFiles = useRef(new Map<string, { code: string; language: string }>());
  const saveSequence = useRef(0);
  const latestEdit = useRef({ projectId, selectedFileId, code, language });
  const detail = projectId ? projectDetails[projectId] : undefined;
  const project = detail?.project ?? null;
  const files = detail?.files ?? [];

  useEffect(() => {
    latestEdit.current = { projectId, selectedFileId, code, language };
  }, [code, language, projectId, selectedFileId]);

  useEffect(() => () => {
    const latest = latestEdit.current;
    if (!latest.projectId || !latest.selectedFileId) return;
    const saved = savedFiles.current.get(latest.selectedFileId);
    if (saved?.code === latest.code && saved.language === latest.language) return;
    void updateFile(latest.projectId, latest.selectedFileId, {
      code: latest.code,
      language: latest.language,
    });
  }, [updateFile]);

  useEffect(() => {
    if (!projectId) return;
    void loadProject(projectId).catch(() => {
      toast("Could not load this project.", "error");
      navigate("/dashboard");
    });
  }, [loadProject, navigate, projectId, toast]);

  useEffect(() => {
    if (!projectId || !detail) return;
    const nextFile = detail.files.find((file) => file.id === fileId) ?? detail.files[0];
    if (!nextFile || lastLoadedFileId.current === nextFile.id) return;

    lastLoadedFileId.current = nextFile.id;
    savedFiles.current.set(nextFile.id, { code: nextFile.code, language: nextFile.language });
    setSelectedFileId(nextFile.id);
    setSaveStatus("idle");
    loadCode(nextFile.language, nextFile.code);
  }, [detail, fileId, loadCode, projectId]);

  useEffect(() => {
    if (!projectId || !selectedFileId) return;
    const saved = savedFiles.current.get(selectedFileId);
    if (saved?.code === code && saved.language === language) return;

    const sequence = ++saveSequence.current;
    window.clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = window.setTimeout(() => {
      void updateFile(projectId, selectedFileId, { code, language })
        .then(() => {
          if (sequence !== saveSequence.current) return;
          savedFiles.current.set(selectedFileId, { code, language });
          setSaveStatus("saved");
        })
        .catch(() => {
          if (sequence === saveSequence.current) setSaveStatus("error");
        });
    }, 400);

    return () => window.clearTimeout(saveTimer.current);
  }, [code, language, projectId, selectedFileId, updateFile]);

  const flushCurrentFile = () => {
    if (!projectId || !selectedFileId) return;
    const saved = savedFiles.current.get(selectedFileId);
    if (saved?.code === code && saved.language === language) return;

    window.clearTimeout(saveTimer.current);
    ++saveSequence.current;
    const currentFileId = selectedFileId;
    savedFiles.current.set(currentFileId, { code, language });
    void updateFile(projectId, currentFileId, { code, language }).catch(() => {
      savedFiles.current.delete(currentFileId);
      toast("The latest edit could not be saved.", "error");
    });
  };

  const createFile = async (fileName: string, fileLanguage: Language) => {
    if (!projectId) return;
    try {
      flushCurrentFile();
      const file = await createCachedFile(projectId, {
        fileName: fileNameForLanguage(fileName, fileLanguage),
        language: fileLanguage,
        code: DEFAULT_CODE[fileLanguage],
      });
      savedFiles.current.set(file.id, { code: file.code, language: file.language });
      lastLoadedFileId.current = file.id;
      setSelectedFileId(file.id);
      loadCode(file.language, file.code);
      navigate(`/projects/${projectId}/files/${file.id}`, { replace: true });
      toast(`Created "${file.fileName}".`, "success");
    } catch {
      toast("Could not create the file.", "error");
    }
  };

  const selectFile = (file: ProjectFile) => {
    if (file.id === selectedFileId) return;
    flushCurrentFile();
    lastLoadedFileId.current = file.id;
    savedFiles.current.set(file.id, { code: file.code, language: file.language });
    setSelectedFileId(file.id);
    setSaveStatus("idle");
    loadCode(file.language, file.code);
    navigate(`/projects/${file.projectId}/files/${file.id}`);
  };

  const createProject = async (projectName: string) => {
    if (!projectName) return;

    try {
      const result = await createCachedProject(projectName, {
        fileName: fileNameForLanguage(language === "java" ? "Main" : "main", language),
        language,
        code,
      });
      toast(`Created "${projectName}" from your current code.`, "success");
      if (result.file) {
        navigate(`/projects/${result.project.id}/files/${result.file.id}`);
      } else {
        navigate(`/projects/${result.project.id}`);
      }
    } catch {
      await alert({
        title: "Project could not be created",
        message: "Please make sure you are signed in and try again.",
        confirmLabel: "Got it",
      });
    }
  };

  const createSingleFile = (fileName: string, fileLanguage: Language) => {
    const completeFileName = fileNameForLanguage(fileName, fileLanguage);
    setScratchName(completeFileName);
    loadCode(fileLanguage, DEFAULT_CODE[fileLanguage]);
    toast(`Created scratch file "${completeFileName}".`, "success");
  };

  const openCreateDialog = (mode: "project" | "file") => {
    setCreateMode(mode);
    setCreateName(mode === "project" ? "Untitled Project" : "untitled");
    if (mode === "file") setNewFileLanguage(language);
  };

  const submitCreateDialog = async () => {
    const name = createName.trim();
    if (!name || !createMode) return;
    setCreateMode(null);
    if (createMode === "project") await createProject(name);
    else if (projectId) await createFile(name, newFileLanguage);
    else createSingleFile(name, newFileLanguage);
  };

  const scratchFile: ProjectFile = {
    id: "scratch",
    projectId: "",
    fileName: scratchName,
    language,
    code,
    createdAt: null,
    updatedAt: null,
  };

  if (projectId && !detail) {
    return <ChalkLoader />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <TopBar title={project?.projectName} saveStatus={projectId ? saveStatus : undefined} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${ui.sidebarOpen ? "w-[14rem] opacity-100" : "w-0 opacity-0"}
          `}
        >
          <SideBar
            files={projectId ? files : [scratchFile]}
            selectedFileId={projectId ? selectedFileId : "scratch"}
            onCreateFile={() => openCreateDialog("file")}
            onCreateProject={projectId ? undefined : () => openCreateDialog("project")}
            onSelectFile={projectId ? selectFile : undefined}
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

      {createMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Create {createMode}
            </p>
            <h2 className="mt-2 text-base font-medium text-zinc-100">
              {createMode === "project"
                ? "Save this code as a project"
                : projectId
                  ? "Create a new project file"
                  : "Start a new scratch file"}
            </h2>
            <div className="mt-5 flex w-full items-center rounded-lg border border-zinc-700 bg-black focus-within:border-indigo-500">
              <input
                autoFocus
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && void submitCreateDialog()}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none"
              />
              {createMode === "file" && (
                <span className="pr-3 font-mono text-sm text-zinc-600">
                  {LANGUAGES.find((item) => item.id === newFileLanguage)?.ext}
                </span>
              )}
            </div>
            {createMode === "file" && (
              <div className="mt-3">
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                  Language
                </label>
                <select
                  value={newFileLanguage}
                  onChange={(event) => setNewFileLanguage(event.target.value as Language)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-indigo-500"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreateMode(null)}
                className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitCreateDialog()}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-400"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
