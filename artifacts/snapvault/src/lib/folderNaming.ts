export type FolderNamingStyle = "category" | "date_category" | "custom";

export interface FolderNamingConfig {
  style: FolderNamingStyle;
  customPrefix: string;
}

const LS_STYLE  = "os_folder_style";
const LS_PREFIX = "os_folder_prefix";

export function loadFolderNaming(): FolderNamingConfig {
  return {
    style:        (localStorage.getItem(LS_STYLE) as FolderNamingStyle) || "category",
    customPrefix: localStorage.getItem(LS_PREFIX) || "",
  };
}

export function saveFolderNaming(config: FolderNamingConfig): void {
  localStorage.setItem(LS_STYLE,  config.style);
  localStorage.setItem(LS_PREFIX, config.customPrefix);
}

function sanitize(str: string): string {
  return str.replace(/[/\\:*?"<>|]/g, "-").replace(/\s+/g, "-");
}

export function buildFolderName(
  category: string,
  config: FolderNamingConfig,
  date?: Date,
): string {
  const safeCategory = sanitize(category);
  const d = date ?? new Date();
  const dateStr = d.toISOString().slice(0, 10); // "2025-05-25"

  switch (config.style) {
    case "date_category":
      return `${dateStr}_${safeCategory}`;
    case "custom": {
      const prefix = config.customPrefix.trim();
      return prefix ? `${sanitize(prefix)}_${safeCategory}` : safeCategory;
    }
    default:
      return safeCategory;
  }
}
