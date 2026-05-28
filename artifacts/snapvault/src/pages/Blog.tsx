import { useState } from "react";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function blogImg(name: string) { return `${BASE}/blog/${name}`; }

// ─── Blog Posts Data ──────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  gradient: string;
  content: React.ReactNode;
}

const posts: BlogPost[] = [
  {
    id: "organize-screenshots-automatically",
    title: "How to Organize Screenshots Automatically (Without Any App Install)",
    excerpt: "Your phone has hundreds of unorganized screenshots. Here's how to sort them all into neat folders in under a minute — completely free.",
    date: "May 28, 2026",
    readTime: "5 min read",
    category: "Guide",
    image: blogImg("blog-organize.png"),
    gradient: "from-violet-500/20 to-purple-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>Your phone gallery has hundreds of screenshots. Payment receipts. OTP codes. WhatsApp conversations. Random memes. And you can never find the one you actually need.</p>
        <p>That's exactly the problem <strong>OrganizeShots</strong> solves. It's a free, browser-based <strong>screenshot organizer</strong> that reads your screenshots, understands what's inside them, and sorts everything into neat folders — automatically.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Why Your Screenshot Folder Is Always a Mess</h2>
        <p>Most people take screenshots impulsively. You screenshot a UPI payment. Then a meme. Then someone's address. Then an OTP you'll need in 30 seconds. Your gallery doesn't care — it just dumps everything in one place, sorted by time.</p>
        <p>Manual sorting feels like homework. Nobody does it. So the mess grows. Until you have 2,000 screenshots and no idea where anything is.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">How to Organize Screenshots in 4 Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Open OrganizeShots</strong> in any browser — no install needed.</li>
          <li><strong>Upload up to 100 screenshots</strong> by dragging and dropping them in.</li>
          <li><strong>Wait 30–60 seconds</strong> while the app reads and sorts everything.</li>
          <li><strong>Download the ZIP</strong> — all screenshots organized into labelled folders.</li>
        </ol>
        <p>No account. No subscription. No app install. Just open the website and go.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">10 Smart Categories</h2>
        <p>OrganizeShots sorts your screenshots into: <strong>OTP / Security, Payments / Receipts, WhatsApp / Chats, Social Media, Study / Notes, Photos, Memes / Entertainment, Documents, Unknown / Others,</strong> and <strong>Duplicates</strong>.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">100% Private — Your Screenshots Never Leave Your Device</h2>
        <p>OrganizeShots runs entirely inside your web browser. No server receives your files. No cloud. No AI in the cloud. Everything runs locally on your device using open-source OCR (Tesseract.js).</p>
        <p>Give it a try — upload your screenshots, watch the folders fill up, and download a perfectly organized ZIP in under a minute.</p>
      </div>
    ),
  },
  {
    id: "best-screenshot-manager-android-iphone",
    title: "Best Screenshot Manager App for Android & iPhone in 2026 (Free)",
    excerpt: "Tired of scrolling through hundreds of unorganized screenshots? Here are the best tools to manage your screenshot gallery in 2026.",
    date: "May 25, 2026",
    readTime: "4 min read",
    category: "Comparison",
    image: blogImg("blog-best-manager.png"),
    gradient: "from-blue-500/20 to-cyan-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>Finding the best screenshot manager in 2026 is harder than it should be. Most apps either require an account, upload your photos to the cloud, or charge a subscription fee. This guide covers the best free options — starting with the one that requires absolutely nothing.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">1. OrganizeShots (Best Free Option — No Install)</h2>
        <p><strong>OrganizeShots</strong> is a browser-based screenshot organizer that works on any device — Android, iPhone, Windows, Mac. You don't install anything. Just open the website, drop in your screenshots, and download a sorted ZIP.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ 100% free, no subscription</li>
          <li>✅ No account or sign-in</li>
          <li>✅ Works offline after initial load</li>
          <li>✅ 10 smart auto-categories</li>
          <li>✅ Private — nothing uploaded to any server</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-2">2. Google Photos (Cloud-Based)</h2>
        <p>Google Photos has basic screenshot organization but it requires a Google account, uploads everything to Google's servers, and doesn't auto-sort by content type. Good for search, but not for bulk organized exports.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">3. Manual Folder Sorting</h2>
        <p>Some people create folders on their device manually. This works but takes hours for large screenshot libraries. Not scalable.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Our Recommendation</h2>
        <p>For anyone who wants a fast, free, private solution to <strong>organize screenshots automatically</strong>, OrganizeShots is the clear winner. No install, no cloud, no account — just upload and download a sorted ZIP.</p>
      </div>
    ),
  },
  {
    id: "how-to-delete-duplicate-screenshots",
    title: "How to Find and Delete Duplicate Screenshots on Your Phone",
    excerpt: "Duplicate screenshots waste storage and make your gallery messier. Here's the easiest way to detect and remove them automatically.",
    date: "May 22, 2026",
    readTime: "3 min read",
    category: "Tips",
    image: blogImg("blog-duplicates.png"),
    gradient: "from-rose-500/20 to-pink-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>It happens to everyone. You screenshot something, forget you did it, and screenshot it again. Or you share a photo and save the same image five times. Duplicate screenshots quietly eat your storage and make your gallery harder to navigate.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Why Duplicates Are So Common</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>You screenshotted the same OTP multiple times</li>
          <li>You downloaded a WhatsApp image and also screenshotted it</li>
          <li>You transferred screenshots between devices and got copies</li>
          <li>An app saved a screenshot automatically more than once</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-2">How OrganizeShots Detects Duplicates</h2>
        <p>OrganizeShots uses <strong>SHA-256 hashing</strong> to detect exact duplicate screenshots. Every image is converted to a unique hash — if two images produce the same hash, they are identical files. Duplicates are automatically placed in a separate <strong>Duplicates</strong> folder in your ZIP.</p>
        <p>This runs entirely in your browser — no images are uploaded anywhere. The hash is just a mathematical fingerprint, not the image itself.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Step-by-Step: Remove Duplicate Screenshots</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open OrganizeShots in your browser</li>
          <li>Upload all your screenshots (up to 100 at once)</li>
          <li>After processing, check the <strong>Duplicates</strong> folder in the review screen</li>
          <li>Delete the ones you don't need before downloading</li>
          <li>Download your clean, deduplicated ZIP</li>
        </ol>

        <h2 className="text-lg font-bold text-foreground mt-2">How Much Storage Can You Save?</h2>
        <p>In testing with 100 screenshots, we typically find 10–25% are exact duplicates. On a phone with 2 GB of screenshots, that could mean freeing up 200–500 MB just from deduplication.</p>
      </div>
    ),
  },
  {
    id: "otp-screenshot-organizer",
    title: "Tired of Searching for OTP Screenshots? Here's the Fix",
    excerpt: "You take an OTP screenshot, then spend 3 minutes scrolling to find it. OrganizeShots auto-sorts all your OTP and security screenshots into one folder.",
    date: "May 19, 2026",
    readTime: "3 min read",
    category: "Use Case",
    image: blogImg("blog-otp.png"),
    gradient: "from-amber-500/20 to-yellow-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>You know the drill. A bank sends you an OTP. You screenshot it because switching apps is risky. You enter the OTP. And now that screenshot lives in your gallery forever, buried under 300 other screenshots you'll never need.</p>
        <p>Multiply that by every login, every transaction, every verification code — and your screenshot gallery becomes a security and privacy mess.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Why OTP Screenshots Are a Problem</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>They contain sensitive bank and app login codes</li>
          <li>They're hard to find when you need to reference old transactions</li>
          <li>They clutter your gallery with security-sensitive content</li>
          <li>If someone accesses your gallery, they can see all your OTPs</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-2">How OrganizeShots Handles OTP Screenshots</h2>
        <p>OrganizeShots uses OCR to read text inside your screenshots and detect keywords like <strong>"OTP", "one-time password", "verification code", "do not share"</strong>, and similar phrases used by banks and apps.</p>
        <p>All matching screenshots go into a dedicated <strong>OTP / Security</strong> folder in your organized ZIP. You can review them all at once and decide which ones to keep or delete — before downloading.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Is It Safe? Yes — Here's Why</h2>
        <p>The OCR runs entirely inside your browser. Your screenshots are never uploaded to any server. No one can see your OTP codes except you. OrganizeShots is designed specifically to handle sensitive screenshots privately.</p>
      </div>
    ),
  },
  {
    id: "organize-payment-receipt-screenshots",
    title: "How to Organize Payment & UPI Receipt Screenshots Automatically",
    excerpt: "UPI receipts, bank transfers, GPay confirmations — OrganizeShots automatically finds and groups all your payment screenshots in one folder.",
    date: "May 15, 2026",
    readTime: "4 min read",
    category: "Use Case",
    image: blogImg("blog-payments.png"),
    gradient: "from-emerald-500/20 to-green-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>If you use UPI, GPay, PhonePe, or Paytm, you probably screenshot every payment confirmation. Over months, that adds up to hundreds of payment screenshots scattered across your gallery — impossible to find when you actually need them for tax filing, expense tracking, or dispute resolution.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">What Counts as a Payment Screenshot?</h2>
        <p>OrganizeShots detects payment-related screenshots by scanning for keywords like:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>UPI, NEFT, IMPS, RTGS</strong> — transfer types</li>
          <li><strong>₹, transaction, receipt, paid, debit, credit</strong></li>
          <li><strong>GPay, PhonePe, Paytm, BHIM, bank name</strong></li>
          <li><strong>"Payment successful", "Amount debited"</strong> — confirmation text</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-2">Perfect for Tax Season & Expense Reports</h2>
        <p>At the end of the year, freelancers and business owners often need to compile payment records. With OrganizeShots, you can upload a year's worth of screenshots and instantly get all payment receipts in one folder — no manual sorting required.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Step by Step</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload all your screenshots to OrganizeShots</li>
          <li>The app scans each one using OCR — in your browser, privately</li>
          <li>All payment screenshots land in <strong>Payments / Receipts</strong></li>
          <li>Download the ZIP — your payment history is now organized and searchable</li>
        </ol>

        <p>No server. No account. No monthly fee. Just an organized folder of every payment you've ever screenshotted.</p>
      </div>
    ),
  },
  {
    id: "what-is-ocr-screenshot",
    title: "What Is OCR? How OrganizeShots Reads Your Screenshots",
    excerpt: "OCR lets apps read text inside images. Here's how OrganizeShots uses it to understand your screenshots — and why it all happens on your device.",
    date: "May 10, 2026",
    readTime: "3 min read",
    category: "How It Works",
    image: blogImg("blog-ocr.png"),
    gradient: "from-sky-500/20 to-blue-500/10",
    content: (
      <div className="flex flex-col gap-5 text-sm text-foreground leading-relaxed">
        <p>When you look at a screenshot, you can read the text in it. For a long time, computers couldn't do this — they could only see pixels, not words. <strong>OCR (Optical Character Recognition)</strong> changed that.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">What Is OCR?</h2>
        <p>OCR is the technology that converts images of text into actual readable text. It's the same tech used in:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Google Lens (when you point your camera at text)</li>
          <li>PDF scanners that let you search scanned documents</li>
          <li>Bank apps that read cheque details from a photo</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground mt-2">How OrganizeShots Uses OCR</h2>
        <p>When you upload a screenshot, OrganizeShots runs it through <strong>Tesseract.js</strong> — an open-source OCR engine compiled to WebAssembly that runs entirely inside your browser.</p>
        <p>The OCR extracts all readable text from the image. Then OrganizeShots checks that text against keyword rules for each category. If it finds "OTP" or "verification code", it goes to OTP / Security. If it finds "₹ paid", it goes to Payments.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">Why In-Browser OCR Matters for Privacy</h2>
        <p>Most OCR services work by sending your image to a server, processing it, and returning the text. That means your screenshots — including sensitive OTPs and payment receipts — travel over the internet to someone else's computer.</p>
        <p>OrganizeShots does OCR locally using WebAssembly. Your screenshots never leave your device. The OCR happens in the same browser tab, using your device's own CPU. No image is ever transmitted anywhere.</p>

        <h2 className="text-lg font-bold text-foreground mt-2">How Accurate Is It?</h2>
        <p>Very accurate for clean, high-resolution screenshots — which most phone screenshots are. The text is sharp, the contrast is good, and Tesseract handles it well. For very low-res or blurry screenshots, accuracy can be lower, but the filename-based rules still catch most common categories.</p>
      </div>
    ),
  },
];

