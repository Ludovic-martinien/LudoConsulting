import Link from "next/link";

export function BrandLockup({ href = "/", motto = false, className = "", onClick }: { href?: string; motto?: boolean; className?: string; onClick?: () => void }) {
  return (
    <Link href={href} className={`brand-lockup ${className}`} aria-label="Ludo_Consulting — accueil" onClick={onClick}>
      <img src="/brand/ludo-consulting.svg" alt="Ludo_Consulting" width={44} height={44} className="brand-emblem" />
      <span className="brand-words">
        <span className="brand-name">LUDO<span>_</span>CONSULTING</span>
        {motto ? <span className="brand-motto">Innover · Développer · Réussir.</span> : null}
      </span>
    </Link>
  );
}
