import { MediaImage } from "@/components/media-image";

type Props = { name: string; url?: string; tone?: "light" | "dark"; size?: "sm" | "md" | "lg" };

export function LogoSlot({ name, url, tone = "light", size = "md" }: Props) {
  if (url) {
    return (
      <div className={`logo-plate logo-plate-${tone} logo-plate-${size}`}>
        <MediaImage src={url} alt={`Logo officiel ${name}`} loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className={`logo-slot logo-slot-${tone} logo-slot-${size}`} role="img" aria-label={`Emplacement réservé au logo officiel ${name}`}>
      <span className="logo-slot-badge">Logo officiel</span>
      <strong>{name}</strong>
      <small>à intégrer</small>
    </div>
  );
}
