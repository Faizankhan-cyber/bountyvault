import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Dedicated Pages
import { HomePage } from "./pages/HomePage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { BountyDetailPage } from "./pages/BountyDetailPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { CreateBountyPage } from "./pages/CreateBountyPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { DisputesPage } from "./pages/DisputesPage";
import { AboutPage } from "./pages/AboutPage";
import { SecurityPage } from "./pages/SecurityPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const parsePath = (path: string): { view: string; param?: string } => {
  const clean = path.replace(/\/+$/, "") || "/";
  
  if (clean === "/" || clean === "") return { view: "home" };
  if (clean === "/marketplace" || clean === "/bounties") return { view: "marketplace" };
  if (clean === "/bounties/create" || clean === "/create-bounty") return { view: "create-bounty" };
  
  const bountyMatch = clean.match(/^\/bounties\/(\d+)$/);
  if (bountyMatch) {
    return { view: "bounty-detail", param: bountyMatch[1] };
  }

  if (clean === "/how-it-works") return { view: "how-it-works" };
  if (clean === "/transactions" || clean === "/escrow") return { view: "transactions" };
  if (clean === "/disputes" || clean === "/arbitrator") return { view: "disputes" };
  if (clean === "/about") return { view: "about" };
  if (clean === "/security") return { view: "security" };
  if (clean === "/dashboard") return { view: "dashboard" };
  if (clean === "/login" || clean === "/auth") return { view: "login" };
  if (clean === "/register") return { view: "register" };

  return { view: "home" };
};

const getPathForView = (view: string, param?: string): string => {
  switch (view) {
    case "home":
    case "landing":
      return "/";
    case "marketplace":
    case "bounties":
      return "/marketplace";
    case "create-bounty":
      return "/bounties/create";
    case "bounty-detail":
      return param ? `/bounties/${param}` : "/marketplace";
    case "how-it-works":
      return "/how-it-works";
    case "transactions":
    case "escrow":
      return "/transactions";
    case "disputes":
    case "arbitrator":
      return "/disputes";
    case "about":
      return "/about";
    case "security":
      return "/security";
    case "dashboard":
    case "poster":
    case "worker":
      return "/dashboard";
    case "login":
    case "auth":
      return "/login";
    case "register":
      return "/register";
    default:
      return "/";
  }
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    return parsePath(window.location.pathname).view;
  });
  const [viewParam, setViewParam] = useState<string | undefined>(() => {
    return parsePath(window.location.pathname).param;
  });

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname);
      setCurrentView(parsed.view);
      setViewParam(parsed.param);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    // Map legacy views if passed
    let targetView = view;
    if (view === "landing") targetView = "home";
    if (view === "bounties") targetView = "marketplace";
    if (view === "auth") targetView = "login";
    if (view === "poster" || view === "worker") targetView = "dashboard";

    const targetUrl = getPathForView(targetView, param);
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, "", targetUrl);
    }

    setCurrentView(targetView);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
      case "landing":
        return <HomePage onNavigate={handleNavigate} />;

      case "marketplace":
      case "bounties":
        return <MarketplacePage initialSearch={viewParam || ""} onNavigate={handleNavigate} />;

      case "bounty-detail":
        return <BountyDetailPage bountyId={viewParam || "1"} onNavigate={handleNavigate} />;

      case "create-bounty":
        return <CreateBountyPage onNavigate={handleNavigate} />;

      case "how-it-works":
        return <HowItWorksPage onNavigate={handleNavigate} />;

      case "transactions":
      case "escrow":
        return <TransactionsPage onNavigate={handleNavigate} />;

      case "disputes":
        return <DisputesPage onNavigate={handleNavigate} />;

      case "about":
        return <AboutPage onNavigate={handleNavigate} />;

      case "security":
        return <SecurityPage onNavigate={handleNavigate} />;

      case "dashboard":
      case "poster":
      case "worker":
      case "arbitrator":
        return <DashboardPage onNavigate={handleNavigate} />;

      case "login":
      case "auth":
        return <LoginPage onNavigate={handleNavigate} />;

      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
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