// ─── Blog Card ────────────────────────────────────────────────────────────────

function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-full overflow-hidden" style={{ height: 160 }}>
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="px-4 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
        </div>
        <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{post.title}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-primary">Read article</span>
        <ChevronRight className="h-4 w-4 text-primary" />
      </div>
    </button>
  );
}

// ─── Full Article View ────────────────────────────────────────────────────────

function ArticleView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</span>
      </div>

      <article className="px-5 py-6 pb-28 max-w-2xl mx-auto w-full flex flex-col gap-5">
        {/* Hero */}
        <div className="w-full rounded-2xl overflow-hidden shadow-sm" style={{ height: 200 }}>
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-extrabold text-foreground leading-tight">{post.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed -mt-3">{post.excerpt}</p>

        {/* Body */}
        {post.content}

        {/* CTA */}
        <div className="rounded-2xl bg-primary px-5 py-6 text-center shadow-md mt-4">
          <p className="text-base font-extrabold text-primary-foreground mb-1">Try OrganizeShots Free</p>
          <p className="text-xs text-primary-foreground/80 mb-4">No sign-up. No install. Works on any device.</p>
          <button
            onClick={onBack}
            className="bg-primary-foreground text-primary font-bold text-sm px-6 py-2.5 rounded-xl shadow"
          >
            Organize My Screenshots →
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Blog Listing ─────────────────────────────────────────────────────────────

export default function Blog() {
  const [, navigate] = useLocation();
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);

  if (openPost) {
    return <ArticleView post={openPost} onBack={() => setOpenPost(null)} />;
  }

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <span className="text-base font-semibold text-foreground">Blog</span>
          <p className="text-[11px] text-muted-foreground">{posts.length} articles</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="px-4 py-5 pb-28 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {/* Featured */}
        <button
          onClick={() => setOpenPost(posts[0])}
          className="w-full text-left rounded-2xl border border-primary/30 bg-card overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <div className="w-full overflow-hidden relative" style={{ height: 200 }}>
            <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-primary backdrop-blur px-2 py-1 rounded-full shadow">Featured</span>
          </div>
          <div className="px-4 py-4 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{posts[0].category}</span>
            <h2 className="text-base font-extrabold text-foreground leading-snug">{posts[0].title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{posts[0].excerpt}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{posts[0].date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{posts[0].readTime}</span>
            </div>
          </div>
          <div className="px-4 pb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Read article</span>
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </button>

        {/* Rest of posts */}
        {posts.slice(1).map((post) => (
          <BlogCard key={post.id} post={post} onClick={() => setOpenPost(post)} />
        ))}
      </div>
    </div>
  );
}
