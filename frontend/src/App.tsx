import { ChalkProvider } from "./context/ChalkContext";

import { ExecutionPage } from "./pages/ExecutionPage";

import { Route, Routes, BrowserRouter } from "react-router";

import "./index.css";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";

function Layout() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ExecutionPage />} />
          <Route path="/projects/:projectId" element={<ExecutionPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
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
