import Link from "./Link";
import Image from "./Image";
import { ArrowUpRight, Clock3, Leaf } from "lucide-react";
import type { Entry } from "../lib/content";

export function ContentCard({ entry, href, icon = "leaf", fallbackImage }: { entry: Entry; href: string; icon?: "leaf" | "clock"; fallbackImage?: string }) {
  const Icon = icon === "clock" ? Clock3 : Leaf;
  const image = entry.image || entry.coverImage || entry.thumbnail || fallbackImage;
  return (
    <Link href={href} className="tile">
      <div className="tile-art">{image ? <Image src={image} alt="" fill sizes="(max-width: 680px) 100vw, (max-width: 940px) 50vw, 33vw" /> : <Icon aria-hidden="true" />}</div>
      <div className="tile-body">
        <h3>{entry.title}</h3>
        <p>{entry.description || entry.excerpt}</p>
        <div className="meta">{entry.duration ? <span>{typeof entry.duration === "number" ? `${entry.duration} Min.` : entry.duration}</span> : null}{entry.category || entry.type || entry.elements?.[0] ? <span>{entry.category || entry.type || entry.elements?.[0]}</span> : null}<ArrowUpRight size={14} aria-hidden="true" /></div>
      </div>
    </Link>
  );
}