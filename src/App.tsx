import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { BountiesPage } from "./pages/BountiesPage";
import { AuthPage } from "./pages/AuthPage";
import { PosterDashboard } from "./pages/PosterDashboard";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { ArbitratorDashboard } from "./pages/ArbitratorDashboard";
import { LearnPage } from "./pages/LearnPage";

const AppContent: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname.replace(/^\//, "").split("/")[0];
    if (path === "learn") return "learn";
    if (path === "bounties") return "bounties";
    if (path === "auth") return "auth";
    return "landing";
  });
  const [bountySearchParam, setBountySearchParam] = useState<string>("");
  const [learnInitialLesson, setLearnInitialLesson] = useState<string | undefined>();

  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, "").split("/")[0];
      if (path === "learn") setCurrentView("learn");
      else if (path === "bounties") setCurrentView("bounties");
      else if (path === "auth") setCurrentView("auth");
      else if (["poster", "worker", "arbitrator"].includes(path)) setCurrentView(path);
      else setCurrentView("landing");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (view: string, searchParam?: string) => {
    if (searchParam !== undefined) {
      if (view === "learn") {
        setLearnInitialLesson(searchParam);
      } else {
        setBountySearchParam(searchParam);
      }
    } else if (view === "learn") {
      setLearnInitialLesson(undefined);
    }
    setCurrentView(view);
    const targetUrl = view === "landing" ? "/" : `/${view}`;
    if (window.location.pathname !== targetUrl) {
      try {
        window.history.pushState({ view }, "", targetUrl);
      } catch {
        // Fallback if pushState fails
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />;
      case "learn":
        return <LearnPage initialLessonId={learnInitialLesson} onNavigate={handleNavigate} />;
      case "bounties":
        return <BountiesPage initialSearch={bountySearchParam} onNavigate={handleNavigate} />;
      case "auth":
        return <AuthPage onNavigate={handleNavigate} />;
      case "poster":
        if (!isAuthenticated) return <AuthPage onNavigate={handleNavigate} />;
        return <PosterDashboard />;
      case "worker":
        if (!isAuthenticated) return <AuthPage onNavigate={handleNavigate} />;
        return <WorkerDashboard onNavigate={handleNavigate} />;
      case "arbitrator":
        if (!isAuthenticated) return <AuthPage onNavigate={handleNavigate} />;
        return <ArbitratorDashboard />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col fintech-mesh-bg text-[#9A9E98] selection:bg-[#C6FF4D] selection:text-[#0B0D0C]">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
