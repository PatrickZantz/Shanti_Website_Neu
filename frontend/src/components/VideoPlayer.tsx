import { getVideoEmbed } from "../lib/content";

export function VideoPlayer({ url, file, title }: { url?: string; file?: string; title: string }) {
  if (file) {
    const src = `/media/${file.split("/").map(encodeURIComponent).join("/")}`;
    return <div className="video-frame"><video src={src} title={title} controls preload="metadata" playsInline controlsList="nodownload" /></div>;
  }
  const embed = getVideoEmbed(url);
  if (!embed) return <p className="empty-state">Für dieses Video ist noch keine gültige Video-URL hinterlegt.</p>;
  return <div className="video-frame"><iframe src={embed} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
}
