import Link from "./Link";
import Image from "./Image";
import { Play, Clock3 } from "lucide-react";
import type { Entry } from "../lib/content";

export function VideoCard({ entry, href, fallbackImage }: { entry: Entry; href: string; fallbackImage?: string }) {
  const image = entry.thumbnail || entry.image || entry.coverImage || fallbackImage;
  const isExample = entry.category?.startsWith("Beispielvideo");
  return <Link href={href} className="tile"><div className="tile-art">{image ? <Image src={image} alt="" fill sizes="(max-width: 680px) 100vw, (max-width: 940px) 50vw, 33vw" /> : null}<span className="play-badge"><Play size={18} aria-hidden="true" /></span></div><div className="tile-body">{isExample ? <p className="video-label">Externes Beispielvideo</p> : null}<h3>{entry.title}</h3><p>{entry.description || entry.videoDescription}</p><div className="meta"><Clock3 size={14} aria-hidden="true" />{entry.videoDuration || (entry.duration ? `${entry.duration} Min.` : "Video")}</div></div></Link>;
}