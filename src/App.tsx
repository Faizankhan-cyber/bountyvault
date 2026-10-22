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

const AppContent: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>("landing");
  const [bountySearchParam, setBountySearchParam] = useState<string>("");

  const handleNavigate = (view: string, searchParam?: string) => {
    if (searchParam !== undefined) {
      setBountySearchParam(searchParam);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />;
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
