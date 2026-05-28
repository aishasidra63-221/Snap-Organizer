import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/use-theme";
import {
  Sun, Moon, Copy, Folder, ChevronRight, ChevronDown, BookOpen,
  Trash2, ArrowLeft, Shield, FileText, HelpCircle,
  Upload, ScanSearch, FolderOpen, Download, AlertTriangle, MoveRight,
  Lock, CreditCard, MessageCircle, Share2, GraduationCap, Camera, Smile, CircleHelp,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      title: "No Data Leaves Your Device",
      body: "OrganizeShots processes all your screenshots locally — on your own device and browser. We do not upload your images to any external server, cloud, or third-party service. Your screenshots never leave your control.",
    },
    {
      title: "What We Process",
      body: "When you upload screenshots, OrganizeShots temporarily stores them in memory to run OCR (text recognition) and categorisation. This data exists only for the duration of your session and is automatically cleared when you close the tab or click 'Start Over'.",
    },
    {
      title: "OCR & Text Recognition",
      body: "OrganizeShots reads text from your screenshots using Tesseract.js — an open-source OCR engine that runs entirely in your browser or on the local server. Extracted text is used only to determine which folder a screenshot belongs to, and is never stored permanently or shared.",
    },
    {
      title: "No Accounts, No Tracking",
      body: "OrganizeShots requires no account, login, or registration. We do not track your usage, install analytics cookies, or collect any personally identifiable information. There are no third-party trackers embedded in the app.",
    },
    {
      title: "Local Storage",
      body: "Your theme preference (dark/light mode) and other UI settings are saved to your browser's localStorage. This data never leaves your device. You can clear it at any time from Settings → Clear All Data.",
    },
    {
      title: "Temporary Server Storage",
      body: "Uploaded screenshots are stored temporarily in a secure temp directory on the server during processing. Once you download your ZIP or click 'Start Over', all temporary files are deleted. The server does not retain copies of your images after the session ends.",
    },
    {
      title: "Children's Privacy",
      body: "OrganizeShots is not directed at children under 13 and does not knowingly collect any information from minors. If you believe a child has used the service, no personal data is collected regardless.",
    },
    {
      title: "Changes to This Policy",
      body: "If this privacy policy changes, we will update the policy text in the app. Continued use of OrganizeShots after any change constitutes acceptance of the updated policy.",
    },
    {
      title: "Contact",
      body: "If you have any privacy questions or concerns, you can reach us through the app's support channel. We aim to respond within 48 hours.",
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

        <p className="text-xs text-muted-foreground px-1">Last updated: May 2025 · OrganizeShots v1.0.0</p>

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
      body: "OrganizeShots is a screenshot organisation tool. It analyses images you provide, categorises them using rule-based logic and OCR, and packages them into an organised ZIP archive for download. It is a tool — not a storage service.",
    },
    {
      title: "Your Content",
      body: "You retain full ownership of all screenshots and images you upload. OrganizeShots does not claim any rights over your content. You are responsible for ensuring you have the right to process the images you upload.",
    },
    {
      title: "Acceptable Use",
      body: "You agree to use OrganizeShots only for lawful purposes. You must not upload images that contain illegal content, violate third-party intellectual property rights, or attempt to exploit, crash, or reverse-engineer the application.",
    },
    {
      title: "No Warranty",
      body: "OrganizeShots is provided 'as is' without any warranty of any kind, express or implied. We do not guarantee that categorisation will be 100% accurate, that the service will be uninterrupted, or that files will be retained beyond your current session.",
    },
    {
      title: "Limitation of Liability",
      body: "To the maximum extent permitted by law, OrganizeShots and its developers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app, including loss of data, loss of files, or incorrect categorisation.",
    },
    {
      title: "Data Responsibility",
      body: "You are responsible for downloading and backing up your organised ZIP before closing the session. OrganizeShots does not permanently store your images — session data is deleted when your session ends.",
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

        <p className="text-xs text-muted-foreground px-1">Last updated: May 2025 · OrganizeShots v1.0.0</p>

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
    q: "How many screenshots can I upload at once?",
    a: "You can upload up to 500 screenshots in a single batch. Each file can be up to 50 MB. For best results, upload screenshots from the same time period together.",
  },
  {
    q: "How does OrganizeShots decide which folder a screenshot goes into?",
    a: "OrganizeShots uses a three-step rule-based system: first it checks the filename (e.g. 'IMG-20240101-WA' goes to WhatsApp), then it scans for QR codes and checks their text, then it runs OCR to read visible text. Keywords like 'OTP', 'UPI', 'receipt', 'Instagram', 'lecture' etc. determine the folder. No AI is used.",
  },
  {
    q: "Does OrganizeShots use AI or send my images to the internet?",
    a: "No. OrganizeShots is 100% rule-based and uses open-source OCR (Tesseract.js). Your images are never sent to any external AI service, cloud storage, or third-party server. Everything runs locally.",
  },
  {
    q: "What are the folder categories?",
    a: "OrganizeShots organises screenshots into: OTP / Security, Payments / Receipts, WhatsApp / Chats, Social Media, Study / Notes, Photos, Memes / Entertainment, Documents, and Unknown / Others. Exact duplicates go into the Duplicates folder.",
  },
  {
    q: "What happens to my screenshots after I download the ZIP?",
    a: "Once your session ends or you click 'Start Over', all your uploaded screenshots and temporary files are permanently deleted from the server. OrganizeShots does not retain any copies.",
  },
  {
    q: "A screenshot was put in the wrong folder. Can I move it?",
    a: "Yes! During the Review step, tap the folder icon on any screenshot thumbnail to open the 'Move to folder' sheet. Select the correct folder and it moves instantly. You can also delete screenshots you don't want included.",
  },
  {
    q: "What is OCR and why does it take time?",
    a: "OCR (Optical Character Recognition) reads the text visible in your screenshots. It runs on screenshots that couldn't be categorised by filename or QR code. Processing speed depends on image count and complexity — typically 2–5 seconds per image.",
  },
  {
    q: "Why are some screenshots in 'Unknown / Others'?",
    a: "If OrganizeShots can't confidently match a screenshot to a known category — because the filename is generic and the visible text doesn't contain recognised keywords — it places it in Unknown / Others. You can manually move these after processing.",
  },
  {
    q: "Can I re-download a ZIP from a previous session?",
    a: "Yes — go to the Files tab and find the Recent Batches section. Any completed batch with a ready ZIP will have a download button you can tap again.",
  },
  {
    q: "Does OrganizeShots work offline?",
    a: "The app requires a server connection for uploading and processing. However, once your ZIP is downloaded, it's a completely standalone file on your device and can be opened without any internet connection.",
  },
  {
    q: "How do I completely reset the app?",
    a: "Go to Settings → Clear All Data. This wipes all browser storage and resets the app to its initial state. Any undownloaded processed files will be lost.",
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

        {/* Privacy */}
        <div className="rounded-2xl border px-4 py-4 flex gap-3 items-start" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.22)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
            <Shield className="h-5 w-5" style={{ color: "#10b981" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">100% Private — No Server</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Your screenshots never leave your device. OCR, categorisation, and ZIP all run inside your browser only.</p>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border px-4 py-4 flex gap-3 items-start" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.22)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
            <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
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
            Find the screenshot in the results → tap the <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded font-medium mx-0.5"><Folder className="h-3 w-3" /> folder</span> icon → pick the correct category. Done.
          </p>
          <p className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border/60">
            <strong className="text-foreground">Note:</strong> The app uses keyword rules, not AI — occasional mistakes are normal.
          </p>
        </div>

        {/* Folders */}
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
  const [subPage, setSubPage] = useState<SubPage>(null);

  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  function handleClearAll() {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }

  // Sub-pages
  if (subPage === "guide")   return <GuidePage onBack={() => setSubPage(null)} />;
  if (subPage === "privacy") return <PrivacyPolicyPage onBack={() => setSubPage(null)} />;
  if (subPage === "terms") return <TermsOfServicePage onBack={() => setSubPage(null)} />;
  if (subPage === "faq") return <FAQPage onBack={() => setSubPage(null)} />;

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
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            onClick={() => setSubPage("guide")}
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
              onClick={() => setSubPage(item.key)}
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
          <div className="text-sm font-medium text-foreground">App Version</div>
          <div className="text-xs text-muted-foreground">OrganizeShots v1.0.0</div>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg">v1.0.0</span>
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

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all uploaded screenshots, processed batches, and saved settings from your browser. Any un-downloaded ZIPs will be lost permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
