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
      /otp/i,
      /passw(or)?d/i,
      /login/i,
      /authenticat/i,
      /2fa/i,
      /verif/i,
      /pin[-_]?code/i,
      /security[-_]?code/i,
      /one[-_]?time/i,
    ],
    category: "OTP / Security",
  },
  {
    patterns: [
      /invoice/i,
      /receipt/i,
      /payment/i,
      /order/i,
      /bill/i,
      /transact/i,
      /purchase/i,
      /paid/i,
      /checkout/i,
      /upi/i,
      /gpay/i,
      /paytm/i,
      /razorpay/i,
      /stripe/i,
      /bank/i,
    ],
    category: "Payments / Receipts",
  },
  {
    patterns: [
      /whatsapp/i,
      /wa[-_]?img/i,
      /img[-_]?\d{8}/i,
      /chat/i,
      /telegram/i,
      /signal/i,
      /messenger/i,
      /imessage/i,
      /sms/i,
    ],
    category: "WhatsApp / Chats",
  },
  {
    patterns: [
      /instagram/i,
      /insta/i,
      /tiktok/i,
      /facebook/i,
      /twitter/i,
      /reels?/i,
      /story/i,
      /stories/i,
      /fb[-_]/i,
      /ig[-_]/i,
      /tt[-_]/i,
      /snapchat/i,
      /reddit/i,
      /linkedin/i,
      /youtube/i,
    ],
    category: "Social Media",
  },
  {
    patterns: [
      /note/i,
      /study/i,
      /lecture/i,
      /class/i,
      /homework/i,
      /assignment/i,
      /exam/i,
      /quiz/i,
      /textbook/i,
      /formula/i,
      /diagram/i,
      /math/i,
      /notes?[-_]/i,
      /slide/i,
    ],
    category: "Study / Notes",
  },
  {
    patterns: [
      /meme/i,
      /funny/i,
      /lol/i,
      /joke/i,
      /gif/i,
      /humor/i,
      /dank/i,
      /entertainment/i,
    ],
    category: "Memes / Entertainment",
  },
  {
    patterns: [
      /document/i,
      /\.pdf/i,
      /scan/i,
      /aadhar/i,
      /aadhaar/i,
      /passport/i,
      /license/i,
      /certificate/i,
      /form[-_]/i,
      /important/i,
      /id[-_]?card/i,
    ],
    category: "Documents",
  },
  {
    patterns: [
      /^img_\d{8}_\d{6}/i,
      /^dsc_\d+/i,
      /^dcim/i,
      /^photo/i,
      /^pic(ture)?/i,
      /^img\d+/i,
      /^pxl_/i,
      /^cam_/i,
      /^dji_/i,
    ],
    category: "Photos",
  },
];

export function categorizeByFilename(filename: string): Category {
  const name = filename.toLowerCase();
  for (const rule of FILENAME_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(name)) {
        return rule.category;
      }
    }
  }
  return "Unknown / Others";
}
