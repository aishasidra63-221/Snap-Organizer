import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, ScanSearch, Copy, Folder, Cpu, ChevronRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none"
      style={{
        background: checked ? "hsl(var(--primary))" : "hsl(var(--border))",
      }}
    >
      <span
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SettingsRow({
  icon, label, desc, right,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  right: React.ReactNode;
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

const processingModes = ["Balanced", "Fast", "Thorough"];
const folderOptions = ["Category Name", "Date + Category", "Custom"];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [dedupEnabled, setDedupEnabled] = useState(true);
  const [processingMode, setProcessingMode] = useState("Balanced");
  const [folderNaming, setFolderNaming] = useState("Category Name");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  function handleClearAll() {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <div className="flex flex-col gap-5 pb-28 pt-4 px-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customise how SnapVault organises your screenshots</p>
      </div>

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

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Organisation</div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
          <SettingsRow
            icon={<Folder className="h-4 w-4" />}
            label="Folder Naming"
            desc="How category folders are named"
            right={
              <div className="flex flex-col gap-1 items-end">
                {folderOptions.map((o) => (
                  <button
                    key={o}
                    onClick={() => setFolderNaming(o)}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: folderNaming === o ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      color: folderNaming === o ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
        {[
          { label: "Privacy Policy",    desc: "How we handle your data" },
          { label: "Terms of Service",  desc: "Usage terms and conditions" },
          { label: "App Version",       desc: "SnapVault v1.0.0" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/40 transition-colors text-left"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
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

      {/* Confirmation Dialog */}
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
