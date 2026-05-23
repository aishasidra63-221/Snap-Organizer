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

// ─────────────────────────────────────────────────────────────────────────────
// FILENAME RULES
// First-pass: match by filename. Order matters — first match wins.
// Keep patterns SPECIFIC. Avoid single common words.
// ─────────────────────────────────────────────────────────────────────────────
interface FilenameRule { patterns: RegExp[]; category: Category; }

const FILENAME_RULES: FilenameRule[] = [
  // OTP — very specific only
  {
    patterns: [
      /\botp\b/i, /one[-_]?time[-_]?pass/i, /verif[-_]?code/i,
      /auth[-_]?code/i, /2fa[-_]?code/i, /security[-_]?code/i, /pin[-_]?code/i,
    ],
    category: "OTP / Security",
  },
  // Payments
  {
    patterns: [
      /invoice/i, /receipt/i, /payment/i, /\bbill\b/i, /transact/i,
      /purchase/i, /\bpaid\b/i, /checkout/i, /gpay/i, /paytm/i,
      /razorpay/i, /phonepe/i, /upi[-_]?ref/i, /\btxn\b/i, /bank[-_]?slip/i,
      /flipkart[-_]?order/i, /amazon[-_]?order/i, /swiggy[-_]?order/i,
      // Pakistani payment apps
      /easypaisa/i, /jazzcash/i, /jazz[-_]?cash/i, /easy[-_]?paisa/i,
      /\bnayapay\b/i, /\bsadapay\b/i, /\bmeezan\b/i, /\bhbl\b/i,
      // Global wallets (filename)
      /venmo/i, /cashapp/i, /\bzelle\b/i, /revolut/i, /\bwise\b/i,
      /\bmonzo\b/i, /klarna/i, /afterpay/i, /\bpaypal\b/i,
      /mpesa/i, /m[-_]?pesa/i, /mtn[-_]?momo/i, /airtel[-_]?money/i,
      /gcash/i, /grabpay/i, /bkash/i, /\bnagad\b/i,
      /alipay/i, /wechat[-_]?pay/i, /kakaopay/i, /paypay/i,
      /mercado[-_]?pago/i, /nubank/i,
      /stc[-_]?pay/i, /\bfawry\b/i,
      /binance/i, /coinbase/i,
    ],
    category: "Payments / Receipts",
  },
  // WhatsApp & messaging
  {
    patterns: [
      /whatsapp/i, /^wa[-_]/i,
      /^img[-_]\d{8}[-_]\d+\.(jpg|jpeg|png|webp)$/i,
      /telegram/i, /signal[-_]?(img|media)/i, /^messenger/i,
    ],
    category: "WhatsApp / Chats",
  },
  // Social media
  {
    patterns: [
      /instagram/i, /tiktok/i, /\bfacebook\b/i, /\bfb[-_]/i,
      /twitter/i, /\byt[-_]?dl\b/i, /snapchat/i, /reddit/i,
      /linkedin/i, /\byoutube\b/i, /\bpinterest\b/i, /\bbereal\b/i,
      /sharechat/i, /\bmoj\b/i, /\bjosh\b/i, /chingari/i, /roposo/i,
    ],
    category: "Social Media",
  },
  // Study
  {
    patterns: [
      /\bnotes?\b/i, /\bstudy\b/i, /\blecture\b/i, /\bhomework\b/i,
      /\bassignment\b/i, /\bexam\b/i, /\bquiz\b/i, /\bsyllabus\b/i,
      /\bmarksheet\b/i, /\badmit[-_]?card\b/i,
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
      /aadhar/i, /aadhaar/i, /passport/i, /\bpan[-_]?card\b/i,
      /voter[-_]?id/i, /\bcertificate\b/i, /\bdocument\b/i, /\bscan\b/i,
      /insurance[-_]?policy/i, /marksheet/i,
    ],
    category: "Documents",
  },
  // Camera photos
  {
    patterns: [
      /^img_\d{8}_\d{6}/i, /^dsc[f]?_?\d+/i, /^pxl_\d{8}/i,
      /^cam\d+/i, /^dji_\d+/i, /^photo_\d{4}-\d{2}-\d{2}/i,
    ],
    category: "Photos",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OCR WEIGHTED SCORING RULES
//
// weight 3 = very strong signal — alone meets threshold
// weight 2 = strong signal — needs 1–2 more supporting words
// weight 1 = supporting signal — needs several to hit threshold
//
// minScore = minimum total weight to classify into this category
// ─────────────────────────────────────────────────────────────────────────────
// Each keyword can be a plain string (exact substring) OR a regex pattern.
interface OcrKeyword { text: string; pattern?: RegExp; weight: 3 | 2 | 1; }
interface OcrRule { category: Category; minScore: number; keywords: OcrKeyword[]; }

const OCR_RULES: OcrRule[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. OTP / SECURITY
  // minScore=3: any single weight-3 keyword instantly triggers this folder.
  // weight-2 keywords only help when combined with other signals.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "OTP / Security",
    minScore: 3,
    keywords: [

      // ── OTP ──────────────────────────────────────────────────────────────
      { text: "your otp is",                    weight: 3 },
      { text: "your otp",                       weight: 3 },
      { text: "otp is",                         weight: 3 },
      { text: "otp:",                           weight: 3 },
      { text: "enter otp",                      weight: 3 },
      { text: "resend otp",                     weight: 3 },
      { text: "otp expires",                    weight: 3 },
      { text: "one-time password",              weight: 3 },
      { text: "one time password",              weight: 3 },
      { text: "one time passcode",              weight: 3 },

      // ── Verification Codes ───────────────────────────────────────────────
      { text: "your verification code",         weight: 3 },
      { text: "verification code is",           weight: 3 },
      { text: "your code is",                   weight: 3 },
      { text: "6-digit code",                   weight: 3 },
      { text: "4-digit code",                   weight: 3 },
      { text: "enter the 6-digit",              weight: 3 },
      { text: "we sent a code to",              weight: 3 },
      { text: "sent you a code",                weight: 3 },
      { text: "this code expires",              weight: 3 },
      { text: "code is valid for",              weight: 3 },
      { text: "confirmation code",              weight: 3 },
      { text: "verification pin",               weight: 3 },
      { text: "your login code",                weight: 3 },
      { text: "sign-in code is",                weight: 3 },
      { text: "your activation code",           weight: 3 },
      { text: "your pin is",                    weight: 3 },
      { text: "sms verification",               weight: 3 },
      { text: "verification code via sms",      weight: 3 },

      // ── 2FA ─────────────────────────────────────────────────────────────
      { text: "two-factor authentication",      weight: 3 },
      { text: "two factor authentication",      weight: 3 },
      { text: "2fa code",                       weight: 3 },
      { text: "authentication code",            weight: 3 },
      { text: "two-step verification",          weight: 3 },
      { text: "2-step verification",            weight: 3 },
      { text: "authenticator app",              weight: 3 },
      { text: "google authenticator",           weight: 3 },
      { text: "microsoft authenticator",        weight: 3 },
      { text: "authy",                          weight: 3 },
      { text: "duo security",                   weight: 3 },
      { text: "untrusted device",               weight: 3 },
      { text: "manage trusted devices",         weight: 3 },
      { text: "totp",                           weight: 3 },
      { text: "time-based",                     weight: 3 },
      { text: "backup code",                    weight: 3 },
      { text: "recovery code",                  weight: 3 },
      { text: "save your backup codes",         weight: 3 },

      // ── Password Reset ───────────────────────────────────────────────────
      { text: "forgot password",   pattern: /forgot\s+(your\s+)?password/,                  weight: 3 },
      { text: "reset password",    pattern: /reset\s+(your\s+)?(the\s+)?password/,          weight: 3 },
      { text: "password reset",    pattern: /password\s+reset/,                             weight: 3 },
      { text: "create new password", pattern: /create\s+(a\s+)?(new\s+)?password/,         weight: 3 },
      { text: "set new password",  pattern: /set\s+(your\s+)?(a\s+)?(new\s+)?password/,    weight: 3 },
      { text: "change password",   pattern: /change\s+(your\s+)?password/,                  weight: 3 },
      { text: "update password",   pattern: /update\s+(your\s+)?password/,                  weight: 3 },
      { text: "password has been reset", pattern: /password\s+(has\s+been|was)\s+reset/,   weight: 3 },
      { text: "password changed",  pattern: /password\s+(has\s+been\s+|was\s+)?changed/,   weight: 3 },
      { text: "password reset link",                                                         weight: 3 },
      { text: "reset link sent",                                                             weight: 3 },
      // Supporting password signals (weight 2 — combine with each other)
      { text: "confirm password",               weight: 2 },
      { text: "enter new password",             weight: 2 },
      { text: "at least 8 characters",          weight: 2 },
      { text: "strong password",                weight: 2 },
      { text: "password must",                  weight: 2 },
      { text: "password should",                weight: 2 },

      // ── Email / Phone Verification ───────────────────────────────────────
      { text: "verify your email",              weight: 3 },
      { text: "verify your phone",              weight: 3 },
      { text: "verify your number",             weight: 3 },
      { text: "verify your account",            weight: 3 },
      { text: "phone verification",             weight: 3 },
      { text: "email verification",             weight: 3 },
      { text: "confirm your email",             weight: 3 },
      { text: "confirm your phone",             weight: 3 },
      { text: "link sent to your email",        weight: 3 },
      { text: "check your email",               weight: 3 },
      { text: "check your inbox",               weight: 3 },
      { text: "mobile verification",            weight: 3 },
      { text: "number verification",            weight: 3 },
      { text: "sim swap",                       weight: 3 },

      // ── Account Alerts (regex — catches "has been", "is", "was" forms) ──
      { text: "account locked",      pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?locked/,      weight: 3 },
      { text: "account blocked",     pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?blocked/,     weight: 3 },
      { text: "account suspended",   pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?suspended/,   weight: 3 },
      { text: "account disabled",    pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?disabled/,    weight: 3 },
      { text: "account deactivated", pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?deactivated/, weight: 3 },
      { text: "account restricted",  pattern: /account\s+(has\s+been\s+|is\s+|was\s+)?restricted/,  weight: 3 },
      { text: "temporarily locked",  pattern: /temporarily\s+(locked|blocked|suspended)/,            weight: 3 },
      { text: "suspicious activity",            weight: 3 },
      { text: "unauthorized access",            weight: 3 },
      { text: "security alert",                 weight: 3 },
      { text: "login attempt",                  weight: 3 },
      { text: "unrecognized device",            weight: 3 },
      { text: "new device login",               weight: 3 },
      { text: "new sign-in",                    weight: 3 },
      { text: "someone signed in",              weight: 3 },
      { text: "signed in from",                 weight: 3 },
      { text: "failed login",                   weight: 3 },
      { text: "wrong password",                 weight: 3 },
      { text: "incorrect password",             weight: 3 },
      { text: "too many attempts",              weight: 3 },
      { text: "account recovery",               weight: 3 },
      { text: "recover your account",           weight: 3 },
      { text: "identity verification",          weight: 3 },
      { text: "was this you",                   weight: 3 },
      { text: "if this wasn't you",             weight: 3 },
      { text: "this wasn't me",                 weight: 3 },
      { text: "we noticed",                     weight: 3 },
      { text: "it wasn't you",                  weight: 3 },
      { text: "secure your account",            weight: 3 },

      // ── Security Settings ─────────────────────────────────────────────────
      { text: "security settings",              weight: 3 },
      { text: "privacy and security",           weight: 3 },
      { text: "account security",               weight: 3 },
      { text: "change email address",           weight: 3 },
      { text: "active sessions",                weight: 3 },
      { text: "sign out of all devices",        weight: 3 },
      { text: "log out of all devices",         weight: 3 },
      { text: "connected apps",                 weight: 3 },
      { text: "trusted device",                 weight: 3 },
      { text: "new browser",                    weight: 3 },
      { text: "new location",                   weight: 3 },

      // ── Session ───────────────────────────────────────────────────────────
      { text: "session expired",                weight: 3 },
      { text: "your session",                   weight: 2 },
      { text: "login again",                    weight: 2 },
      { text: "re-login",                       weight: 3 },
      { text: "re-enter password",              weight: 3 },

      // ── Voice / WhatsApp OTP ──────────────────────────────────────────────
      { text: "voice call verification",        weight: 3 },
      { text: "we called you",                  weight: 3 },
      { text: "otp via whatsapp",               weight: 3 },
      { text: "whatsapp verification",          weight: 3 },

      // ── Transaction OTP ───────────────────────────────────────────────────
      { text: "transaction otp",                weight: 3 },
      { text: "payment otp",                    weight: 3 },
      { text: "approve transaction",            weight: 3 },
      { text: "authorize payment",              weight: 3 },
      { text: "confirm transaction",            weight: 3 },
      { text: "transaction pin",                weight: 3 },
      { text: "enter pin",                      weight: 3 },
      { text: "pin verification",               weight: 3 },
      { text: "secure code",                    weight: 3 },
      { text: "authorization code",             weight: 3 },

      // ── India Specific ────────────────────────────────────────────────────
      { text: "mpin",                           weight: 3 },
      { text: "upi pin",                        weight: 3 },
      { text: "enter upi",                      weight: 3 },
      { text: "enter aadhaar otp",              weight: 3 },
      { text: "uidai",                          weight: 3 },

      // ── Countdown / Expiry (weight 2 — supporting) ────────────────────────
      { text: "resend in",                      weight: 2 },
      { text: "resend after",                   weight: 2 },
      { text: "expires in",                     weight: 2 },
      { text: "valid for",                      weight: 2 },
      { text: "use within",                     weight: 2 },

      // ── Do Not Share ──────────────────────────────────────────────────────
      { text: "do not share this code",         weight: 3 },
      { text: "do not share this otp",          weight: 3 },
      { text: "never share your otp",           weight: 3 },
      { text: "do not disclose this",           weight: 3 },
      { text: "never share your password",      weight: 3 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PAYMENTS / RECEIPTS
  //    Covers: UPI apps, bank transfers, e-commerce orders, food delivery,
  //    cab receipts, utility bills, freelance payments, credit card statements
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "Payments / Receipts",
    minScore: 3,
    keywords: [
      // UPI payment apps — instant classify
      { text: "payment successful",      weight: 3 },
      { text: "payment confirmed",       weight: 3 },
      { text: "payment failed",          weight: 3 },
      { text: "paid successfully",       weight: 3 },
      { text: "money sent",              weight: 3 },
      { text: "money received",          weight: 3 },
      { text: "money has been sent",     weight: 3 },
      { text: "successfully sent",       weight: 3 },
      { text: "transaction successful",  weight: 3 },
      { text: "transaction failed",      weight: 3 },
      { text: "transfer successful",     weight: 3 },
      { text: "sent successfully",       weight: 3 },
      // Pakistani payment apps — instant classify
      { text: "easypaisa",               weight: 3 },
      { text: "easy paisa",              weight: 3 },
      { text: "jazzcash",                weight: 3 },
      { text: "jazz cash",               weight: 3 },
      { text: "nayapay",                 weight: 3 },
      { text: "sadapay",                 weight: 3 },
      { text: "meezan bank",             weight: 3 },
      { text: "hbl",                     weight: 2 },
      { text: "habib bank",              weight: 3 },
      { text: "ubl",                     weight: 2 },
      { text: "united bank",             weight: 2 },
      { text: "mcb bank",                weight: 3 },
      { text: "bank alfalah",            weight: 3 },
      { text: "allied bank",             weight: 3 },
      { text: "faysal bank",             weight: 3 },
      { text: "standard chartered",      weight: 3 },
      // PhonePe specific
      { text: "phonepe",                 weight: 3 },
      { text: "sent via phonepe",        weight: 3 },
      { text: "received via phonepe",    weight: 3 },
      // GPay specific
      { text: "google pay",              weight: 3 },
      { text: "gpay",                    weight: 3 },
      { text: "paid via google pay",     weight: 3 },
      // Paytm
      { text: "paytm",                   weight: 3 },
      { text: "paytm wallet",            weight: 3 },
      { text: "cashback",                weight: 2 },
      // Amazon Pay / BHIM
      { text: "amazon pay",              weight: 3 },
      { text: "bhim upi",                weight: 3 },
      { text: "bhim",                    weight: 2 },
      // Razorpay / PayU / Instamojo
      { text: "razorpay",                weight: 3 },
      { text: "payu",                    weight: 2 },
      { text: "instamojo",               weight: 3 },
      // UPI transaction details
      { text: "upi ref",                 weight: 3 },
      { text: "upi transaction",         weight: 3 },
      { text: "upi id",                  weight: 2 },
      { text: "utr no",                  weight: 3 },
      { text: "utr number",              weight: 3 },
      { text: "ref no",                  weight: 2 },
      { text: "txn id",                  weight: 3 },
      { text: "transaction id",          weight: 3 },
      { text: "transaction no",          weight: 3 },
      { text: "txn no",                  weight: 2 },
      // Indian banks
      { text: "hdfc bank",               weight: 3 },
      { text: "sbi",                     weight: 2 },
      { text: "state bank",              weight: 2 },
      { text: "icici bank",              weight: 3 },
      { text: "axis bank",               weight: 3 },
      { text: "kotak bank",              weight: 3 },
      { text: "kotak mahindra",          weight: 3 },
      { text: "yes bank",                weight: 3 },
      { text: "bank of baroda",          weight: 3 },
      { text: "pnb",                     weight: 2 },
      { text: "punjab national bank",    weight: 3 },
      { text: "canara bank",             weight: 3 },
      { text: "idfc bank",               weight: 3 },
      { text: "au small finance",        weight: 3 },
      // Currency signals
      { text: "₹",                       weight: 2 },
      { text: "rs.",                     weight: 2 },
      { text: "inr",                     weight: 1 },
      { text: "pkr",                     weight: 2 },
      { text: "fee / charge",            weight: 2 },
      { text: "no charge",               weight: 1 },
      { text: "sent to",                 weight: 1 },
      { text: "sent by",                 weight: 1 },
      { text: "id#",                     weight: 1 },
      // Debit/credit
      { text: "amount debited",          weight: 3 },
      { text: "amount credited",         weight: 3 },
      { text: "amount paid",             weight: 3 },
      { text: "debited from",            weight: 3 },
      { text: "credited to",             weight: 3 },
      { text: "debit card",              weight: 2 },
      { text: "credit card",             weight: 2 },
      { text: "emi",                     weight: 2 },
      { text: "emi deducted",            weight: 3 },
      // E-commerce orders
      { text: "order placed",            weight: 3 },
      { text: "order confirmed",         weight: 3 },
      { text: "order id",                weight: 2 },
      { text: "order #",                 weight: 2 },
      { text: "your order",              weight: 1 },
      { text: "out for delivery",        weight: 3 },
      { text: "arriving",                weight: 1 },
      { text: "delivered",               weight: 1 },
      { text: "return initiated",        weight: 3 },
      { text: "refund initiated",        weight: 3 },
      { text: "refund of",               weight: 3 },
      // Amazon / Flipkart / Meesho
      { text: "amazon",                  weight: 2 },
      { text: "flipkart",                weight: 3 },
      { text: "meesho",                  weight: 3 },
      { text: "myntra",                  weight: 3 },
      { text: "ajio",                    weight: 3 },
      { text: "nykaa",                   weight: 3 },
      { text: "snapdeal",                weight: 3 },
      // Food delivery
      { text: "swiggy",                  weight: 3 },
      { text: "zomato",                  weight: 3 },
      { text: "your order from",         weight: 3 },
      { text: "food delivery",           weight: 2 },
      // Cab / travel
      { text: "your ride receipt",       weight: 3 },
      { text: "trip receipt",            weight: 3 },
      { text: "fare breakdown",          weight: 3 },
      { text: "ola",                     weight: 1 },
      { text: "uber",                    weight: 1 },
      { text: "rapido",                  weight: 2 },
      // Utility bills
      { text: "electricity bill",        weight: 3 },
      { text: "bill amount",             weight: 2 },
      { text: "due date",                weight: 1 },
      { text: "recharge successful",     weight: 3 },
      { text: "mobile recharge",         weight: 3 },
      { text: "dth recharge",            weight: 3 },
      { text: "talktime",                weight: 2 },
      // Invoices / receipts
      { text: "invoice no",              weight: 3 },
      { text: "invoice #",               weight: 3 },
      { text: "invoice date",            weight: 2 },
      { text: "tax invoice",             weight: 3 },
      { text: "payment receipt",         weight: 3 },
      { text: "bank statement",          weight: 3 },
      { text: "account statement",       weight: 3 },
      { text: "total amount",            weight: 2 },
      { text: "grand total",             weight: 2 },
      { text: "subtotal",                weight: 1 },
      { text: "amount:",                 weight: 1 },
      { text: "total:",                  weight: 1 },
      { text: "billing address",         weight: 2 },
      { text: "receipt",                 weight: 2 },
      { text: "invoice",                 weight: 2 },
      // ── Global digital wallets & payment apps ──
      { text: "venmo",                   weight: 3 },
      { text: "cash app",                weight: 3 },
      { text: "cashapp",                 weight: 3 },
      { text: "zelle",                   weight: 3 },
      { text: "apple pay",               weight: 3 },
      { text: "samsung pay",             weight: 3 },
      { text: "revolut",                 weight: 3 },
      { text: "wise",                    weight: 2 },
      { text: "transferwise",            weight: 3 },
      { text: "monzo",                   weight: 3 },
      { text: "n26",                     weight: 3 },
      { text: "klarna",                  weight: 3 },
      { text: "afterpay",                weight: 3 },
      { text: "affirm",                  weight: 3 },
      { text: "clearpay",                weight: 3 },
      { text: "square",                  weight: 2 },
      { text: "paysafe",                 weight: 3 },
      { text: "skrill",                  weight: 3 },
      { text: "neteller",                weight: 3 },
      { text: "payoneer",                weight: 3 },
      { text: "2checkout",               weight: 3 },
      // ── African mobile money ──
      { text: "m-pesa",                  weight: 3 },
      { text: "mpesa",                   weight: 3 },
      { text: "mtn momo",                weight: 3 },
      { text: "airtel money",            weight: 3 },
      { text: "orange money",            weight: 3 },
      { text: "wave money",              weight: 3 },
      { text: "tigo cash",               weight: 3 },
      { text: "equitel",                 weight: 3 },
      // ── Middle East payment ──
      { text: "stc pay",                 weight: 3 },
      { text: "benefit pay",             weight: 3 },
      { text: "fawry",                   weight: 3 },
      { text: "vodafone cash",           weight: 3 },
      { text: "instapay",                weight: 3 },
      { text: "tabby",                   weight: 3 },
      { text: "tamara",                  weight: 3 },
      // ── South/SE Asia ──
      { text: "grabpay",                 weight: 3 },
      { text: "gcash",                   weight: 3 },
      { text: "maya",                    weight: 2 },
      { text: "paymaya",                 weight: 3 },
      { text: "gopay",                   weight: 3 },
      { text: "ovo",                     weight: 2 },
      { text: "dana wallet",             weight: 3 },
      { text: "bkash",                   weight: 3 },
      { text: "nagad",                   weight: 3 },
      { text: "rocket (dbbl)",           weight: 3 },
      { text: "promptpay",               weight: 3 },
      { text: "truemoney",               weight: 3 },
      { text: "momo wallet",             weight: 3 },
      // ── East Asia ──
      { text: "wechat pay",              weight: 3 },
      { text: "alipay",                  weight: 3 },
      { text: "line pay",                weight: 3 },
      { text: "kakaopay",                weight: 3 },
      { text: "toss",                    weight: 2 },
      { text: "paypay",                  weight: 3 },
      // ── Latin America ──
      { text: "mercado pago",            weight: 3 },
      { text: "pix",                     weight: 2 },
      { text: "nubank",                  weight: 3 },
      { text: "picpay",                  weight: 3 },
      { text: "rappi pay",               weight: 3 },
      // ── Global currencies ──
      { text: "$",                       weight: 1 },
      { text: "usd",                     weight: 1 },
      { text: "€",                       weight: 1 },
      { text: "eur",                     weight: 1 },
      { text: "£",                       weight: 1 },
      { text: "gbp",                     weight: 1 },
      { text: "¥",                       weight: 1 },
      { text: "¥",                       weight: 1 },
      { text: "cad",                     weight: 1 },
      { text: "aud",                     weight: 1 },
      { text: "aed",                     weight: 2 },
      { text: "sar",                     weight: 2 },
      { text: "bdt",                     weight: 2 },
      { text: "egp",                     weight: 2 },
      { text: "ngn",                     weight: 2 },
      { text: "kes",                     weight: 2 },
      { text: "try",                     weight: 1 },
      { text: "idr",                     weight: 1 },
      { text: "thb",                     weight: 1 },
      { text: "myr",                     weight: 1 },
      // ── Global transaction phrases ──
      { text: "funds transferred",       weight: 3 },
      { text: "transfer complete",       weight: 3 },
      { text: "funds received",          weight: 3 },
      { text: "payment processed",       weight: 3 },
      { text: "debit successful",        weight: 3 },
      { text: "charge successful",       weight: 3 },
      { text: "purchase successful",     weight: 3 },
      { text: "your payment of",         weight: 3 },
      { text: "charged to your",         weight: 3 },
      { text: "you paid",                weight: 2 },
      { text: "you received",            weight: 2 },
      { text: "bank transfer",           weight: 2 },
      { text: "wire transfer",           weight: 3 },
      { text: "instant transfer",        weight: 3 },
      // ── International e-commerce ──
      { text: "alibaba",                 weight: 3 },
      { text: "aliexpress",              weight: 3 },
      { text: "shopee",                  weight: 3 },
      { text: "lazada",                  weight: 3 },
      { text: "tokopedia",               weight: 3 },
      { text: "daraz",                   weight: 3 },
      { text: "noon",                    weight: 2 },
      { text: "jumia",                   weight: 3 },
      { text: "konga",                   weight: 3 },
      { text: "takealot",                weight: 3 },
      { text: "ebay",                    weight: 2 },
      { text: "etsy",                    weight: 2 },
      { text: "booking.com",             weight: 2 },
      { text: "airbnb",                  weight: 2 },
      { text: "agoda",                   weight: 2 },
      // ── Crypto ──
      { text: "binance",                 weight: 3 },
      { text: "coinbase",                weight: 3 },
      { text: "crypto transfer",         weight: 3 },
      { text: "usdt",                    weight: 3 },
      { text: "bitcoin",                 weight: 3 },
      { text: "withdrawal approved",     weight: 3 },
      // ── International
      { text: "paypal",                  weight: 3 },
      { text: "stripe",                  weight: 2 },
      // ── Freelance platforms ──
      { text: "standard request",        weight: 1 },
      { text: "order accepted",          weight: 2 },
      { text: "payment released",        weight: 3 },
      { text: "milestone",               weight: 1 },
      { text: "fiverr",                  weight: 3 },
      { text: "upwork",                  weight: 3 },
      { text: "freelancer",              weight: 2 },
      { text: "toptal",                  weight: 3 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. WHATSAPP / CHATS
  //    Covers: WhatsApp, Telegram, iMessage, Instagram DMs, Signal, Messenger
  //    Key patterns: chat UI elements, message status, group notifications
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "WhatsApp / Chats",
    minScore: 3,
    keywords: [
      // WhatsApp — instant classify
      { text: "whatsapp",                weight: 3 },
      { text: "end-to-end encrypted",    weight: 3 },
      { text: "end to end encrypted",    weight: 3 },
      { text: "messages are end-to-end", weight: 3 },
      // Chat message status
      { text: "message delivered",       weight: 3 },
      { text: "messages delivered",      weight: 3 },
      { text: "this message was deleted", weight: 3 },
      { text: "you deleted this message", weight: 3 },
      { text: "message not delivered",   weight: 3 },
      // Online status
      { text: "last seen today",         weight: 3 },
      { text: "last seen yesterday",     weight: 3 },
      { text: "last seen at",            weight: 3 },
      { text: "last seen",               weight: 2 },
      { text: "typing...",               weight: 2 },
      { text: "online",                  weight: 1 },
      { text: "read receipts",           weight: 2 },
      // Media indicators in chat
      { text: "view once",               weight: 3 },
      { text: "voice message",           weight: 2 },
      { text: "missed call",             weight: 2 },
      { text: "missed video call",       weight: 3 },
      { text: "missed voice call",       weight: 3 },
      { text: "incoming call",           weight: 2 },
      { text: "outgoing call",           weight: 2 },
      // Forwarded
      { text: "forwarded",               weight: 1 },
      { text: "forwarded many times",    weight: 3 },
      { text: "replied to",              weight: 1 },
      { text: "pinned message",          weight: 2 },
      // Group notifications
      { text: "added to the group",      weight: 3 },
      { text: "you were added",          weight: 2 },
      { text: "group created",           weight: 3 },
      { text: "changed the group",       weight: 3 },
      { text: "changed the subject",     weight: 3 },
      { text: "changed this group",      weight: 3 },
      { text: "group admin",             weight: 2 },
      { text: "left the group",          weight: 2 },
      { text: "removed from the group",  weight: 3 },
      // Telegram
      { text: "telegram",                weight: 3 },
      { text: "t.me/",                   weight: 3 },
      { text: "join channel",            weight: 2 },
      { text: "channel members",         weight: 2 },
      { text: "supergroup",              weight: 2 },
      // iMessage / SMS
      { text: "imessage",                weight: 3 },
      { text: "send with sms instead",   weight: 3 },
      { text: "delivered via imessage",  weight: 3 },
      // Messenger / other
      { text: "facebook messenger",      weight: 3 },
      { text: "messenger",               weight: 1 },
      { text: "instagram direct",        weight: 3 },
      { text: "sent you a message",      weight: 2 },
      // Signal
      { text: "signal messenger",        weight: 3 },
      // Status
      { text: "status update",           weight: 2 },
      { text: "viewed your status",      weight: 3 },
      // ── Global messaging apps ──
      { text: "line app",                weight: 3 },
      { text: "line:",                   weight: 1 },
      { text: "wechat",                  weight: 3 },
      { text: "kakaotalk",               weight: 3 },
      { text: "viber",                   weight: 3 },
      { text: "discord",                 weight: 3 },
      { text: "slack",                   weight: 2 },
      { text: "microsoft teams",         weight: 3 },
      { text: "zalo",                    weight: 3 },
      { text: "imo messenger",           weight: 3 },
      { text: "imo",                     weight: 1 },
      { text: "snapchat chat",           weight: 3 },
      { text: "skype",                   weight: 3 },
      { text: "google chat",             weight: 3 },
      { text: "hangouts",                weight: 3 },
      { text: "bbm",                     weight: 3 },
      { text: "kik messenger",           weight: 3 },
      { text: "textplus",                weight: 3 },
      { text: "dingtalk",                weight: 3 },
      // ── Discord / server chat ──
      { text: "#general",                weight: 2 },
      { text: "server boost",            weight: 3 },
      { text: "joined the server",       weight: 3 },
      { text: "bot",                     weight: 1 },
      // ── Generic chat UI ──
      { text: "reply",                   weight: 1 },
      { text: "seen",                    weight: 1 },
      { text: "delivered",               weight: 1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SOCIAL MEDIA
  //    Covers: Instagram, TikTok, YouTube, Facebook, Twitter/X, Snapchat,
  //    Reddit, LinkedIn, Pinterest, and Indian apps (ShareChat, Moj, Josh)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "Social Media",
    minScore: 3,
    keywords: [
      // TikTok — very specific UI text
      { text: "tiktok",                  weight: 3 },
      { text: "#fyp",                    weight: 3 },
      { text: "#foryou",                 weight: 3 },
      { text: "#foryoupage",             weight: 3 },
      { text: "for you page",            weight: 3 },
      { text: "duet",                    weight: 2 },
      { text: "stitch",                  weight: 1 },
      { text: "original sound",          weight: 2 },
      { text: "sound by",                weight: 2 },
      { text: "creator marketplace",     weight: 3 },
      { text: "tiktok live",             weight: 3 },
      // Instagram
      { text: "instagram",               weight: 3 },
      { text: "reels",                   weight: 2 },
      { text: "liked your post",         weight: 3 },
      { text: "started following you",   weight: 3 },
      { text: "tagged you in",           weight: 3 },
      { text: "mentioned you in",        weight: 3 },
      { text: "close friends",           weight: 2 },
      { text: "suggested for you",       weight: 2 },
      { text: "instagram story",         weight: 3 },
      { text: "story views",             weight: 3 },
      { text: "add yours",               weight: 2 },
      { text: "collab post",             weight: 3 },
      { text: "reel views",              weight: 3 },
      { text: "explore",                 weight: 1 },
      // YouTube
      { text: "youtube",                 weight: 3 },
      { text: "just posted a video",     weight: 3 },
      { text: "premieres in",            weight: 3 },
      { text: "live now",                weight: 2 },
      { text: "watch later",             weight: 2 },
      { text: "youtube shorts",          weight: 3 },
      { text: "subscribers",             weight: 2 },
      { text: "subscribe",               weight: 2 },
      { text: "liked video",             weight: 2 },
      { text: "views",                   weight: 1 },
      // Twitter / X
      { text: "twitter",                 weight: 3 },
      { text: "tweet",                   weight: 2 },
      { text: "retweet",                 weight: 3 },
      { text: "quoted tweet",            weight: 3 },
      { text: "liked your tweet",        weight: 3 },
      { text: "retweeted your tweet",    weight: 3 },
      { text: "mentioned you",           weight: 2 },
      { text: "followed you",            weight: 2 },
      { text: "trending",                weight: 1 },
      { text: "for you",                 weight: 1 },
      // Facebook
      { text: "facebook",                weight: 3 },
      { text: "liked your photo",        weight: 3 },
      { text: "commented on your post",  weight: 3 },
      { text: "tagged you",              weight: 2 },
      { text: "news feed",               weight: 2 },
      { text: "facebook watch",          weight: 3 },
      { text: "marketplace",             weight: 1 },
      // Snapchat
      { text: "snapchat",                weight: 3 },
      { text: "snap score",              weight: 3 },
      { text: "streaks",                 weight: 2 },
      { text: "🔥",                      weight: 1 },
      // Reddit
      { text: "reddit",                  weight: 3 },
      { text: "subreddit",               weight: 3 },
      { text: "upvote",                  weight: 2 },
      { text: "downvote",                weight: 2 },
      { text: "karma",                   weight: 2 },
      { text: "r/",                      weight: 2 },
      { text: "u/",                      weight: 1 },
      // LinkedIn
      { text: "linkedin",                weight: 3 },
      { text: "viewed your profile",     weight: 3 },
      { text: "connected with you",      weight: 3 },
      { text: "endorsed your skill",     weight: 3 },
      { text: "connections",             weight: 1 },
      // Pinterest
      { text: "pinterest",               weight: 3 },
      { text: "pin it",                  weight: 2 },
      // Indian social apps
      { text: "sharechat",               weight: 3 },
      { text: "josh app",                weight: 3 },
      { text: "moj app",                 weight: 3 },
      { text: "chingari",                weight: 3 },
      { text: "roposo",                  weight: 3 },
      { text: "mx takatak",              weight: 3 },
      // BeReal
      { text: "bereal",                  weight: 3 },
      // ── Global / regional platforms ──
      { text: "threads",                 weight: 3 },
      { text: "mastodon",                weight: 3 },
      { text: "twitch",                  weight: 3 },
      { text: "twitch stream",           weight: 3 },
      { text: "clip saved",              weight: 2 },
      { text: "going live",              weight: 2 },
      { text: "bluesky",                 weight: 3 },
      { text: "clubhouse",               weight: 3 },
      { text: "vkontakte",               weight: 3 },
      { text: "vk.com",                  weight: 3 },
      { text: "odnoklassniki",           weight: 3 },
      { text: "weibo",                   weight: 3 },
      { text: "douyin",                  weight: 3 },
      { text: "xiaohongshu",             weight: 3 },
      { text: "bilibili",                weight: 3 },
      { text: "naver",                   weight: 2 },
      { text: "band app",                weight: 3 },
      { text: "tumblr",                  weight: 3 },
      { text: "quora",                   weight: 2 },
      // ── Middle East / South Asia social ──
      { text: "likee",                   weight: 3 },
      { text: "helo app",                weight: 3 },
      { text: "snack video",             weight: 3 },
      // ── Creator tools ──
      { text: "patreon",                 weight: 3 },
      { text: "onlyfans",                weight: 3 },
      { text: "substack",                weight: 3 },
      // Generic social signals (need multiples)
      { text: "followers",               weight: 2 },
      { text: "following",               weight: 1 },
      { text: "likes",                   weight: 1 },
      { text: "comments",                weight: 1 },
      { text: "shares",                  weight: 1 },
      { text: "profile",                 weight: 1 },
      { text: "direct message",          weight: 2 },
      { text: "post reach",              weight: 2 },
      { text: "impressions",             weight: 2 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. STUDY / NOTES
  //    Covers: Indian curriculum (CBSE, NCERT, JEE, NEET, UPSC),
  //    ed-tech apps (BYJU's, Unacademy, Vedantu), notes, exams, report cards
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "Study / Notes",
    minScore: 3,
    keywords: [
      // Exam marks / results
      { text: "marks obtained",          weight: 3 },
      { text: "maximum marks",           weight: 3 },
      { text: "marks:",                  weight: 2 },
      { text: "out of",                  weight: 1 },
      { text: "percentage:",             weight: 2 },
      { text: "grade:",                  weight: 2 },
      { text: "cgpa",                    weight: 3 },
      { text: "gpa",                     weight: 2 },
      { text: "first division",          weight: 3 },
      { text: "second division",         weight: 3 },
      { text: "pass with distinction",   weight: 3 },
      // Roll / registration
      { text: "roll no",                 weight: 2 },
      { text: "roll number",             weight: 2 },
      { text: "registration no",         weight: 2 },
      { text: "enrollment no",           weight: 2 },
      { text: "student id",              weight: 2 },
      // Exam types
      { text: "question paper",          weight: 3 },
      { text: "answer key",              weight: 3 },
      { text: "examination",             weight: 2 },
      { text: "exam:",                   weight: 2 },
      { text: "quiz",                    weight: 2 },
      { text: "mcq",                     weight: 2 },
      { text: "multiple choice",         weight: 2 },
      { text: "fill in the blank",       weight: 3 },
      { text: "true or false",           weight: 3 },
      { text: "practice test",           weight: 3 },
      { text: "mock test",               weight: 3 },
      { text: "test series",             weight: 3 },
      // Indian boards & exams
      { text: "ncert",                   weight: 3 },
      { text: "cbse",                    weight: 3 },
      { text: "icse",                    weight: 3 },
      { text: "state board",             weight: 3 },
      { text: "board exam",              weight: 3 },
      { text: "jee",                     weight: 2 },
      { text: "jee mains",               weight: 3 },
      { text: "jee advanced",            weight: 3 },
      { text: "neet",                    weight: 2 },
      { text: "upsc",                    weight: 3 },
      { text: "ssc cgl",                 weight: 3 },
      { text: "gate exam",               weight: 3 },
      { text: "gate",                    weight: 1 },
      { text: "cat exam",                weight: 3 },
      { text: "clat",                    weight: 3 },
      { text: "cuet",                    weight: 3 },
      // Ed-tech apps
      { text: "byju",                    weight: 3 },
      { text: "byjus",                   weight: 3 },
      { text: "unacademy",               weight: 3 },
      { text: "vedantu",                 weight: 3 },
      { text: "doubtnut",                weight: 3 },
      { text: "toppr",                   weight: 3 },
      { text: "khan academy",            weight: 3 },
      { text: "coursera",                weight: 3 },
      { text: "udemy",                   weight: 3 },
      { text: "physics wallah",          weight: 3 },
      { text: "pw app",                  weight: 3 },
      // Subject matter keywords
      { text: "theorem",                 weight: 2 },
      { text: "equation",                weight: 2 },
      { text: "formula",                 weight: 2 },
      { text: "chapter",                 weight: 2 },
      { text: "lecture",                 weight: 2 },
      { text: "syllabus",                weight: 2 },
      { text: "homework",                weight: 3 },
      { text: "assignment",              weight: 2 },
      { text: "definition:",             weight: 2 },
      { text: "class notes",             weight: 3 },
      { text: "lecture notes",           weight: 3 },
      { text: "study material",          weight: 3 },
      { text: "previous year",           weight: 3 },
      { text: "pyq",                     weight: 3 },
      { text: "important questions",     weight: 3 },
      { text: "short notes",             weight: 3 },
      { text: "revision notes",          weight: 3 },
      { text: "mind map",                weight: 3 },
      { text: "textbook",                weight: 2 },
      // Institute names
      { text: "iit",                     weight: 2 },
      { text: "nit",                     weight: 2 },
      { text: "aiims",                   weight: 3 },
      { text: "du",                      weight: 1 },
      { text: "ignou",                   weight: 3 },
      { text: "university",              weight: 1 },
      { text: "college",                 weight: 1 },
      // Admit card
      { text: "admit card",              weight: 3 },
      { text: "hall ticket",             weight: 3 },
      { text: "exam date",               weight: 2 },
      { text: "exam centre",             weight: 3 },
      { text: "exam center",             weight: 3 },
      { text: "reporting time",          weight: 3 },
      // Supporting signals
      { text: "key points",              weight: 1 },
      { text: "summary:",                weight: 1 },
      { text: "important:",              weight: 1 },
      { text: "solution:",               weight: 1 },
      // ── Pakistani education ──
      { text: "matric",                  weight: 3 },
      { text: "fsc",                     weight: 2 },
      { text: "bise",                    weight: 3 },
      { text: "css exam",                weight: 3 },
      { text: "ppsc",                    weight: 3 },
      { text: "fpsc",                    weight: 3 },
      { text: "nts test",                weight: 3 },
      { text: "ecat",                    weight: 3 },
      { text: "mdcat",                   weight: 3 },
      { text: "hec",                     weight: 2 },
      { text: "allama iqbal open",       weight: 3 },
      { text: "punjab university",       weight: 3 },
      { text: "karachi university",      weight: 3 },
      // ── Global standard tests ──
      { text: "sat score",               weight: 3 },
      { text: "gre score",               weight: 3 },
      { text: "gmat",                    weight: 3 },
      { text: "ielts",                   weight: 3 },
      { text: "toefl",                   weight: 3 },
      { text: "toeic",                   weight: 3 },
      { text: "act score",               weight: 3 },
      { text: "a-level",                 weight: 3 },
      { text: "o-level",                 weight: 3 },
      { text: "gcse",                    weight: 3 },
      { text: "ap exam",                 weight: 3 },
      { text: "ib diploma",              weight: 3 },
      { text: "cambridge",               weight: 2 },
      { text: "edexcel",                 weight: 3 },
      // ── Global ed-tech apps ──
      { text: "duolingo",                weight: 3 },
      { text: "chegg",                   weight: 3 },
      { text: "quizlet",                 weight: 3 },
      { text: "brainly",                 weight: 3 },
      { text: "grammarly",               weight: 2 },
      { text: "wolfram alpha",           weight: 3 },
      { text: "google classroom",        weight: 3 },
      { text: "microsoft classroom",     weight: 3 },
      { text: "canvas lms",              weight: 3 },
      { text: "blackboard",              weight: 3 },
      { text: "moodle",                  weight: 3 },
      { text: "edx",                     weight: 3 },
      { text: "linkedin learning",       weight: 3 },
      // ── Generic academic ──
      { text: "attendance:",             weight: 2 },
      { text: "semester",                weight: 2 },
      { text: "trimester",               weight: 2 },
      { text: "credit hours",            weight: 3 },
      { text: "transcript",              weight: 3 },
      { text: "dean's list",             weight: 3 },
      { text: "honour roll",             weight: 3 },
      { text: "honor roll",              weight: 3 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DOCUMENTS
  //    Covers: Aadhaar, PAN, Voter ID, Driving License, Passport,
  //    certificates, insurance, medical, COVID vax, marksheets, property
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "Documents",
    minScore: 3,
    keywords: [
      // Aadhaar
      { text: "aadhaar",                 weight: 3 },
      { text: "aadhar",                  weight: 3 },
      { text: "unique identification",   weight: 3 },
      { text: "uidai",                   weight: 3 },
      { text: "enrollment no",           weight: 2 },
      // PAN Card
      { text: "pan card",                weight: 3 },
      { text: "permanent account number", weight: 3 },
      { text: "income tax department",   weight: 3 },
      // Voter ID
      { text: "voter id",                weight: 3 },
      { text: "voter identification",    weight: 3 },
      { text: "epic no",                 weight: 3 },
      { text: "election commission",     weight: 3 },
      // Driving License
      { text: "driving licence",         weight: 3 },
      { text: "driving license",         weight: 3 },
      { text: "motor vehicles act",      weight: 3 },
      { text: "class of vehicle",        weight: 3 },
      { text: "dl no",                   weight: 2 },
      // Passport
      { text: "passport no",             weight: 3 },
      { text: "passport number",         weight: 3 },
      { text: "place of issue",          weight: 2 },
      { text: "date of expiry",          weight: 2 },
      // Government forms
      { text: "government of india",     weight: 3 },
      { text: "ministry of",             weight: 2 },
      { text: "state government",        weight: 2 },
      { text: "municipal corporation",   weight: 3 },
      { text: "authorized signatory",    weight: 3 },
      { text: "gazetted officer",        weight: 3 },
      // Certificates
      { text: "hereby certified",        weight: 3 },
      { text: "this is to certify",      weight: 3 },
      { text: "certificate of",          weight: 3 },
      { text: "is hereby",               weight: 2 },
      // Personal details (in official docs)
      { text: "date of birth:",          weight: 2 },
      { text: "father's name:",          weight: 2 },
      { text: "mother's name:",          weight: 2 },
      { text: "nationality:",            weight: 2 },
      { text: "place of birth:",         weight: 2 },
      { text: "issued by:",              weight: 2 },
      { text: "address:",                weight: 1 },
      // Insurance
      { text: "policy no",               weight: 3 },
      { text: "policy number",           weight: 3 },
      { text: "sum assured",             weight: 3 },
      { text: "premium amount",          weight: 3 },
      { text: "maturity date",           weight: 3 },
      { text: "nominee",                 weight: 2 },
      { text: "insured name",            weight: 3 },
      { text: "lic",                     weight: 2 },
      { text: "life insurance",          weight: 3 },
      { text: "health insurance",        weight: 3 },
      // Medical / Prescription
      { text: "prescription",            weight: 3 },
      { text: "diagnosis",               weight: 2 },
      { text: "dosage",                  weight: 2 },
      { text: "dr.",                     weight: 1 },
      { text: "hospital",                weight: 1 },
      { text: "patient name",            weight: 2 },
      { text: "medicine",                weight: 1 },
      { text: "mg",                      weight: 1 },
      { text: "twice daily",             weight: 2 },
      { text: "before meals",            weight: 2 },
      // COVID certificate
      { text: "vaccination certificate", weight: 3 },
      { text: "covaxin",                 weight: 3 },
      { text: "covishield",              weight: 3 },
      { text: "cowin",                   weight: 3 },
      { text: "covid-19",                weight: 2 },
      { text: "dose",                    weight: 1 },
      { text: "vaccinated",              weight: 2 },
      // Marksheet / report card
      { text: "marksheet",               weight: 3 },
      { text: "report card",             weight: 3 },
      { text: "subject:",                weight: 1 },
      { text: "division:",               weight: 2 },
      { text: "board:",                  weight: 1 },
      // Property
      { text: "sale deed",               weight: 3 },
      { text: "registry",                weight: 2 },
      { text: "survey no",               weight: 3 },
      { text: "khata",                   weight: 3 },
      { text: "plot no",                 weight: 2 },
      // Supporting
      { text: "seal",                    weight: 1 },
      { text: "signature",               weight: 1 },
      { text: "stamp",                   weight: 1 },
      // ── Pakistani official IDs ──
      { text: "cnic",                    weight: 3 },
      { text: "nadra",                   weight: 3 },
      { text: "computerised national",   weight: 3 },
      { text: "national identity card",  weight: 3 },
      { text: "form-b",                  weight: 3 },
      { text: "b-form",                  weight: 3 },
      { text: "nicopak",                 weight: 3 },
      { text: "government of pakistan",  weight: 3 },
      // ── Middle East IDs ──
      { text: "emirates id",             weight: 3 },
      { text: "iqama",                   weight: 3 },
      { text: "residency permit",        weight: 3 },
      { text: "national id",             weight: 2 },
      { text: "kingdom of saudi",        weight: 3 },
      { text: "united arab emirates",    weight: 3 },
      { text: "ministry of interior",    weight: 3 },
      // ── Bangladesh ──
      { text: "nid card",                weight: 3 },
      { text: "election commission bangladesh", weight: 3 },
      // ── Global ID / travel ──
      { text: "travel document",         weight: 3 },
      { text: "residence permit",        weight: 3 },
      { text: "visa stamp",              weight: 3 },
      { text: "entry permit",            weight: 3 },
      { text: "departure card",          weight: 3 },
      { text: "boarding pass",           weight: 3 },
      { text: "seat no",                 weight: 2 },
      { text: "flight no",               weight: 2 },
      { text: "gate:",                   weight: 1 },
      // ── UK health ──
      { text: "nhs number",              weight: 3 },
      { text: "nhs",                     weight: 2 },
      { text: "gp surgery",              weight: 3 },
      // ── US docs ──
      { text: "social security",         weight: 3 },
      { text: "medicare",                weight: 3 },
      { text: "medicaid",                weight: 3 },
      // ── Medical global ──
      { text: "lab report",              weight: 3 },
      { text: "test results",            weight: 2 },
      { text: "blood report",            weight: 3 },
      { text: "pathology",               weight: 3 },
      { text: "discharge summary",       weight: 3 },
      { text: "mrn",                     weight: 2 },
      { text: "clinical notes",          weight: 3 },
      { text: "referral letter",         weight: 3 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. MEMES / ENTERTAINMENT
  //    Covers: meme formats, OTT platforms (Netflix, Hotstar, Prime),
  //    gaming screenshots, music apps, cricket scores
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "Memes / Entertainment",
    minScore: 3,
    keywords: [
      // Classic meme formats
      { text: "when you",                weight: 2 },
      { text: "me when",                 weight: 2 },
      { text: "nobody:",                 weight: 2 },
      { text: "literally nobody:",       weight: 3 },
      { text: "pov:",                    weight: 2 },
      { text: "expectation vs reality",  weight: 3 },
      { text: "this is fine",            weight: 2 },
      { text: "not all heroes",          weight: 3 },
      { text: "that feeling when",       weight: 3 },
      { text: "tfw",                     weight: 2 },
      { text: "me:",                     weight: 1 },
      { text: "them:",                   weight: 1 },
      // OTT — Netflix
      { text: "netflix",                 weight: 3 },
      { text: "continue watching",       weight: 3 },
      { text: "top 10 in",               weight: 3 },
      { text: "new episodes",            weight: 2 },
      { text: "watch now",               weight: 1 },
      // Amazon Prime
      { text: "prime video",             weight: 3 },
      { text: "amazon prime",            weight: 3 },
      { text: "included with prime",     weight: 3 },
      // Hotstar / Disney+
      { text: "hotstar",                 weight: 3 },
      { text: "disney+",                 weight: 3 },
      { text: "disney plus",             weight: 3 },
      { text: "star sports",             weight: 3 },
      // JioCinema / SonyLIV / ZEE5
      { text: "jiocinema",               weight: 3 },
      { text: "sonyliv",                 weight: 3 },
      { text: "zee5",                    weight: 3 },
      { text: "mx player",               weight: 3 },
      { text: "alt balaji",              weight: 3 },
      // Spotify / Music
      { text: "spotify",                 weight: 3 },
      { text: "daily mix",               weight: 3 },
      { text: "spotify wrapped",         weight: 3 },
      { text: "listening to",            weight: 2 },
      { text: "gaana",                   weight: 3 },
      { text: "jiosaavn",                weight: 3 },
      { text: "wynk music",              weight: 3 },
      // Gaming
      { text: "level up",                weight: 2 },
      { text: "achievement unlocked",    weight: 3 },
      { text: "game over",               weight: 3 },
      { text: "new record",              weight: 2 },
      { text: "bgmi",                    weight: 3 },
      { text: "battlegrounds mobile",    weight: 3 },
      { text: "pubg",                    weight: 3 },
      { text: "free fire",               weight: 3 },
      { text: "freefire",                weight: 3 },
      { text: "cod mobile",              weight: 3 },
      { text: "clash of clans",          weight: 3 },
      { text: "clash royale",            weight: 3 },
      { text: "ludo king",               weight: 3 },
      { text: "dream11",                 weight: 3 },
      // Cricket
      { text: "ipl",                     weight: 3 },
      { text: "t20",                     weight: 2 },
      { text: "odi",                     weight: 2 },
      { text: "wicket",                  weight: 2 },
      { text: "run rate",                weight: 3 },
      { text: "required rate",           weight: 3 },
      { text: "innings break",           weight: 3 },
      { text: "scorecard",               weight: 3 },
      { text: "psl",                     weight: 3 },
      // ── Global streaming ──
      { text: "hulu",                    weight: 3 },
      { text: "hbo max",                 weight: 3 },
      { text: "max original",            weight: 3 },
      { text: "apple tv+",               weight: 3 },
      { text: "apple tv plus",           weight: 3 },
      { text: "peacock",                 weight: 3 },
      { text: "paramount+",              weight: 3 },
      { text: "paramount plus",          weight: 3 },
      { text: "discovery+",              weight: 3 },
      { text: "crunchyroll",             weight: 3 },
      { text: "funimation",              weight: 3 },
      { text: "viu",                     weight: 3 },
      { text: "iqiyi",                   weight: 3 },
      { text: "youku",                   weight: 3 },
      { text: "wetvio",                  weight: 3 },
      { text: "voot",                    weight: 3 },
      { text: "arre",                    weight: 2 },
      { text: "starzplay",               weight: 3 },
      { text: "shahid",                  weight: 2 },
      { text: "watch party",             weight: 3 },
      // ── Anime / K-drama ──
      { text: "episode",                 weight: 1 },
      { text: "season",                  weight: 1 },
      { text: "anime",                   weight: 2 },
      { text: "k-drama",                 weight: 3 },
      { text: "kdrama",                  weight: 3 },
      // ── Music global ──
      { text: "apple music",             weight: 3 },
      { text: "youtube music",           weight: 3 },
      { text: "soundcloud",              weight: 3 },
      { text: "deezer",                  weight: 3 },
      { text: "tidal",                   weight: 3 },
      { text: "amazon music",            weight: 3 },
      // ── Global gaming ──
      { text: "fortnite",                weight: 3 },
      { text: "minecraft",               weight: 3 },
      { text: "roblox",                  weight: 3 },
      { text: "valorant",                weight: 3 },
      { text: "league of legends",       weight: 3 },
      { text: "gta",                     weight: 2 },
      { text: "call of duty",            weight: 3 },
      { text: "warzone",                 weight: 3 },
      { text: "apex legends",            weight: 3 },
      { text: "overwatch",               weight: 3 },
      { text: "dota",                    weight: 3 },
      { text: "counter-strike",          weight: 3 },
      { text: "fifa",                    weight: 3 },
      { text: "efootball",               weight: 3 },
      { text: "steam",                   weight: 2 },
      { text: "playstation",             weight: 2 },
      { text: "xbox",                    weight: 2 },
      { text: "nintendo switch",         weight: 3 },
      { text: "among us",                weight: 3 },
      { text: "stumble guys",            weight: 3 },
      { text: "mobile legends",          weight: 3 },
      // ── Sports global ──
      { text: "premier league",          weight: 3 },
      { text: "la liga",                 weight: 3 },
      { text: "champions league",        weight: 3 },
      { text: "nba",                     weight: 3 },
      { text: "nfl",                     weight: 3 },
      { text: "formula 1",               weight: 3 },
      { text: "f1",                      weight: 1 },
    ],
  },

];

// ─── Filename classifier ──────────────────────────────────────────────────────
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
export function categorizeByText(rawText: string): Category | null {
  const text = rawText.toLowerCase();

  const scores: { category: Category; score: number }[] = [];

  for (const rule of OCR_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      // Use regex pattern if provided, otherwise fall back to exact substring
      const matched = kw.pattern ? kw.pattern.test(text) : text.includes(kw.text);
      if (matched) score += kw.weight;
    }
    if (score >= rule.minScore) {
      scores.push({ category: rule.category, score });
    }
  }

  if (!scores.length) return null;

  scores.sort((a, b) => b.score - a.score);
  return scores[0].category;
}

/** Combined pipeline: filename → OCR text → Unknown */
export function classify(filename: string, ocrText?: string): Category {
  const byName = categorizeByFilename(filename);
  if (byName) return byName;

  if (ocrText?.trim()) {
    const byText = categorizeByText(ocrText);
    if (byText) return byText;
  }

  return "Unknown / Others";
}
