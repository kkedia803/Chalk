import { ChalkProvider } from "./context/ChalkContext";
import { useChalk } from "./context/ChalkContext";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/OutputPanel";
import "./index.css";

function Layout() {
  const { ui } = useChalk();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-Chalk-base text-Chalk-primary font-sans antialiased">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {ui.sidebarOpen && <SideBar />}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <EditorPanel />
          {ui.outputOpen && <OutputPanel />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ChalkProvider>
      <Layout />
    </ChalkProvider>
  );
}