import { getVideoEmbed } from "../lib/content";

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embed = getVideoEmbed(url);
  if (!embed) return <p className="empty-state">Für dieses Video ist noch keine gültige Video-URL hinterlegt.</p>;
  return <div className="video-frame"><iframe src={embed} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
}