import Image from "next/image";

export function FitexLogo({ className = '' }: { className?: string }) {
  return <Image src="/fitex.png" className={className} alt="Fitex Logo"  priority width={460}
      height={460} />;
}
