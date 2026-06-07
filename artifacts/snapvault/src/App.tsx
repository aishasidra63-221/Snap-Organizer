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

const DOMAIN = "https://www.organizeshots.com";

function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

const SEO: Record<string, { title: string; description: string; jsonLd?: object | object[] }> = {
  "/": {
    title: "OrganizeShots – Free Screenshot Organizer | Smart Folders",
    description: "OrganizeShots sorts screenshots into smart folders — OTP, Payments, WhatsApp & more. 100% free, no account, no upload. Works in your browser.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "OrganizeShots",
        url: DOMAIN,
        description: "Free browser-based screenshot organizer. Sorts screenshots into smart folders — OTP, Payments, WhatsApp & more. No upload, no account.",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Screenshot organization into smart folders",
          "Duplicate screenshot detection",
          "In-browser OCR text reading",
          "OTP, Payments, WhatsApp auto-sorting",
          "No server upload — 100% private",
        ],
      },
      faqSchema([
        { q: "Is OrganizeShots free?", a: "Yes, OrganizeShots is completely free. No account, no subscription, no hidden fees." },
        { q: "Does it upload my screenshots to a server?", a: "No. All processing happens inside your browser. Your screenshots never leave your device." },
        { q: "What types of screenshots does it sort?", a: "OrganizeShots sorts screenshots into 10 smart folders: OTP, Payments, WhatsApp, Social Media, Shopping, Travel, Study Notes, Memes, Duplicates, and Others." },
        { q: "Does it work on Android and iPhone?", a: "Yes. OrganizeShots works in any modern browser on Android, iPhone, iPad, or computer — no app install required." },
      ]),
    ],
  },
  "/blog": {
    title: "Screenshot Organizer Blog – Tips, Guides & Updates | OrganizeShots",
    description: "Learn how to organize screenshots, remove duplicates, and manage your gallery efficiently. Free guides and tips from OrganizeShots.",
  },
  "/blog/screenshot-organizer-free-browser-tool": {
    title: "Screenshot Organizer – Free Browser Tool, No App Install | OrganizeShots",
    description: "OrganizeShots sorts screenshots into 10 smart folders — OTP, Payments, WhatsApp & more. Free, no install, no account. Works in any browser.",
    jsonLd: faqSchema([
      { q: "Does OrganizeShots work without installing an app?", a: "Yes. OrganizeShots runs entirely in your browser — no Play Store or App Store download required. Open organizeshots.com and start immediately." },
      { q: "What folders does OrganizeShots create?", a: "OrganizeShots sorts screenshots into 10 smart folders: OTP codes, Payments & Receipts, WhatsApp chats, Social Media, Shopping, Travel, Study Notes, Memes, Duplicates, and Others." },
      { q: "Is it free to use?", a: "Yes, completely free. No account, no subscription, no hidden charges." },
      { q: "Does it work on Android and iPhone?", a: "Yes. It works on any modern browser — Chrome, Safari, Firefox — on Android, iPhone, iPad, or computer." },
    ]),
  },
  "/blog/save-whatsapp-screenshots-organized": {
    title: "Save & Organize WhatsApp Screenshots Automatically | OrganizeShots",
    description: "WhatsApp screenshots pile up fast — chats, payments, status saves. Auto-sort all of them into folders for free. No app install, works on Android & iPhone.",
    jsonLd: faqSchema([
      { q: "Does it work for WhatsApp Business screenshots too?", a: "Yes — WhatsApp, WhatsApp Business, and any other chat app screenshots are detected and sorted automatically." },
      { q: "What about WhatsApp payment screenshots (GPay, PhonePe)?", a: "Payment screenshots sent or received via WhatsApp are placed in the Payments & Receipts folder, separate from chat screenshots." },
      { q: "Are my private WhatsApp chats safe?", a: "Yes. OrganizeShots processes everything locally inside your browser. No screenshot — including private conversations — is ever uploaded to any server." },
      { q: "Does it need internet to process my screenshots?", a: "Only for the initial page load. After that, all OCR processing runs offline inside your browser." },
    ]),
  },
  "/blog/free-up-phone-storage-delete-duplicate-screenshots": {
    title: "Free Up Phone Storage – Delete Duplicate Screenshots | OrganizeShots",
    description: "Duplicate screenshots waste GBs of phone storage. Find and delete them free — no app install. Works on Android & iPhone using OrganizeShots.",
    jsonLd: faqSchema([
      { q: "Does OrganizeShots delete files from my phone automatically?", a: "No. OrganizeShots shows you which screenshots are duplicates — you decide what to delete. Nothing is removed without your action." },
      { q: "Is it safe to use for private screenshots?", a: "Yes. All processing happens inside your browser. No photos are uploaded to any server." },
      { q: "Will it work on an old Android phone?", a: "Yes, as long as you have a modern browser (Chrome, Firefox, Samsung Internet) — it works on any Android or iPhone." },
      { q: "How much storage can I free up by deleting duplicate screenshots?", a: "On average, 15–25% of screenshots on a typical Android phone are duplicates. For 1,000 screenshots, you could recover 50–100 MB or more." },
    ]),
  },
  "/blog/organize-screenshots-automatically": {
    title: "Organize Screenshots Automatically – No App Needed | OrganizeShots",
    description: "Your phone has hundreds of unorganized screenshots. Sort them all into neat folders in under a minute — completely free, no app needed.",
    jsonLd: faqSchema([
      { q: "How does OrganizeShots organize screenshots automatically?", a: "OrganizeShots uses in-browser OCR to read the text in each screenshot and automatically categorize it into the right folder — OTP, Payments, WhatsApp, and more." },
      { q: "Do I need to manually tag or sort screenshots?", a: "No. Upload your screenshots and OrganizeShots automatically sorts them. You just review and download the organized ZIP." },
      { q: "How many screenshots can I organize at once?", a: "You can upload up to 100 screenshots at a time. PNG, JPG, WebP, and HEIC formats are all supported." },
    ]),
  },
  "/blog/best-screenshot-manager-android-iphone": {
    title: "Best Free Screenshot Manager for Android & iPhone | OrganizeShots",
    description: "Comparing the best free screenshot manager tools in 2026. Find the right tool to organize your gallery without cloud uploads or subscriptions.",
    jsonLd: faqSchema([
      { q: "What is the best free screenshot manager for Android?", a: "OrganizeShots is the only fully free, browser-based screenshot manager that sorts screenshots into smart folders using OCR — no app install, no account required." },
      { q: "Does it work on iPhone as well as Android?", a: "Yes. OrganizeShots works on both Android and iPhone — it runs in your browser so no platform-specific app is needed." },
      { q: "Does it require cloud storage or upload?", a: "No. OrganizeShots processes everything locally in your browser. No cloud storage, no uploads, no account needed." },
    ]),
  },
  "/blog/how-to-delete-duplicate-screenshots": {
    title: "Find & Delete Duplicate Screenshots on Your Phone | OrganizeShots",
    description: "Duplicate screenshots waste storage and clutter your gallery. Here's the easiest way to detect and remove them automatically — free and private.",
    jsonLd: faqSchema([
      { q: "How do I find duplicate screenshots on my phone?", a: "Upload your screenshots to OrganizeShots. It automatically detects exact duplicates using digital fingerprinting and groups them in a Duplicates folder." },
      { q: "Will deleting duplicates affect my original photos?", a: "No. OrganizeShots only shows you duplicates — you choose which ones to delete. Your originals are safe until you delete them yourself." },
      { q: "Does it find similar screenshots or only exact duplicates?", a: "Currently OrganizeShots detects exact duplicate screenshots. Similar-but-not-identical images are not flagged." },
    ]),
  },
  "/blog/otp-screenshot-organizer": {
    title: "Tired of Searching for OTP Screenshots? Here's the Fix | OrganizeShots",
    description: "OrganizeShots auto-sorts all your OTP and security screenshots into one folder — so you never waste time scrolling for them again.",
    jsonLd: faqSchema([
      { q: "How does OrganizeShots find OTP screenshots automatically?", a: "OrganizeShots uses in-browser OCR to read the text in every screenshot. Any screenshot containing words like OTP, verification code, one-time password, or similar phrases is sorted into the OTP folder." },
      { q: "Which apps' OTP screenshots does it recognize?", a: "It recognizes OTP screenshots from any app — banking apps, Google, WhatsApp, Instagram, Aadhaar, UPI apps, and more." },
      { q: "Is it safe to process OTP screenshots?", a: "Yes. All processing is done locally in your browser. No OTP codes or screenshots are ever sent to any server." },
    ]),
  },
  "/blog/organize-payment-receipt-screenshots": {
    title: "Auto-Organize Payment & UPI Receipt Screenshots | OrganizeShots",
    description: "UPI receipts, bank transfers, GPay confirmations — OrganizeShots automatically groups all your payment screenshots in one folder.",
    jsonLd: faqSchema([
      { q: "Which payment apps' screenshots does OrganizeShots recognize?", a: "OrganizeShots recognizes screenshots from GPay, PhonePe, Paytm, BHIM UPI, Amazon Pay, bank transfer confirmations, and other payment apps." },
      { q: "Are my payment receipts safe when processed?", a: "Yes. Everything is processed locally in your browser. No payment details or screenshots are uploaded to any server." },
      { q: "Can I use this to keep track of my UPI payment history?", a: "Yes. OrganizeShots groups all your payment receipt screenshots together so you can easily find and review past transactions." },
    ]),
  },
  "/blog/what-is-ocr-screenshot": {
    title: "How OrganizeShots Reads Your Screenshots | OrganizeShots",
    description: "Discover how OrganizeShots analyses screenshots entirely inside your browser — no uploads, no cloud, fully private.",
    jsonLd: faqSchema([
      { q: "What is OCR and how does OrganizeShots use it?", a: "OCR (Optical Character Recognition) reads the text inside an image. OrganizeShots runs OCR directly in your browser to read screenshot text and automatically decide which folder it belongs to." },
      { q: "Does OCR send my screenshots to a server?", a: "No. OrganizeShots uses Tesseract.js, which runs entirely inside your browser. No image data is ever sent to a server." },
      { q: "What languages does the OCR support?", a: "OrganizeShots currently supports English text recognition. Screenshots in other languages may still be sorted based on recognizable patterns." },
    ]),
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
  useSeo({ title: seo.title, description: seo.description, path: location, jsonLd: seo.jsonLd });
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
