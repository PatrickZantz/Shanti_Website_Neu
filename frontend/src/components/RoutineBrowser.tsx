

import { useState } from "react";
import { ContentCard } from "./ContentCard";
import type { Entry } from "../lib/content";

const filters = ["Alle", "Morgen", "Abend", "Übergang"];

export function RoutineBrowser({ entries, fallbackImage }: { entries: Entry[]; fallbackImage?: string }) {
  const [filter, setFilter] = useState("Alle");
  const filtered = entries.filter((entry) => filter === "Alle" || entry.type?.toLowerCase() === filter.toLowerCase());
  return <><div className="filter-row" role="group" aria-label="Routinen filtern">{filters.map((value) => <button className={`choice ${filter === value ? "selected" : ""}`} aria-pressed={filter === value} key={value} onClick={() => setFilter(value)}>{value}</button>)}</div><div className="grid grid-3">{filtered.map((entry) => <ContentCard entry={entry} href={`/routines/${entry.slug}`} key={entry.slug} fallbackImage={fallbackImage} />)}</div>{!filtered.length && <p className="empty-state">Für diesen Bereich gibt es noch keine Routine.</p>}</>;
}