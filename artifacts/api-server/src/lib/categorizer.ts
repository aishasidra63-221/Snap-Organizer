export type Category =
  | "OTP / Security"
  | "Payments / Receipts"
  | "WhatsApp / Chats"
  | "Social Media"
  | "Study / Notes"
  | "Photos"
  | "Memes / Entertainment"
  | "Documents"
  | "Unknown / Others"
  | "Duplicates";

export const ALL_CATEGORIES: Category[] = [
  "OTP / Security",
  "Payments / Receipts",
  "WhatsApp / Chats",
  "Social Media",
  "Study / Notes",
  "Photos",
  "Memes / Entertainment",
  "Documents",
  "Unknown / Others",
  "Duplicates",
];

// ─── Filename rules ──────────────────────────────────────────────────────────
// NOTE: Only strong, specific patterns here. "password" alone is NOT enough for OTP.
// Each rule returns a category if ANY pattern matches. Order matters — first match wins.

interface FilenameRule {
  patterns: RegExp[];
  category: Category;
}

const FILENAME_RULES: FilenameRule[] = [
  // OTP — must be very specific, not just "password"
  {
    patterns: [
      /\botp\b/i,
      /one[-_]?time[-_]?pass/i,
      /verif[-_]?code/i,
      /auth[-_]?code/i,
      /2fa[-_]?code/i,
      /security[-_]?code/i,
      /pin[-_]?code/i,
    ],
    category: "OTP / Security",
  },

  // Payments
  {
    patterns: [
      /invoice/i, /receipt/i, /payment/i, /\bbill\b/i,
      /transact/i, /purchase/i, /\bpaid\b/i, /checkout/i,
      /gpay/i, /paytm/i, /razorpay/i, /phonepe/i,
      /upi[-_]?ref/i, /\btxn\b/i, /bank[-_]?slip/i,
    ],
    category: "Payments / Receipts",
  },

  // WhatsApp & messaging apps (by filename conventions)
  {
    patterns: [
      /whatsapp/i,
      /^wa[-_]/i,
      /^img[-_]\d{8}[-_]\d+\.(jpg|jpeg|png|webp)$/i, // WhatsApp default naming
      /telegram/i,
      /signal[-_]?(img|media)/i,
      /^messenger/i,
    ],
    category: "WhatsApp / Chats",
  },

  // Social Media apps — very specific app names in filename
  {
    patterns: [
      /instagram/i, /tiktok/i, /\bfacebook\b/i, /\bfb[-_]/i,
      /twitter/i, /\byt[-_]?dl\b/i, /snapchat/i,
      /reddit/i, /linkedin/i, /\byoutube\b/i,
      /\bpinterest\b/i, /\bbereal\b/i,
    ],
    category: "Social Media",
  },

  // Study / Notes
  {
    patterns: [
      /\bnotes?\b/i, /\bstudy\b/i, /\blecture\b/i,
      /\bhomework\b/i, /\bassignment\b/i,
      /\bexam\b/i, /\bquiz\b/i, /\bsyllabus\b/i,
    ],
    category: "Study / Notes",
  },

  // Memes
  {
    patterns: [/\bmeme\b/i, /\bfunny\b/i, /\bdank\b/i, /\bjoke\b/i],
    category: "Memes / Entertainment",
  },

  // Documents / IDs
  {
    patterns: [
      /aadhar/i, /aadhaar/i, /passport/i,
      /\bpan[-_]?card\b/i, /voter[-_]?id/i,
      /\bcertificate\b/i, /\bdocument\b/i, /\bscan\b/i,
    ],
    category: "Documents",
  },

  // Camera photos (generic device naming)
  {
    patterns: [
      /^img_\d{8}_\d{6}/i, /^dsc[f]?_?\d+/i,
      /^pxl_\d{8}/i, /^cam\d+/i, /^dji_\d+/i,
      /^photo_\d{4}-\d{2}-\d{2}/i,
    ],
    category: "Photos",
  },
];

// ─── OCR weighted scoring rules ───────────────────────────────────────────────
// weight: 3 = very strong signal (alone is enough if threshold met)
//         2 = strong signal
//         1 = supporting signal (needs multiple hits)
// minScore: minimum total weight needed to classify

interface OcrKeyword {
  text: string;
  weight: 3 | 2 | 1;
}

