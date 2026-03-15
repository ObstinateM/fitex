import Image from "next/image";

export function FitexLogo({ className = '', size = 28 }: { className?: string; size?: number }) {
  return <Image src="/fitex.png" className={className} alt="Fitex Logo" priority width={size} height={size} />;
}
