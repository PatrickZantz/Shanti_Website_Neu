

import { useState } from "react";
import Image from "./Image";
import { ArrowRight, Heart } from "lucide-react";
import Link from "./Link";
import type { Entry, ToolState } from "../lib/content";

export function ToolSelector({ entries, states, bandImage }: { entries: Entry[]; states: ToolState[]; bandImage?: string }) {
  const [selected, setSelected] = useState("");
  const matches = entries.filter((entry) => entry.emotionalState?.toLowerCase() === selected.toLowerCase());
  return <>
    <div className="option-grid option-grid-3">{states.map(({ name, detail, image }) => <button type="button" className={`option-tile state-tile ${selected === name ? "selected" : ""}`} aria-pressed={selected === name} key={name} onClick={() => setSelected(name)}>{image ? <Image className="option-art" src={image} alt="" width={104} height={104} /> : null}<strong>{name}</strong><small>{detail}</small></button>)}</div>
    {selected ? <section className="result" aria-live="polite"><p className="eyebrow">FÜR DICH AUSGEWÄHLT</p><h2>{matches.length ? "Eine kleine Hilfe für jetzt" : `Ein Moment bei ${selected.toLowerCase()}`}</h2><p>{matches.length ? matches[0].recommendation || matches[0].description : "Lege eine Hand auf deinen Körper und nimm wahr, was gerade da ist. Du musst nichts verändern."}</p>{matches.map((entry) => <Link className="text-link" href={`/tools/${entry.slug}`} key={entry.slug}>{entry.title} ansehen <ArrowRight size={15} /></Link>)}</section> : <section className="section soft-band art-band">{bandImage ? <Image className="band-art" src={bandImage} alt="" width={160} height={115} /> : null}<div><Heart size={20} strokeWidth={1.3} aria-hidden="true" /><h3>Du darfst es dir leichter machen.</h3><p>Wähle eine kleine Hilfe für jetzt. Du kannst jederzeit aufhören.</p></div></section>}
  </>;
}
