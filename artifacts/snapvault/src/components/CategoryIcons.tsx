// Duotone-style filled SVG icons — all 10 categories + utilities

export function OTPIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2.5" fill="currentColor" fillOpacity="0.15"/>
      <rect x="3" y="11" width="18" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="2" fill="currentColor"/>
      <rect x="11.25" y="16.5" width="1.5" height="2" rx="0.75" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  );
}

export function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor" fillOpacity="0.15"/>
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="2" y="9" width="20" height="3" fill="currentColor" fillOpacity="0.3"/>
      <path d="M6 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="16" y="14.5" width="4" height="2" rx="1" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  );
}

export function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M21 14.5a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M7 9h10M7 12.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function SocialIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor"/>
    </svg>
  );
}

export function StudyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="8.5" cy="8.5" r="1.75" fill="currentColor"/>
      <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MemeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8.5 14.5s1.5 2.5 3.5 2.5 3.5-2.5 3.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1.25" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.25" fill="currentColor"/>
    </svg>
  );
}

export function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function UnknownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9.5 9.5a3 3 0 0 1 5.5 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  );
}

export function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function FolderSVG({ color, className }: { color: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 44" fill="none">
      {/* Back panel */}
      <path d="M4 10a4 4 0 0 1 4-4h12l5 7h27a4 4 0 0 1 4 4v23a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill={color} fillOpacity="0.12"/>
      {/* Tab */}
      <path d="M4 10a4 4 0 0 1 4-4h12l5 7H4V10z" fill={color} fillOpacity="0.5"/>
      {/* Body */}
      <path d="M4 17h52v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V17z" fill={color} fillOpacity="0.22"/>
      {/* Body stroke */}
      <path d="M4 17h52v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V17z" stroke={color} strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* Tab stroke */}
      <path d="M4 10a4 4 0 0 1 4-4h12l5 7H4" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" strokeLinejoin="round"/>
      {/* Shine line */}
      <path d="M10 22h36" stroke={color} strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round"/>
    </svg>
  );
}
