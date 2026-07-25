import { ChalkProvider } from "./context/ChalkContext";

import { ExecutionPage } from "./pages/ExecutionPage";

import { Route, Routes, BrowserRouter } from "react-router";

import "./index.css";
import Dashboard from "./pages/Dashboard";
import ProjectFolder from "./pages/ProjectFolder";
import { AuthProvider } from "./context/AuthContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import { ProjectsProvider } from "./context/ProjectsContext";

function Layout() {
  return (
    <BrowserRouter>
      <FeedbackProvider>
        <AuthProvider>
          <ProjectsProvider>
            <Routes>
              <Route path="/" element={<ExecutionPage />} />
              <Route path="/projects/:projectId" element={<ProjectFolder />} />
              <Route path="/projects/:projectId/files/:fileId" element={<ExecutionPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </ProjectsProvider>
        </AuthProvider>
      </FeedbackProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ChalkProvider>
      <Layout />
    </ChalkProvider>
  );
}
