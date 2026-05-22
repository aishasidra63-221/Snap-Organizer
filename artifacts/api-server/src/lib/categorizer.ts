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

interface Rule {
  patterns: RegExp[];
  category: Category;
}

const FILENAME_RULES: Rule[] = [
  {
    patterns: [
      /otp/i, /passw(or)?d/i, /login/i, /authenticat/i,
      /2fa/i, /verif/i, /pin[-_]?code/i, /security[-_]?code/i, /one[-_]?time/i,
    ],
    category: "OTP / Security",
  },
  {
    patterns: [
      /invoice/i, /receipt/i, /payment/i, /order/i, /bill/i,
      /transact/i, /purchase/i, /paid/i, /checkout/i,
      /upi/i, /gpay/i, /paytm/i, /razorpay/i, /stripe/i, /bank/i,
    ],
    category: "Payments / Receipts",
  },
  {
    patterns: [
      /whatsapp/i, /wa[-_]?img/i, /img[-_]?\d{8}/i,
      /chat/i, /telegram/i, /signal/i, /messenger/i, /imessage/i, /sms/i,
    ],
    category: "WhatsApp / Chats",
  },
  {
    patterns: [
      /instagram/i, /insta/i, /tiktok/i, /facebook/i, /twitter/i,
      /reels?/i, /story/i, /stories/i, /fb[-_]/i, /ig[-_]/i, /tt[-_]/i,
      /snapchat/i, /reddit/i, /linkedin/i, /youtube/i,
    ],
    category: "Social Media",
  },
  {
    patterns: [
      /note/i, /study/i, /lecture/i, /class/i, /homework/i,
      /assignment/i, /exam/i, /quiz/i, /textbook/i, /formula/i,
      /diagram/i, /math/i, /notes?[-_]/i, /slide/i,
    ],
    category: "Study / Notes",
  },
  {
    patterns: [
      /meme/i, /funny/i, /lol/i, /joke/i, /humor/i, /dank/i, /entertainment/i,
    ],
    category: "Memes / Entertainment",
  },
  {
    patterns: [
      /document/i, /\.pdf/i, /scan/i, /aadhar/i, /aadhaar/i, /passport/i,
      /license/i, /certificate/i, /form[-_]/i, /important/i, /id[-_]?card/i,
    ],
    category: "Documents",
  },
  {
    patterns: [
      /^img_\d{8}_\d{6}/i, /^dsc_\d+/i, /^dcim/i, /^photo/i,
      /^pic(ture)?/i, /^img\d+/i, /^pxl_/i, /^cam_/i, /^dji_/i,
    ],
    category: "Photos",
  },
];

// OCR text rules — applied when filename gives no match
// Each entry: list of keywords (any match → that category)
const OCR_TEXT_RULES: { keywords: string[]; category: Category }[] = [
  {
    keywords: [
      "otp", "one-time password", "one time password", "verification code",
      "your code is", "enter the code", "security code", "login code",
      "authentication code", "2fa", "two-factor", "don't share this",
      "do not share", "valid for", "expires in",
    ],
    category: "OTP / Security",
  },
  {
    keywords: [
      "invoice", "receipt", "total amount", "amount paid", "order total",
      "payment successful", "transaction id", "transaction no", "txn id",
      "paid successfully", "₹", "upi id", "debited", "credited",
      "order id", "order #", "billing", "subtotal", "grand total",
      "payment confirmation", "bank statement", "account statement",
    ],
    category: "Payments / Receipts",
  },
  {
    keywords: [
      "message delivered", "last seen", "online", "typing...",
      "end-to-end encrypted", "read", "sent", "received",
      "voice message", "missed call", "video call", "attach", "emoji",
      "reply", "forwarded", "whatsapp", "telegram", "imessage",
    ],
    category: "WhatsApp / Chats",
  },
  {
    keywords: [
      "instagram", "tiktok", "facebook", "twitter", "reels",
      "followers", "following", "like", "share", "comment",
      "subscribe", "youtube", "reddit", "linkedin", "snapchat",
      "story", "post", "dm", "direct message",
    ],
    category: "Social Media",
  },
  {
    keywords: [
      "question", "answer", "definition", "chapter", "lecture", "notes",
      "assignment", "homework", "exam", "quiz", "test", "marks",
      "formula", "theorem", "equation", "textbook", "syllabus",
      "university", "college", "school", "class",
    ],
    category: "Study / Notes",
  },
  {
    keywords: [
      "name:", "father's name", "date of birth", "address:", "nationality",
      "aadhar", "aadhaar", "passport no", "license no", "pan card",
      "voter id", "certificate", "hereby certified", "signature", "seal",
      "government of india", "ministry", "issued by",
    ],
    category: "Documents",
  },
];

/** First-pass: filename-only classification. Returns null if no rule matches. */
export function categorizeByFilename(filename: string): Category | null {
  const name = filename.toLowerCase();
  for (const rule of FILENAME_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(name)) return rule.category;
    }
  }
  return null;
}

/** Second-pass: OCR text classification. */
export function categorizeByText(text: string): Category | null {
  const lower = text.toLowerCase();
  let bestCategory: Category | null = null;
  let bestScore = 0;

  for (const rule of OCR_TEXT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = rule.category;
    }
  }

  return bestScore >= 1 ? bestCategory : null;
}

/** Combined: filename → OCR text → fallback */
export function classify(filename: string, ocrText?: string): Category {
  const byName = categorizeByFilename(filename);
  if (byName) return byName;

  if (ocrText) {
    const byText = categorizeByText(ocrText);
    if (byText) return byText;
  }

  return "Unknown / Others";
}
