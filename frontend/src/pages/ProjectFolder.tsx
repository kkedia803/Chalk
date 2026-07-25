import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiEdit2, FiFile, FiPlus, FiTrash2 } from "react-icons/fi";

import { DEFAULT_CODE, fileBaseName, fileNameForLanguage, LANGUAGES, type Language, type Project, type ProjectFile } from "../types";
import { useFeedback } from "../context/FeedbackContext";
import { useProjects } from "../context/ProjectsContext";
import ChalkLoader from "../components/ChalkLoader";

function FileRow({
  file,
  onEdit,
  onRename,
  onDelete,
}: {
  file: ProjectFile;
  onEdit: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(fileBaseName(file.fileName, file.language));
  const inputRef = useRef<HTMLInputElement>(null);
  const language = LANGUAGES.find((item) => item.id === file.language);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const commitRename = () => {
    const nextBaseName = draft.trim();
    const nextFileName = fileNameForLanguage(nextBaseName, file.language);
    if (nextBaseName && nextFileName !== file.fileName) onRename(nextFileName);
    else setDraft(fileBaseName(file.fileName, file.language));
    setRenaming(false);
  };

  return (
    <div
      className="group flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
      onDoubleClick={onEdit}
    >
      <FiFile className="shrink-0 text-zinc-500" size={18} />
      <div className="min-w-0 flex-1">
        {renaming ? (
          <div className="flex w-full items-center rounded border border-indigo-500/50 bg-black">
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRename();
                if (event.key === "Escape") {
                  setDraft(fileBaseName(file.fileName, file.language));
                  setRenaming(false);
                }
              }}
              className="min-w-0 flex-1 bg-transparent px-2 py-1 font-mono text-sm text-zinc-100 outline-none"
            />
            <span className="pr-2 font-mono text-sm text-zinc-600">{language?.ext}</span>
          </div>
        ) : (
          <>
            <p className="truncate font-mono text-sm text-zinc-200">{file.fileName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: language?.dot }} />
              {language?.label ?? file.language}
            </p>
          </>
        )}
      </div>
      {!renaming && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setRenaming(true)}
            className="rounded bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500 hover:text-white"
            aria-label={`Rename ${file.fileName}`}
            title="Rename file"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="rounded bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white"
            aria-label={`Delete ${file.fileName}`}
            title="Delete file"
          >
            <FiTrash2 size={14} />
          </button>
          <button
            onClick={onEdit}
            className="ml-2 rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500/60 hover:text-indigo-300"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectFolder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const {
    projectDetails,
    loadingProjectIds,
    loadProject,
    createFile: createCachedFile,
    updateFile,
    deleteFile: deleteCachedFile,
  } = useProjects();
  const [creating, setCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("untitled");
  const [newLanguage, setNewLanguage] = useState<Language>("javascript");
  const detail = projectId ? projectDetails[projectId] : undefined;
  const project: Project | null = detail?.project ?? null;
  const files = detail?.files ?? [];
  const loading = Boolean(projectId && loadingProjectIds.has(projectId) && !detail);

  useEffect(() => {
    if (!projectId) return;

    void loadProject(projectId).catch(() => {
      toast("Could not load this project.", "error");
      navigate("/dashboard");
    });
  }, [loadProject, navigate, projectId, toast]);

  const createFile = async () => {
    const name = newFileName.trim();
    if (!projectId || !name || pendingAction) return;

    setPendingAction("create");
    try {
      const file = await createCachedFile(projectId, {
        fileName: fileNameForLanguage(name, newLanguage),
        language: newLanguage,
        code: DEFAULT_CODE[newLanguage],
      });
      setCreating(false);
      setNewFileName("untitled");
      toast(`Created "${file.fileName}".`, "success");
      navigate(`/projects/${projectId}/files/${file.id}`);
    } catch {
      toast("Could not create the file.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const renameFile = async (file: ProjectFile, fileName: string) => {
    if (!projectId) return;
    try {
      const updatedFile = await updateFile(projectId, file.id, { fileName });
      toast(
        updatedFile.fileName === fileName
          ? "File renamed."
          : `That name was already used, so the file was renamed to "${updatedFile.fileName}".`,
        "success",
      );
    } catch {
      toast("Could not rename the file.", "error");
    }
  };

  const deleteFile = async (file: ProjectFile) => {
    if (!projectId) return;
    const confirmed = await confirm({
      title: "Delete file?",
      message: `Delete "${file.fileName}"? This cannot be undone.`,
      confirmLabel: "Delete file",
      destructive: true,
    });
    if (!confirmed) return;

    setPendingAction(file.id);
    try {
      await deleteCachedFile(projectId, file.id);
      toast(`Deleted "${file.fileName}".`, "success");
    } catch {
      toast("Could not delete the file.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  if (!projectId) {
    return null;
  }

  if (loading || !detail) {
    return <ChalkLoader />;
  }

  return (
    <div className="page-enter min-h-screen bg-black text-zinc-200">
      <header className="flex items-center justify-between border-b border-zinc-900 px-8 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded p-2 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
            aria-label="Back to projects"
          >
            <FiArrowLeft />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">Project folder</p>
            <h1 className="mt-1 text-base font-medium text-zinc-200">{project?.projectName}</h1>
          </div>
        </div>
        <button
          onClick={() => setCreating(true)}
          disabled={!project || pendingAction === "create"}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-indigo-500/60 hover:text-white disabled:cursor-wait disabled:opacity-50"
        >
          <FiPlus /> {pendingAction === "create" ? "Creating..." : "New File"}
        </button>
      </header>

      <main className="mx-auto max-w-4xl p-8">
        {creating && (
          <div className="panel-enter mb-6 flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4">
            <div className="flex min-w-0 flex-1 items-center rounded border border-zinc-700 bg-black focus-within:border-indigo-500">
              <input
                autoFocus
                value={newFileName}
                onChange={(event) => setNewFileName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && void createFile()}
                placeholder="filename"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm outline-none"
              />
              <span className="pr-3 font-mono text-sm text-zinc-600">
                {LANGUAGES.find((item) => item.id === newLanguage)?.ext}
              </span>
            </div>
            <select
              value={newLanguage}
              onChange={(event) => setNewLanguage(event.target.value as Language)}
              className="rounded border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-300 outline-none"
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>{language.label}</option>
              ))}
            </select>
            <button
              onClick={() => void createFile()}
              disabled={pendingAction === "create"}
              className="rounded bg-indigo-500 px-3 py-2 text-xs text-white disabled:cursor-wait disabled:opacity-50"
            >
              {pendingAction === "create" ? "Creating..." : "Create & edit"}
            </button>
            <button onClick={() => setCreating(false)} className="px-2 text-xs text-zinc-500 hover:text-white">
              Cancel
            </button>
          </div>
        )}

        {files.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-800 py-24 text-zinc-600">
            <FiFile size={30} />
            <p className="mt-4 text-sm text-zinc-500">This folder is empty.</p>
            <button onClick={() => setCreating(true)} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">
              Create your first file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              {files.length} {files.length === 1 ? "file" : "files"} · double-click a file to edit
            </p>
            {files.map((file) => (
              <div key={file.id} className={pendingAction === file.id ? "pointer-events-none opacity-50" : ""}>
                <FileRow
                  file={file}
                  onEdit={() => navigate(`/projects/${projectId}/files/${file.id}`)}
                  onRename={(name) => void renameFile(file, name)}
                  onDelete={() => void deleteFile(file)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
