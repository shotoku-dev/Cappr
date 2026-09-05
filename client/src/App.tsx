import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { DashboardApp } from "./app/DashboardApp";
import { LandingPage } from "./landing";
import { SkeletonPage } from "./skeleton";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/skeleton" element={<SkeletonPage />} />
        <Route path="/dashboard/*" element={<DashboardApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        theme="system"
        position="bottom-right"
        toastOptions={{
          className: "landing-toast",
        }}
      />
    </BrowserRouter>
  );
}
