import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fallbackSrc?: string;
};

/**
 * Image robuste : sert du WebP aux navigateurs compatibles et un JPEG de secours
 * aux navigateurs / WebView plus anciens. Garantit un visuel dans tous les cas.
 */
export function MediaImage({ src, fallbackSrc, ...props }: Props) {
  const fallback = fallbackSrc ?? (src.includes(".webp") ? src.replace(".webp", ".jpg") : src);
  const canUseWebp = src.includes(".webp");
  return (
    <picture>
      {canUseWebp ? <source srcSet={src} type="image/png" /> : null}
      <img src={canUseWebp ? fallback : src} {...props} />
    </picture>
  );
}
