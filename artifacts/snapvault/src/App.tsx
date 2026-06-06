import { useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Files from "@/pages/Files";
import Activity from "@/pages/Activity";
import Settings from "@/pages/Settings";
import Blog from "@/pages/Blog";
import { BottomNav } from "@/components/BottomNav";
import { useSeo } from "@/hooks/use-seo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

const TABS = ["/", "/files", "/activity", "/settings"] as const;

const SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "OrganizeShots – Free Screenshot Organizer | Smart Folders",
    description: "OrganizeShots sorts screenshots into smart folders — OTP, Payments, WhatsApp & more. 100% free, no account, no upload. Works in your browser.",
  },
  "/blog": {
    title: "Screenshot Organizer Blog – Tips, Guides & Updates | OrganizeShots",
    description: "Learn how to organize screenshots, remove duplicates, and manage your gallery efficiently. Free guides and tips from OrganizeShots.",
  },
  "/blog/screenshot-organizer-free-browser-tool": {
    title: "Screenshot Organizer – Free Browser Tool, No App Install | OrganizeShots",
    description: "OrganizeShots sorts screenshots into 10 smart folders — OTP, Payments, WhatsApp & more. Free, no install, no account. Works in any browser.",
  },
  "/blog/organize-screenshots-automatically": {
    title: "Organize Screenshots Automatically – No App Needed | OrganizeShots",
    description: "Your phone has hundreds of unorganized screenshots. Sort them all into neat folders in under a minute — completely free, no app needed.",
  },
  "/blog/best-screenshot-manager-android-iphone": {
    title: "Best Free Screenshot Manager for Android & iPhone | OrganizeShots",
    description: "Comparing the best free screenshot manager tools in 2026. Find the right tool to organize your gallery without cloud uploads or subscriptions.",
  },
  "/blog/how-to-delete-duplicate-screenshots": {
    title: "Find & Delete Duplicate Screenshots on Your Phone | OrganizeShots",
    description: "Duplicate screenshots waste storage and clutter your gallery. Here's the easiest way to detect and remove them automatically — free and private.",
  },
  "/blog/otp-screenshot-organizer": {
    title: "Tired of Searching for OTP Screenshots? Here's the Fix | OrganizeShots",
    description: "OrganizeShots auto-sorts all your OTP and security screenshots into one folder — so you never waste time scrolling for them again.",
  },
  "/blog/organize-payment-receipt-screenshots": {
    title: "Auto-Organize Payment & UPI Receipt Screenshots | OrganizeShots",
    description: "UPI receipts, bank transfers, GPay confirmations — OrganizeShots automatically groups all your payment screenshots in one folder.",
  },
  "/blog/what-is-ocr-screenshot": {
    title: "How OrganizeShots Reads Your Screenshots | OrganizeShots",
    description: "Discover how OrganizeShots analyses screenshots entirely inside your browser — no uploads, no cloud, fully private.",
  },
  "/settings": {
    title: "Settings | OrganizeShots",
    description: "Manage your OrganizeShots preferences, read the privacy policy, terms of service, and get help with frequently asked questions.",
  },
  "/settings/privacy": {
    title: "Privacy Policy | OrganizeShots",
    description: "OrganizeShots processes everything inside your browser. No data is ever sent to any server. Read our full privacy policy here.",
  },
  "/settings/terms": {
    title: "Terms of Service | OrganizeShots",
    description: "Simple, fair terms for using OrganizeShots — the free, browser-based screenshot organizer.",
  },
  "/settings/faq": {
    title: "FAQ – Frequently Asked Questions | OrganizeShots",
    description: "Common questions about OrganizeShots: how it works, privacy, supported formats, folder categories, and more.",
  },
  "/settings/guide": {
    title: "How to Use OrganizeShots – Complete Guide",
    description: "Step-by-step guide to organizing your screenshots with OrganizeShots. Upload, review, move, and download in minutes.",
  },
};

function SeoManager() {
  const [location] = useLocation();
  const seo = SEO[location] ?? SEO["/"];
  useSeo({ title: seo.title, description: seo.description, path: location });
  return null;
}

function Router() {
  const [location] = useLocation();

  if (location === "/blog" || location.startsWith("/blog/")) {
    return <Blog />;
  }

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
      <div className={activeTab === "/files" ? undefined : "hidden"}><Files isVisible={activeTab === "/files"} /></div>
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
          <SeoManager />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