interface OcrRule {
  category: Category;
  minScore: number;   // minimum total weight to classify
  keywords: OcrKeyword[];
}

const OCR_RULES: OcrRule[] = [
  // ── OTP / Security ──────────────────────────────────────────────────────────
  // STRICT: must see very specific OTP language. "password" alone = 0 score here.
  {
    category: "OTP / Security",
    minScore: 3,
    keywords: [
      { text: "your otp",                weight: 3 },
      { text: "your otp is",             weight: 3 },
      { text: "otp is",                  weight: 3 },
      { text: "otp:",                    weight: 3 },
      { text: "one-time password",       weight: 3 },
      { text: "one time password",       weight: 3 },
      { text: "one time passcode",       weight: 3 },
      { text: "verification code is",    weight: 3 },
      { text: "your code is",            weight: 3 },
      { text: "your verification code",  weight: 3 },
      { text: "two-factor authentication", weight: 3 },
      { text: "2fa code",                weight: 3 },
      { text: "authentication code",     weight: 3 },
      { text: "do not share this code",  weight: 3 },
      { text: "do not share this otp",   weight: 3 },
      { text: "don't share this otp",    weight: 3 },
      { text: "valid for",               weight: 1 },  // supporting only
      { text: "expires in",              weight: 1 },  // supporting only
      { text: "security code",           weight: 2 },
      { text: "login code",              weight: 2 },
      { text: "sign-in code",            weight: 2 },
      { text: "enter the otp",           weight: 3 },
      { text: "enter otp",               weight: 3 },
    ],
  },

  // ── Payments / Receipts ──────────────────────────────────────────────────────
  {
    category: "Payments / Receipts",
    minScore: 3,
    keywords: [
      { text: "payment successful",      weight: 3 },
      { text: "payment confirmed",       weight: 3 },
      { text: "amount paid",             weight: 3 },
      { text: "amount debited",          weight: 3 },
      { text: "amount credited",         weight: 3 },
      { text: "₹",                       weight: 2 },
      { text: "rs.",                     weight: 1 },
      { text: "inr",                     weight: 1 },
      { text: "transaction id",          weight: 3 },
      { text: "transaction no",          weight: 3 },
      { text: "txn id",                  weight: 3 },
      { text: "txn no",                  weight: 2 },
      { text: "utr no",                  weight: 3 },
      { text: "upi ref",                 weight: 3 },
      { text: "upi id",                  weight: 2 },
      { text: "order id",                weight: 2 },
      { text: "order #",                 weight: 2 },
      { text: "invoice no",              weight: 3 },
      { text: "invoice #",               weight: 3 },
      { text: "invoice date",            weight: 2 },
      { text: "paid successfully",       weight: 3 },
      { text: "payment receipt",         weight: 3 },
      { text: "bank statement",          weight: 3 },
      { text: "account statement",       weight: 3 },
      { text: "total amount",            weight: 2 },
      { text: "grand total",             weight: 2 },
      { text: "subtotal",                weight: 1 },
      { text: "amount:",                 weight: 1 },
      { text: "debited from",            weight: 3 },
      { text: "credited to",             weight: 3 },
      { text: "to account",              weight: 1 },
      { text: "from account",            weight: 1 },
      { text: "phonepe",                 weight: 2 },
      { text: "gpay",                    weight: 2 },
      { text: "google pay",              weight: 2 },
      { text: "paytm",                   weight: 2 },
      { text: "razorpay",                weight: 2 },
      { text: "amazon pay",              weight: 2 },
      { text: "payu",                    weight: 2 },
      { text: "billing address",         weight: 2 },
      { text: "standard request",        weight: 1 },  // seen on Fiverr/freelance
      { text: "$",                       weight: 1 },
      { text: "usd",                     weight: 1 },
      { text: "total:",                  weight: 1 },
      { text: "receipt",                 weight: 2 },
      { text: "invoice",                 weight: 2 },
      { text: "tax invoice",             weight: 3 },
    ],
  },

  // ── WhatsApp / Chats ─────────────────────────────────────────────────────────
  {
    category: "WhatsApp / Chats",
    minScore: 3,
    keywords: [
      // WhatsApp specific
      { text: "whatsapp",                weight: 3 },
      { text: "end-to-end encrypted",    weight: 3 },
      { text: "end to end encrypted",    weight: 3 },
      { text: "messages are end-to-end", weight: 3 },
      // Chat bubbles & status
      { text: "message delivered",       weight: 3 },
      { text: "messages delivered",      weight: 3 },
      { text: "last seen",               weight: 2 },
      { text: "last seen today",         weight: 3 },
      { text: "last seen yesterday",     weight: 3 },
      { text: "typing...",               weight: 2 },
      { text: "online",                  weight: 1 },
      { text: "read receipts",           weight: 2 },
      // Telegram
      { text: "telegram",                weight: 3 },
      { text: "t.me/",                   weight: 3 },
      // iMessage/SMS
      { text: "imessage",                weight: 3 },
      { text: "send with sms instead",   weight: 3 },
      // Chat actions
      { text: "voice message",           weight: 2 },
      { text: "missed call",             weight: 2 },
      { text: "missed video call",       weight: 2 },
      { text: "forwarded",               weight: 1 },
      { text: "replied to",              weight: 1 },
      // Messenger / other apps
      { text: "facebook messenger",      weight: 3 },
      { text: "messenger",               weight: 1 },
      { text: "signal",                  weight: 1 },
    ],
  },

  // ── Social Media ─────────────────────────────────────────────────────────────
  {
    category: "Social Media",
    minScore: 3,
    keywords: [
      // TikTok — very specific UI
      { text: "tiktok",                  weight: 3 },
      { text: "for you",                 weight: 2 },  // TikTok FYP tab
      { text: "#fyp",                    weight: 3 },
      { text: "#foryou",                 weight: 3 },
      { text: "following\nfor you",      weight: 3 },
      { text: "creator marketplace",     weight: 3 },
      // Instagram
      { text: "instagram",               weight: 3 },
      { text: "reels",                   weight: 2 },
      { text: "explore",                 weight: 1 },
      { text: "new post",                weight: 1 },
      { text: "story",                   weight: 1 },
      { text: "close friends",           weight: 2 },
      { text: "suggested for you",       weight: 2 },
      // Twitter/X
      { text: "twitter",                 weight: 3 },
      { text: "tweet",                   weight: 2 },
      { text: "retweet",                 weight: 3 },
      { text: "quoted tweet",            weight: 3 },
      { text: "trending",                weight: 1 },
      // YouTube
      { text: "youtube",                 weight: 3 },
      { text: "subscribe",               weight: 2 },
      { text: "subscribers",             weight: 2 },
      { text: "views",                   weight: 1 },
      // Facebook
      { text: "facebook",                weight: 3 },
      { text: "timeline",                weight: 1 },
      { text: "news feed",               weight: 2 },
      // Snapchat
      { text: "snapchat",                weight: 3 },
      { text: "snap score",              weight: 3 },
      // Reddit
      { text: "reddit",                  weight: 3 },
      { text: "subreddit",               weight: 3 },
      { text: "upvote",                  weight: 2 },
      // General social signals (need multiple)
      { text: "followers",               weight: 2 },
      { text: "following",               weight: 1 },
      { text: "likes",                   weight: 1 },
      { text: "comments",                weight: 1 },
      { text: "shares",                  weight: 1 },
      { text: "profile",                 weight: 1 },
      { text: "dm",                      weight: 1 },
      { text: "direct message",          weight: 2 },
      { text: "linkedin",                weight: 3 },
      { text: "connections",             weight: 1 },
      { text: "pinterest",               weight: 3 },
      { text: "bereal",                  weight: 3 },
    ],
  },

  // ── Study / Notes ─────────────────────────────────────────────────────────────
  {
    category: "Study / Notes",
    minScore: 3,
    keywords: [
      // Strong academic signals
      { text: "marks:",                  weight: 2 },
      { text: "marks obtained",          weight: 3 },
      { text: "maximum marks",           weight: 3 },
      { text: "roll no",                 weight: 2 },
      { text: "roll number",             weight: 2 },
      { text: "exam:",                   weight: 2 },
      { text: "examination",             weight: 2 },
      { text: "question paper",          weight: 3 },
      { text: "answer key",              weight: 3 },
      { text: "solution:",               weight: 1 },
      { text: "theorem",                 weight: 2 },
      { text: "equation",                weight: 2 },
      { text: "formula",                 weight: 2 },
      { text: "chapter",                 weight: 2 },
      { text: "chapter ",                weight: 2 },
      { text: "lecture",                 weight: 2 },
      { text: "syllabus",                weight: 2 },
      { text: "homework",                weight: 3 },
      { text: "assignment",              weight: 2 },
      { text: "quiz",                    weight: 2 },
      { text: "mcq",                     weight: 2 },
      { text: "multiple choice",         weight: 2 },
      { text: "textbook",                weight: 2 },
      { text: "definition:",             weight: 2 },
      { text: "class notes",             weight: 3 },
      { text: "lecture notes",           weight: 3 },
      { text: "study material",          weight: 3 },
      { text: "ncert",                   weight: 3 },
      { text: "cbse",                    weight: 3 },
      { text: "icse",                    weight: 3 },
      { text: "gate exam",               weight: 3 },
      { text: "jee",                     weight: 2 },
      { text: "neet",                    weight: 2 },
      { text: "upsc",                    weight: 2 },
      { text: "summary:",                weight: 1 },
      { text: "key points",              weight: 1 },
      { text: "important:",              weight: 1 },
    ],
  },

  // ── Documents / IDs ───────────────────────────────────────────────────────────
  {
    category: "Documents",
    minScore: 3,
    keywords: [
      // Indian IDs
      { text: "aadhaar",                 weight: 3 },
      { text: "aadhar",                  weight: 3 },
      { text: "unique identification",   weight: 3 },
      { text: "uidai",                   weight: 3 },
      { text: "pan card",                weight: 3 },
      { text: "permanent account number", weight: 3 },
      { text: "voter id",                weight: 3 },
      { text: "epic no",                 weight: 3 },
      // Travel docs
      { text: "passport no",             weight: 3 },
      { text: "passport number",         weight: 3 },
      { text: "visa",                    weight: 2 },
      { text: "driving licence",         weight: 3 },
      { text: "driving license",         weight: 3 },
      // Certificates
      { text: "hereby certified",        weight: 3 },
      { text: "is hereby",               weight: 2 },
      { text: "certificate of",          weight: 3 },
      { text: "this is to certify",      weight: 3 },
      { text: "authorized signatory",    weight: 3 },
      { text: "government of india",     weight: 3 },
      { text: "ministry of",             weight: 2 },
      { text: "date of birth:",          weight: 2 },
      { text: "father's name:",          weight: 2 },
      { text: "mother's name:",          weight: 2 },
      { text: "nationality:",            weight: 2 },
      { text: "place of birth:",         weight: 2 },
      { text: "issued by:",              weight: 2 },
      { text: "seal",                    weight: 1 },
      { text: "signature",               weight: 1 },
    ],
  },

  // ── Memes / Entertainment ─────────────────────────────────────────────────────
  {
    category: "Memes / Entertainment",
    minScore: 3,
    keywords: [
      { text: "when you",                weight: 2 },
      { text: "me when",                 weight: 2 },
      { text: "nobody:",                 weight: 2 },
      { text: "literally nobody:",       weight: 3 },
      { text: "me:",                     weight: 1 },
      { text: "pov:",                    weight: 2 },
      { text: "drake meme",              weight: 3 },
      { text: "expectation vs reality",  weight: 3 },
      { text: "this is fine",            weight: 2 },
    ],
  },
];

// ─── Filename classifier ──────────────────────────────────────────────────────
/** Returns category if filename pattern matches, else null. */
export function categorizeByFilename(filename: string): Category | null {
  const name = filename.toLowerCase();
  for (const rule of FILENAME_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(name)) return rule.category;
    }
  }
  return null;
}

// ─── OCR text classifier ──────────────────────────────────────────────────────
/** Weighted scoring across all categories. Returns best match above threshold, else null. */
export function categorizeByText(rawText: string): Category | null {
  const text = rawText.toLowerCase();

  const scores: { category: Category; score: number }[] = [];

  for (const rule of OCR_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.text)) {
        score += kw.weight;
      }
    }
    if (score >= rule.minScore) {
      scores.push({ category: rule.category, score });
    }
  }

  if (!scores.length) return null;

  // Return the category with the highest score
  scores.sort((a, b) => b.score - a.score);
  return scores[0].category;
}

/** Combined pipeline: filename → OCR text → Photos fallback → Unknown */
export function classify(filename: string, ocrText?: string): Category {
  const byName = categorizeByFilename(filename);
  if (byName) return byName;

  if (ocrText?.trim()) {
    const byText = categorizeByText(ocrText);
    if (byText) return byText;
  }

  return "Unknown / Others";
}
