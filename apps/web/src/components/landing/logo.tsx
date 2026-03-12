export function FitexLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)" />
      <rect x="140" y="80" width="232" height="300" rx="16" fill="white" opacity="0.15" />
      <rect x="156" y="96" width="200" height="268" rx="12" fill="white" />
      <rect x="188" y="132" width="136" height="8" rx="4" fill="#c7d2fe" />
      <rect x="188" y="156" width="100" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="176" width="120" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="196" width="80" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="224" width="136" height="8" rx="4" fill="#c7d2fe" />
      <rect x="188" y="248" width="110" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="268" width="130" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="288" width="90" height="6" rx="3" fill="#e0e7ff" />
      <rect x="188" y="316" width="136" height="8" rx="4" fill="#c7d2fe" />
      <circle cx="340" cy="380" r="80" fill="white" opacity="0.2" />
      <circle cx="340" cy="380" r="60" stroke="white" strokeWidth="8" fill="none" />
      <circle cx="340" cy="380" r="36" stroke="white" strokeWidth="6" fill="none" />
      <circle cx="340" cy="380" r="12" fill="white" />
      <line x1="340" y1="306" x2="340" y2="340" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="340" y1="420" x2="340" y2="454" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="266" y1="380" x2="300" y2="380" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="380" y1="380" x2="414" y2="380" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M120 400 L140 420 L170 380"
        stroke="#4ade80"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
