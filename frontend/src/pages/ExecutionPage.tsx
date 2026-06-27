import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import EditorPanel from "../components/EditorPanel";
import OutputPanel from "../components/OutputPanel";

import { useChalk } from "../context/ChalkContext";

export const ExecutionPage = () => {

    const { ui } = useChalk();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${ui.sidebarOpen ? "w-[14rem] opacity-100" : "w-0 opacity-0"}
          `}
        >
          <SideBar />
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
