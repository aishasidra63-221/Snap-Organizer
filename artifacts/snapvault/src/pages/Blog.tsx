import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function img(name: string) {
  return `${BASE}/blog/${name}`;
}

export default function Blog() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-base font-semibold text-foreground">Blog</span>
      </div>

      {/* Article */}
      <article className="px-5 py-6 pb-28 max-w-2xl mx-auto w-full prose-custom">

        {/* Hero Image */}
        <img
          src={img("blog-hero.png")}
          alt="AI screenshot organizer app showing organized folders on a smartphone"
          className="w-full rounded-2xl object-cover mb-6 shadow-sm"
          style={{ aspectRatio: "16/9" }}
        />

        {/* H1 */}
        <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2">
          Stop Drowning in Screenshots — Let AI Organize Them for You
        </h1>
        <p className="text-xs text-muted-foreground mb-6">May 28, 2026 · 5 min read</p>

        {/* Intro */}
        <p className="text-sm text-foreground leading-relaxed mb-4">
          Your phone gallery has hundreds of screenshots. Payment receipts. OTP codes. WhatsApp conversations. Random memes. And you can never find the one you actually need.
        </p>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          That's exactly the problem <strong>SnapVault</strong> solves. It's a free, browser-based <strong>AI screenshot organizer</strong> that reads your screenshots, understands what's inside them, and sorts everything into neat folders — automatically.
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          Why Your Screenshot Folder Is Always a Mess
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          Most people take screenshots impulsively. You screenshot a UPI payment. Then a meme. Then someone's address. Then an OTP you'll need in 30 seconds. Your gallery doesn't care — it just dumps everything in one place, sorted by time.
        </p>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          Manual sorting feels like homework. Nobody does it. So the mess grows. Until you have 2,000 screenshots and no idea where anything is.
        </p>

        {/* OCR Image */}
        <img
          src={img("blog-ocr.png")}
          alt="OCR scanning a screenshot to detect text and categorize it automatically"
          className="w-full rounded-2xl object-cover mb-4 shadow-sm"
          style={{ aspectRatio: "16/9" }}
        />
        <p className="text-xs text-center text-muted-foreground mb-6 italic">
          SnapVault reads the text inside each screenshot using OCR — so it knows what it's looking at.
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          What Is OCR Screenshot Detection?
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          OCR stands for <strong>Optical Character Recognition</strong>. In simple terms, it means the app can read the text inside your images — just like you would.
        </p>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          When you upload a screenshot to SnapVault, it scans the image for words like "OTP", "₹", "transaction successful", "Instagram", or "delivered". Based on what it finds, it decides which folder the screenshot belongs in.
        </p>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          No AI model in the cloud. No sending your images to a server. Everything runs inside your browser, right on your device. That's the beauty of <strong>OCR screenshot detection</strong> done the privacy-friendly way.
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          Smart Screenshot Categories — What Gets Sorted Where?
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-5">
          SnapVault's <strong>automatic screenshot sorting</strong> uses smart keyword rules to place every image into the right folder. Here's what the smart folders look like:
        </p>

        {/* H3 — OTP */}
        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          🔐 OTP / Security Screenshots
        </h3>
        <img
          src={img("blog-otp.png")}
          alt="OTP login code screenshot being automatically detected and sorted"
          className="w-full rounded-2xl object-cover mb-3 shadow-sm"
          style={{ aspectRatio: "4/3" }}
        />
        <p className="text-sm text-foreground leading-relaxed mb-5">
          That screenshot of a 6-digit OTP or bank login code? It goes straight into <strong>OTP / Security</strong>. No more scrolling through 200 images trying to find a code you took last Tuesday.
        </p>

        {/* H3 — Payments */}
        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          💳 Payment & Receipt Screenshots
        </h3>
        <img
          src={img("blog-payments.png")}
          alt="Payment receipt screenshot automatically moved to Payments folder"
          className="w-full rounded-2xl object-cover mb-3 shadow-sm"
          style={{ aspectRatio: "4/3" }}
        />
        <p className="text-sm text-foreground leading-relaxed mb-5">
          UPI confirmations, bank transfer receipts, GPay screenshots, online shopping bills — all of these land in <strong>Payments / Receipts</strong>. Perfect for when you need to prove a payment or file taxes.
        </p>

        {/* H3 — WhatsApp */}
        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          💬 WhatsApp & Chat Screenshots
        </h3>
        <img
          src={img("blog-whatsapp.png")}
          alt="WhatsApp chat screenshot sorted into a dedicated chat folder automatically"
          className="w-full rounded-2xl object-cover mb-3 shadow-sm"
          style={{ aspectRatio: "4/3" }}
        />
        <p className="text-sm text-foreground leading-relaxed mb-5">
          Screenshots of WhatsApp conversations, message threads, or group chats are grouped into <strong>WhatsApp / Chats</strong>. Whether it's a delivery update or a voice note screenshot, it's all in one place.
        </p>

        {/* H3 — Social */}
        <h3 className="text-base font-bold text-foreground mb-2">📱 Social Media Screenshots</h3>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          Instagram posts, Twitter threads, TikTok comments, YouTube thumbnails — anything that looks like social media content gets filed under <strong>Social Media</strong>. No more hunting for that viral tweet you saved last month.
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          How SnapVault Organizes Screenshots Automatically
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          Using SnapVault as your <strong>smart screenshot manager</strong> takes about 30 seconds:
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-foreground">
          <li className="leading-relaxed"><strong>Upload</strong> — Drag and drop up to 100 screenshots at once. PNG, JPG, WebP, HEIC all work.</li>
          <li className="leading-relaxed"><strong>Auto-process</strong> — SnapVault reads filenames, scans for QR codes, then runs OCR. All on your device.</li>
          <li className="leading-relaxed"><strong>Fix mistakes</strong> — If any screenshot lands in the wrong folder, tap the folder icon and move it in one tap.</li>
          <li className="leading-relaxed"><strong>Download</strong> — Hit Download ZIP and get all your screenshots sorted into labelled folders inside a single file.</li>
        </ol>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          That's it. No account. No subscription. No app install. Just open the website and go.
        </p>

        {/* Organized Image */}
        <img
          src={img("blog-organized.png")}
          alt="Neatly organized screenshot folders sorted by category on a laptop screen"
          className="w-full rounded-2xl object-cover mb-4 shadow-sm"
          style={{ aspectRatio: "16/9" }}
        />
        <p className="text-xs text-center text-muted-foreground mb-6 italic">
          The final result — every screenshot in its own labelled folder, ready to download.
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          100% Private — Your Screenshots Stay on Your Device
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          This is the part most people don't expect. SnapVault never uploads your screenshots anywhere. There is no server receiving your files. No cloud storage. No account required.
        </p>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          The <strong>AI gallery organizer</strong> runs entirely inside your web browser using browser-native APIs. Your images exist only in your device's memory while the tab is open — and they're gone the moment you close it (which is why you should always download the ZIP first).
        </p>

        {/* H2 */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
          Who Is SnapVault For?
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          SnapVault is built for anyone who takes a lot of screenshots and hates the chaos. But it's especially useful for:
        </p>
        <ul className="list-disc list-inside space-y-1.5 mb-6 text-sm text-foreground">
          <li className="leading-relaxed">Students saving lecture notes and exam results</li>
          <li className="leading-relaxed">Freelancers keeping payment proofs organized</li>
          <li className="leading-relaxed">Anyone who screenshots OTPs and forgets where they saved them</li>
          <li className="leading-relaxed">People who want to <strong>organize screenshots automatically</strong> without learning any software</li>
          <li className="leading-relaxed">Privacy-conscious users who don't want their screenshots in the cloud</li>
        </ul>

        {/* CTA */}
        <div className="rounded-2xl bg-primary px-5 py-6 text-center mb-8 shadow-md">
          <p className="text-lg font-extrabold text-primary-foreground mb-1">Try SnapVault Free — Right Now</p>
          <p className="text-sm text-primary-foreground/80 mb-4">No sign-up. No install. Works on any device with a browser.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-foreground text-primary font-bold text-sm px-6 py-2.5 rounded-xl shadow"
          >
            Organize My Screenshots →
          </button>
        </div>

        {/* FAQs */}
        <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Frequently Asked Questions</h2>

        {[
          {
            q: "Is SnapVault really free?",
            a: "Yes, completely free. No subscription, no sign-up, no hidden fees. Just open the website and start organizing."
          },
          {
            q: "Does SnapVault upload my screenshots to a server?",
            a: "Never. All processing — OCR, categorisation, ZIP creation — happens inside your browser. Your screenshots don't leave your device."
          },
          {
            q: "How accurate is the automatic screenshot sorting?",
            a: "Very accurate for common categories like OTP, payments, and WhatsApp. It uses keyword rules, not AI guessing — so results are consistent. For edge cases, you can manually move any screenshot in one tap."
          },
          {
            q: "What file formats does SnapVault support?",
            a: "PNG, JPG, JPEG, WebP, and HEIC. You can upload up to 100 files at once."
          },
          {
            q: "What happens if I close the browser tab?",
            a: "Everything is cleared from memory — that's what makes it private. Always download your ZIP before closing the tab."
          },
          {
            q: "Can I use SnapVault on my phone?",
            a: "Yes. SnapVault is a mobile-first web app. It works on Android, iPhone, and any desktop browser without installing anything."
          },
        ].map(({ q, a }) => (
          <div key={q} className="mb-5">
            <h3 className="text-sm font-bold text-foreground mb-1">{q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
          </div>
        ))}

        {/* Conclusion */}
        <div className="border-t border-border pt-6 mt-6">
          <p className="text-sm text-foreground leading-relaxed mb-4">
            Screenshot clutter is a small problem that compounds fast. The longer you ignore it, the harder it gets to find what you need. An <strong>AI screenshot organizer</strong> like SnapVault solves it in one click — no effort, no cloud, no cost.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Give it a try. Upload your screenshots, watch the folders fill up automatically, and download a perfectly organized ZIP. It takes less than a minute.
          </p>
        </div>

      </article>
    </div>
  );
}
