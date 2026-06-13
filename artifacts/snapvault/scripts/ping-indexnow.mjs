const KEY = "18e884a177c74a70b4d8e429a42c9d43";
const HOST = "www.organizeshots.com";
const SITEMAP = `https://${HOST}/sitemap.xml`;

const URLS = [
  "https://www.organizeshots.com/",
  "https://www.organizeshots.com/blog",
  "https://www.organizeshots.com/blog/screenshot-organizer-free-browser-tool",
  "https://www.organizeshots.com/blog/save-whatsapp-screenshots-organized",
  "https://www.organizeshots.com/blog/free-up-phone-storage-delete-duplicate-screenshots",
  "https://www.organizeshots.com/blog/organize-screenshots-automatically",
  "https://www.organizeshots.com/blog/best-screenshot-manager-android-iphone",
  "https://www.organizeshots.com/blog/how-to-delete-duplicate-screenshots",
  "https://www.organizeshots.com/blog/otp-screenshot-organizer",
  "https://www.organizeshots.com/blog/organize-payment-receipt-screenshots",
  "https://www.organizeshots.com/blog/what-is-ocr-screenshot",
  "https://www.organizeshots.com/blog/screenshot-organization-android",
  "https://www.organizeshots.com/blog/screenshot-organization-ios",
  "https://www.organizeshots.com/blog/free-screenshot-manager-online",
];

// ── 1. IndexNow ping (Bing, Yandex, Seznam) ──────────────────────────────────
async function pingIndexNow() {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: URLS,
  };

  console.log(`\n📡 IndexNow — pinging ${URLS.length} URLs to Bing/Yandex/Seznam...`);

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`✅ IndexNow ping successful (HTTP ${res.status})`);
    URLS.forEach((u) => console.log(`   → ${u}`));
  } else {
    const text = await res.text().catch(() => "");
    console.error(`❌ IndexNow ping failed: HTTP ${res.status} — ${text}`);
    process.exit(1);
  }
}

// ── 2. Google sitemap ping ────────────────────────────────────────────────────
async function pingGoogle() {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`;

  console.log(`\n🔍 Google — pinging sitemap...`);
  console.log(`   → ${SITEMAP}`);

  const res = await fetch(pingUrl, { method: "GET" });

  if (res.ok) {
    console.log(`✅ Google sitemap ping successful (HTTP ${res.status})`);
  } else {
    // Google sometimes returns non-200 even on success — log but don't fail
    console.warn(`⚠️  Google sitemap ping returned HTTP ${res.status} (may still be accepted)`);
  }
}

// ── Run both ──────────────────────────────────────────────────────────────────
async function run() {
  console.log("🚀 Post-build search engine pings starting...\n");

  await pingIndexNow();
  await pingGoogle();

  console.log("\n✅ All pings complete. Google and IndexNow have been notified.");
}

run();
