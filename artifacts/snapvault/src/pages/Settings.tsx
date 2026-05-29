import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/use-theme";
import {
  Sun, Moon, Copy, Folder, ChevronRight, ChevronDown, BookOpen, Newspaper,
  Trash2, ArrowLeft, Shield, FileText, HelpCircle,
  Upload, ScanSearch, FolderOpen, Download, AlertTriangle, MoveRight,
  Lock, CreditCard, MessageCircle, Share2, GraduationCap, Camera, Smile, CircleHelp, X,
} from "lucide-react";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none"
      style={{ background: checked ? "hsl(var(--primary))" : "hsl(var(--border))" }}
    >
      <span
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SettingsRow({ icon, label, desc, right }: {
  icon: React.ReactNode; label: string; desc?: string; right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground truncate">{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-muted hover:bg-muted/70 transition-colors shrink-0"
      >
        <ArrowLeft className="h-4 w-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">Back</span>
      </button>
      <h2 className="text-base font-bold text-foreground truncate">{title}</h2>
    </div>
  );
}

// ─── Privacy Policy ───────────────────────────────────────────────────────────

function PrivacyPolicyPage({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      title: "100% Browser-Based — No Server, No Cloud",
      body: "OrganizeShots runs entirely inside your web browser. Your screenshots are never uploaded to any server, cloud, or third-party service. All processing — including OCR and categorisation — happens locally on your device. We have no server that receives your files.",
    },
    {
      title: "What Happens to Your Images",
      body: "When you select screenshots, they are loaded into your browser's memory only. OrganizeShots processes them in-browser to detect text and sort them into smart folders. Once you close the tab, refresh the page, or click 'Start Over', all images are immediately removed from memory.",
    },
    {
      title: "Text Recognition & Smart Detection",
      body: "OrganizeShots uses a built-in text recognition engine to read visible content from your screenshots. This runs 100% inside your browser. No text or image data is ever sent to an external server or AI service.",
    },
    {
      title: "No Accounts, No Sign-In",
      body: "OrganizeShots requires no account, login, email, or registration of any kind. You can use the full app completely anonymously.",
    },
    {
      title: "No Analytics, No Tracking, No Ads",
      body: "We do not use Google Analytics, Facebook Pixel, or any other tracking or advertising tools. There are no third-party scripts, cookies, or trackers embedded in this app. We have zero interest in your behaviour data.",
    },
    {
      title: "Local Storage (Settings Only)",
      body: "Your preferences — such as dark/light mode and folder naming settings — are saved to your browser's localStorage so the app remembers your choices. This data never leaves your device and is never transmitted anywhere. You can clear it anytime from Settings → Clear All Data.",
    },
    {
      title: "Duplicate Detection",
      body: "OrganizeShots uses advanced fingerprint matching to identify duplicate screenshots entirely within your browser. No fingerprint or image data is ever stored permanently or sent anywhere.",
    },
    {
      title: "Children's Privacy",
      body: "OrganizeShots does not collect any personal data from anyone, including children. The app is safe for all ages — there is nothing to collect.",
    },
    {
      title: "Changes to This Policy",
      body: "If this privacy policy changes, the updated text will appear in the app. Continued use of OrganizeShots after any change means you accept the updated policy.",
    },
    {
      title: "Contact",
      body: "If you have any privacy questions or concerns, please reach out via the app's support channel. We aim to respond within 48 hours.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background">
      <SubPageHeader title="Privacy Policy" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Privacy-first by design</p>
            <p className="text-xs text-muted-foreground">No ads · No tracking · No accounts required</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">Last updated: May 2026 · OrganizeShots v2.1.0</p>

        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Terms of Service ─────────────────────────────────────────────────────────

function TermsOfServicePage({ onBack }: { onBack: () => void }) {
  const sections = [
    {
      title: "Acceptance of Terms",
      body: "By using OrganizeShots, you agree to these Terms of Service. If you do not agree, please discontinue use of the application. These terms apply to all users of the app.",
    },
    {
      title: "What OrganizeShots Is",
      body: "OrganizeShots is a screenshot organisation tool. It analyses images you provide, intelligently categorises them using proprietary smart detection technology, and packages them into an organised ZIP archive for download. It is a tool — not a storage service.",
    },
    {
      title: "Your Content",
      body: "You retain full ownership of all screenshots and images you process. OrganizeShots does not claim any rights over your content. Since nothing is uploaded to any server, your files never leave your control. You are responsible for ensuring you have the right to process the images you use.",
    },
    {
      title: "Acceptable Use",
      body: "You agree to use OrganizeShots only for lawful purposes. You must not use the app to process images containing illegal content, violate third-party intellectual property rights, or attempt to exploit, crash, or reverse-engineer the application.",
    },
    {
      title: "No Warranty",
      body: "OrganizeShots is provided 'as is' without any warranty of any kind, express or implied. We do not guarantee that categorisation will be 100% accurate or that the app will be available at all times.",
    },
    {
      title: "Limitation of Liability",
      body: "To the maximum extent permitted by law, OrganizeShots and its developers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app, including loss of files or incorrect categorisation.",
    },
    {
      title: "Data Responsibility",
      body: "Since OrganizeShots runs entirely in your browser, you are responsible for downloading your organised ZIP before closing the tab. All processing is in-memory only — closing the tab permanently clears all session data. There is no server to recover files from.",
    },
    {
      title: "Modifications to the App",
      body: "We reserve the right to modify, update, or discontinue OrganizeShots at any time without notice. Features may change between versions.",
    },
    {
      title: "Governing Law",
      body: "These terms are governed by applicable local law. Any disputes arising from use of OrganizeShots will be handled in accordance with the applicable jurisdiction of the developer.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background">
      <SubPageHeader title="Terms of Service" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500/8 border border-amber-500/20 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Simple & fair terms</p>
            <p className="text-xs text-muted-foreground">You own your data · We own nothing</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">Last updated: May 2026 · OrganizeShots v2.1.0</p>

        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "What types of images does OrganizeShots support?",
    a: "OrganizeShots supports PNG, JPG/JPEG, WebP, BMP, GIF, HEIC, and TIFF formats. Most screenshots from Android, iOS, Windows, and Mac are automatically supported.",
  },
  {
    q: "How many screenshots can I process at once?",
    a: "You can process up to 100 screenshots in a single batch. For best results, select screenshots from the same device or time period together.",
  },
  {
    q: "How does OrganizeShots decide which folder a screenshot goes into?",
    a: "OrganizeShots uses a multi-layer smart detection system to understand each screenshot. It analyses various signals — including the image name and visible content — to intelligently assign the correct folder. Everything runs privately inside your browser, no internet required.",
  },
  {
    q: "Does OrganizeShots use AI or send my images to the internet?",
    a: "No. OrganizeShots is 100% browser-based. Your images are never sent to any external AI service, cloud storage, or third-party server. All processing uses built-in browser technology — everything runs locally on your own device.",
  },
  {
    q: "What are the folder categories?",
    a: "OrganizeShots organises screenshots into 10 smart folders: OTP / Security, Payments / Receipts, WhatsApp / Chats, Social Media, Study / Notes, Photos, Memes / Entertainment, Documents, Unknown / Others, and Duplicates.",
  },
  {
    q: "What happens to my screenshots after I download the ZIP?",
    a: "Since everything runs in your browser, your screenshots only ever exist in your device's memory during the session. Once you close the tab, refresh, or click 'Start Over', all images are cleared from memory automatically. Nothing is stored on any server.",
  },
  {
    q: "A screenshot was put in the wrong folder. Can I move it?",
    a: "Yes! During the Review step, tap the folder icon on any screenshot thumbnail to open the 'Move to folder' option. Select the correct folder and it moves instantly. You can also delete screenshots you don't want included.",
  },
  {
    q: "Why does processing take some time?",
    a: "OrganizeShots does deep analysis of every screenshot entirely inside your browser — nothing is sent anywhere. Processing speed depends on the number and complexity of images — typically a few seconds per image.",
  },
  {
    q: "Why are some screenshots in 'Unknown / Others'?",
    a: "If OrganizeShots can't confidently match a screenshot to a known category, it places it in Unknown / Others. You can manually move these to the correct folder during the Review step.",
  },
  {
    q: "Does OrganizeShots work offline?",
    a: "Yes! Once the app is loaded in your browser, it works completely offline. There is no server — all processing happens on your device. Your internet connection is only needed to initially load the app.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. OrganizeShots never uploads your images anywhere. No server receives your files, no analytics track your behaviour, and no account is required. Your screenshots stay 100% on your device.",
  },
  {
    q: "How do I completely reset the app?",
    a: "Go to Settings → Clear All Data. This wipes all browser storage and resets the app to its initial state.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-none">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="flex-1 text-sm font-medium text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function FAQPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background">
      <SubPageHeader title="FAQ" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl bg-blue-500/8 border border-blue-500/20 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Frequently Asked Questions</p>
            <p className="text-xs text-muted-foreground">Everything about how OrganizeShots works</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Guide Page ───────────────────────────────────────────────────────────────

function GuidePage({ onBack }: { onBack: () => void }) {
  const steps: { Icon: React.ElementType; color: string; bg: string; title: string; desc: string }[] = [
    { Icon: Upload,     color: "#6366f1", bg: "rgba(99,102,241,0.12)",  title: "Upload Screenshots",          desc: "Drag & drop or tap Browse. PNG, JPG, WebP, HEIC — up to 100 files at once." },
    { Icon: ScanSearch, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", title: "App Processes Automatically", desc: "Reads the filename, scans for QR codes, then runs OCR — all on your device, nothing goes to any server." },
    { Icon: FolderOpen, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", title: "Fix Any Wrong Folders",       desc: "Tap the folder icon on any screenshot and pick the correct category — it moves instantly." },
    { Icon: Download,   color: "#10b981", bg: "rgba(16,185,129,0.12)", title: "Download ZIP",                desc: "Tap Download ZIP — all screenshots sorted into labelled folders inside." },
  ];
  const cats: { Icon: React.ElementType; color: string; bg: string; name: string; desc: string }[] = [
    { Icon: Lock,          color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  name: "OTP / Security",        desc: "Login codes, 2FA, password reset" },
    { Icon: CreditCard,    color: "#10b981", bg: "rgba(16,185,129,0.12)",  name: "Payments / Receipts",   desc: "UPI, bank transfers, receipts, invoices" },
    { Icon: MessageCircle, color: "#22c55e", bg: "rgba(34,197,94,0.12)",   name: "WhatsApp / Chats",      desc: "Chat screenshots, message threads" },
    { Icon: Share2,        color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  name: "Social Media",          desc: "Instagram, Twitter, TikTok, YouTube" },
    { Icon: GraduationCap, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  name: "Study / Notes",         desc: "Lectures, notes, exam results" },
    { Icon: Camera,        color: "#ec4899", bg: "rgba(236,72,153,0.12)",  name: "Photos",                desc: "Camera photos, gallery screenshots" },
    { Icon: Smile,         color: "#f97316", bg: "rgba(249,115,22,0.12)",  name: "Memes / Entertainment", desc: "Memes, jokes, viral content" },
    { Icon: FileText,      color: "#0ea5e9", bg: "rgba(14,165,233,0.12)",  name: "Documents",             desc: "IDs, certificates, scanned docs" },
    { Icon: CircleHelp,    color: "#94a3b8", bg: "rgba(148,163,184,0.12)", name: "Unknown / Others",      desc: "Could not identify — move manually" },
  ];

  return (
    <div className="flex flex-col bg-background min-h-[calc(100vh-56px)]">
      <SubPageHeader title="Guide" onBack={onBack} />
      <div className="overflow-y-auto flex-1 px-4 py-4 pb-28 flex flex-col gap-4">

        {/* Privacy — left-border card, no rgba background */}
        <div className="rounded-2xl bg-card border border-border border-l-4 border-l-emerald-500 px-4 py-4 flex gap-3 items-start shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">100% Private — No Server</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Your screenshots never leave your device. OCR, categorisation, and ZIP all run inside your browser only.</p>
          </div>
        </div>

        {/* Warning — left-border card */}
        <div className="rounded-2xl bg-card border border-border border-l-4 border-l-amber-500 px-4 py-4 flex gap-3 items-start shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Download ZIP Before Closing</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Everything is deleted when you close or refresh the tab. Always download your ZIP first.</p>
          </div>
        </div>

        {/* Steps */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-2">How to Use</p>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
            {steps.map(({ Icon, color, bg, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="text-muted-foreground text-xs mr-1">{i + 1}.</span>{title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fix tip */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4">
          <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <MoveRight className="h-4 w-4 text-primary" /> Fixing a Wrong Category
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Find the screenshot → tap the <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded font-medium mx-0.5"><Folder className="h-3 w-3" /> folder</span> icon → pick the correct category.
          </p>
          <p className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border">
            <strong className="text-foreground">Note:</strong> The app uses keyword rules, not AI — occasional mistakes are normal.
          </p>
        </div>

        {/* Smart Folders */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-2">Smart Folders</p>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
            {cats.map(({ Icon, color, bg, name, desc }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

type SubPage = "privacy" | "terms" | "faq" | "guide" | null;

type FolderNaming = "category" | "date" | "custom";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [dedupEnabled, setDedupEnabled] = useState(true);
  const [folderNaming, setFolderNaming] = useState<FolderNaming>(
    (localStorage.getItem("folderNaming") as FolderNaming) || "category"
  );
  const [customPrefix, setCustomPrefix] = useState(localStorage.getItem("folderNamingPrefix") || "");
  const [folderNamingOpen, setFolderNamingOpen] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();

  const subPageFromUrl: SubPage = (() => {
    if (location.startsWith("/settings/privacy")) return "privacy";
    if (location.startsWith("/settings/terms")) return "terms";
    if (location.startsWith("/settings/faq")) return "faq";
    if (location.startsWith("/settings/guide")) return "guide";
    return null;
  })();

  function goToSubPage(page: SubPage) {
    if (page) navigate(`/settings/${page}`);
    else navigate("/settings");
  }

  function handleClearAll() {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }

  // Sub-pages
  if (subPageFromUrl === "guide")   return <GuidePage onBack={() => navigate("/settings")} />;
  if (subPageFromUrl === "privacy") return <PrivacyPolicyPage onBack={() => navigate("/settings")} />;
  if (subPageFromUrl === "terms") return <TermsOfServicePage onBack={() => navigate("/settings")} />;
  if (subPageFromUrl === "faq") return <FAQPage onBack={() => navigate("/settings")} />;

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customise how OrganizeShots organises your screenshots</p>
      </div>

      {/* Appearance */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Appearance</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <SettingsRow
            icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            label="Theme"
            desc={theme === "dark" ? "Dark mode is on" : "Light mode is on"}
            right={
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            }
          />
        </div>
      </div>

      {/* Processing */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Processing</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <SettingsRow
            icon={<Copy className="h-4 w-4" />}
            label="Duplicate Detection"
            desc="Auto-detect and group duplicates"
            right={<Toggle checked={dedupEnabled} onChange={setDedupEnabled} />}
          />
        </div>
      </div>

      {/* Organisation */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Organisation</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Accordion header */}
          <button
            onClick={() => setFolderNamingOpen(o => !o)}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              <Folder className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Folder Naming</div>
              <div className="text-xs text-muted-foreground">
                {folderNaming === "category" ? "Category Only" : folderNaming === "date" ? "Date + Category" : "Custom Prefix"}
              </div>
            </div>
            <ChevronDown
              className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200"
              style={{ transform: folderNamingOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {/* Accordion body */}
          {folderNamingOpen && (
            <div className="border-t border-border/60 px-4 py-3 flex flex-col gap-1">
              {([
                { value: "category" as const, label: "Category Only" },
                { value: "date"     as const, label: "Date + Category" },
                { value: "custom"   as const, label: "Custom Prefix" },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFolderNaming(opt.value); localStorage.setItem("folderNaming", opt.value); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors w-full"
                  style={{ background: folderNaming === opt.value ? "hsl(var(--primary) / 0.08)" : "transparent" }}
                >
                  <span
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: folderNaming === opt.value ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)" }}
                  >
                    {folderNaming === opt.value && (
                      <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                    )}
                  </span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
              {folderNaming === "custom" && (
                <input
                  type="text"
                  placeholder="Enter prefix…"
                  value={customPrefix}
                  onChange={e => { setCustomPrefix(e.target.value); localStorage.setItem("folderNamingPrefix", e.target.value); }}
                  className="mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-full"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Help</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
          <button
            onClick={() => goToSubPage("guide")}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Guide</div>
              <div className="text-xs text-muted-foreground">How to use, smart folders, privacy</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Newspaper className="h-4 w-4 text-blue-500" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Blog</div>
              <div className="text-xs text-muted-foreground">Tips, features & how it works</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>

      {/* Legal & Info */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Legal & Info</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
          {[
            { key: "privacy" as SubPage, icon: <Shield className="h-4 w-4 text-emerald-500" />, label: "Privacy Policy", desc: "How we handle your data — spoiler: we don't" },
            { key: "terms" as SubPage,   icon: <FileText className="h-4 w-4 text-amber-500" />,  label: "Terms of Service", desc: "Simple, fair usage terms" },
            { key: "faq" as SubPage,     icon: <HelpCircle className="h-4 w-4 text-blue-500" />, label: "FAQ", desc: "Common questions & answers" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => goToSubPage(item.key)}
              className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* App version */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">Web Version</div>
          <div className="text-xs text-muted-foreground">OrganizeShots v2.1.0</div>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg">v2.1.0</span>
      </div>

      {/* Reset */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Reset</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4 text-red-500" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">Clear All Data</div>
              <div className="text-xs text-muted-foreground">Wipe all sessions, screenshots & settings</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>

      {/* Clear All Data — animated center modal */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99] transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: showClearDialog ? 1 : 0,
          pointerEvents: showClearDialog ? "auto" : "none",
        }}
        onClick={() => setShowClearDialog(false)}
      />
      {/* Card */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        style={{ pointerEvents: showClearDialog ? "auto" : "none" }}
      >
        <div
          className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden transition-all duration-300 ease-out"
          style={{
            transform: showClearDialog ? "scale(1) translateY(0)" : "scale(0.88) translateY(24px)",
            opacity: showClearDialog ? 1 : 0,
          }}
        >
          {/* Close button */}
          <div className="flex justify-end px-4 pt-4">
            <button
              onClick={() => setShowClearDialog(false)}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Icon + text */}
          <div className="flex flex-col items-center px-6 pb-4 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">Clear all data?</p>
              <p className="text-sm text-muted-foreground leading-snug">
                Saari sessions, screenshots aur settings browser se hamesha ke liye mit jayengi. Yeh wapis nahi aa sakta.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 px-5 pb-6">
            <button
              onClick={() => setShowClearDialog(false)}
              className="flex-1 h-11 rounded-2xl border border-border bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 h-11 rounded-2xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors active:scale-95 shadow-md shadow-red-500/20"
            >
              Yes, clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
