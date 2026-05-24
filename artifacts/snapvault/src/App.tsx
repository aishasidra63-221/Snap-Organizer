import { useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Files from "@/pages/Files";
import Activity from "@/pages/Activity";
import Settings from "@/pages/Settings";
import { BottomNav } from "@/components/BottomNav";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

const TABS = ["/", "/files", "/activity", "/settings"] as const;

function Router() {
  const [location] = useLocation();

  const activeTab = (() => {
    if (location === "/") return "/";
    for (const t of TABS) {
      if (t !== "/" && location.startsWith(t)) return t;
    }
    return null;
  })();

  if (activeTab === null) {
    return <NotFound />;
  }

  return (
    <>
      {/* All tabs stay mounted — only the active one is visible.
          This prevents expensive unmount/remount on every tab switch. */}
      <div className={activeTab === "/" ? undefined : "hidden"}><Home /></div>
      <div className={activeTab === "/files" ? undefined : "hidden"}><Files /></div>
      <div className={activeTab === "/activity" ? undefined : "hidden"}>
        <Activity isVisible={activeTab === "/activity"} />
      </div>
      <div className={activeTab === "/settings" ? undefined : "hidden"}><Settings /></div>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
