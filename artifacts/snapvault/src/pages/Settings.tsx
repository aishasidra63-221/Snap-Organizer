import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/use-theme";
import {
  Sun, Moon, ScanSearch, Copy, Folder, Cpu, ChevronRight,
  Trash2, ArrowLeft, Shield, FileText, HelpCircle, ChevronDown,
  BookOpen, Upload, FolderOpen, Download, AlertTriangle, MoveRight,
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

// ─── Guide / How It Works ─────────────────────────────────────────────────────

const CATEGORIES_INFO = [
  { emoji: "🔐", name: "OTP / Security",       desc: "Login codes, 2FA, password reset" },
  { emoji: "💳", name: "Payments / Receipts",  desc: "UPI, bank transfers, receipts, invoices" },
  { emoji: "💬", name: "WhatsApp / Chats",     desc: "Chat screenshots, message threads" },
  { emoji: "📱", name: "Social Media",         desc: "Instagram, Twitter, TikTok, YouTube" },
  { emoji: "📚", name: "Study / Notes",        desc: "Lectures, notes, exam results" },
  { emoji: "🖼️", name: "Photos",              desc: "Camera photos, photo gallery" },
  { emoji: "😂", name: "Memes / Entertainment", desc: "Memes, jokes, viral content" },
  { emoji: "📄", name: "Documents",            desc: "IDs, certificates, scanned docs" },
  { emoji: "❓", name: "Unknown / Others",     desc: "Couldn't identify — move manually" },
];

const STEPS = [
  {
    icon: <Upload className="h-5 w-5 text-primary" />,
    title: "Screenshots Upload Karein",
    desc: "Drag & drop karein ya 'Browse' dabao. PNG, JPG, WebP, HEIC sab supported hain. Ek baar mein 100 tak upload ho sakte hain.",
  },
  {
    icon: <ScanSearch className="h-5 w-5 text-violet-500" />,
    title: "App Automatic Process Karta Hai",
    desc: "Pehle filename dekhi jaati hai, phir QR code scan hota hai, phir OCR (text reading) chalta hai. Yeh sab aapke device pe hota hai — koi server nahi.",
  },
  {
    icon: <FolderOpen className="h-5 w-5 text-amber-500" />,
    title: "Galat Folder? Move Karein",
    desc: "Har screenshot ke neeche folder icon tap karein → sahi category choose karein. File turant move ho jaati hai.",
  },
  {
    icon: <Download className="h-5 w-5 text-emerald-500" />,
    title: "ZIP Download Karein",
    desc: "'Download ZIP' dabao. Andar sab screenshots sorted folders mein milenge — seedha apne phone mein.",
  },
];

function GuidePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background">
      <SubPageHeader title="Guide — Kaise Use Karein" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 flex flex-col gap-5">

        {/* Privacy banner */}
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">100% Private — Koi Server Nahi</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Aapke screenshots aapke device pe hi rehte hain. Browser band karo ya "Start Over" dabao — sab kuch delete ho jaata hai.
            </p>
          </div>
        </div>

        {/* Delete warning */}
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/8 border border-amber-500/20 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">⚠️ Zaroor ZIP Download Karein</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Tab band karne se pehle ZIP download kar lein — warna sari files hamesha ke liye delete ho jaayengi. App koi backup nahi rakhta.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            4 Steps — Itna Hi Hai
          </div>
          <div className="flex flex-col gap-3">
            {STEPS.map((step, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4 flex gap-3">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    {step.icon}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-3 bg-border rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Move tip */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <MoveRight className="h-4 w-4 text-primary" />
            Galat Category Fix Kaise Karein?
          </p>
          <ol className="flex flex-col gap-1.5 text-xs text-muted-foreground leading-relaxed">
            <li>1. Results screen pe screenshot dhundho</li>
            <li>2. Neeche folder icon <span className="font-mono bg-muted px-1 rounded">📁</span> tap karo</li>
            <li>3. Sahi category select karo — done!</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border/50">
            <strong>Note:</strong> Thodi bahut galti ho sakti hai — AI nahi hai, text-based rules hain. Manual correction zaroori ho sakti hai.
          </p>
        </div>

        {/* Categories */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Folders — Kya Kya Hai
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
            {CATEGORIES_INFO.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg w-8 text-center shrink-0">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
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

const processingModes = ["Balanced", "Fast", "Thorough"];
type FolderNaming = "category" | "date" | "custom";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [dedupEnabled, setDedupEnabled] = useState(true);
  const [processingMode, setProcessingMode] = useState("Balanced");
  const [folderNaming, setFolderNaming] = useState<FolderNaming>(
    (localStorage.getItem("folderNaming") as FolderNaming) || "category"
  );
  const [customPrefix, setCustomPrefix] = useState(localStorage.getItem("folderNamingPrefix") || "");
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
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
          <SettingsRow
            icon={<ScanSearch className="h-4 w-4" />}
            label="OCR Text Recognition"
            desc="Scan screenshots for readable text"
            right={<Toggle checked={ocrEnabled} onChange={setOcrEnabled} />}
          />
          <SettingsRow
            icon={<Copy className="h-4 w-4" />}
            label="Duplicate Detection"
            desc="Auto-detect and group duplicates"
            right={<Toggle checked={dedupEnabled} onChange={setDedupEnabled} />}
          />
          <SettingsRow
            icon={<Cpu className="h-4 w-4" />}
            label="Processing Mode"
            desc={processingMode}
            right={
              <div className="flex gap-1">
                {processingModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setProcessingMode(m)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: processingMode === m ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      color: processingMode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>

      {/* Organisation */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Organisation</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-border/50">
            <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              <Folder className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-medium text-foreground">Folder Naming</div>
              <div className="text-xs text-muted-foreground">Controls how ZIP folders are named</div>
            </div>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1">
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
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
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
        </div>
      </div>

      {/* Help & Guide */}
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
              <div className="text-sm font-medium text-foreground">Guide — Kaise Use Karein</div>
              <div className="text-xs text-muted-foreground">Step-by-step, categories, privacy, warnings</div>
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

      {/* Danger Zone */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Danger Zone</div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">
          <button
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-3 px-4 py-4 w-full hover:bg-destructive/10 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4 text-destructive" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-destructive">Clear All Data</div>
              <div className="text-xs text-destructive/70">Remove all screenshots and processed data</div>
            </div>
          </button>
        </div>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all uploaded screenshots and processed data from your browser. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
