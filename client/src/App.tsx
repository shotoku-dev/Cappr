import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "./landing";
import { PrivacyPage, SecurityPage, TermsPage } from "./legal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        {/* Product routes (dashboard) are disabled until launch. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "landing-toast",
        }}
      />
    </BrowserRouter>
  );
}
