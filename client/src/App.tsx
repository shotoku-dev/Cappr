import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardApp } from "./app/DashboardApp";
import { LandingPage } from "./landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<DashboardApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
