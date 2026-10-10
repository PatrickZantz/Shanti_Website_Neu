

import { useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { VideoCard } from "./VideoCard";
import type { Entry, FilterGroup, YogaFilters } from "../lib/content";

type Key = "intensity" | "element";
type FinderEntry = { entry: Entry; href: string; collection: string; isVideo: boolean };

const matchers: Record<Key, (entry: Entry, value: string) => boolean> = {
  intensity: (entry, value) => entry.energyLevel === value || entry.energyLevel === "Mittel",
  element: (entry, value) => Boolean(entry.elements?.includes(value)),
};

export function PracticeFinder({ entries, filters, fallbackImage, videoFallbackImage }: {
  entries: FinderEntry[];
  filters: YogaFilters;
  fallbackImage?: string;
  videoFallbackImage?: string;
}) {
  const [selected, setSelected] = useState<Partial<Record<Key, string>>>({});
  const [showAll, setShowAll] = useState(false);
  const group = (key: Key): FilterGroup | undefined => {
    const value = filters[key];
    const options = value?.options?.filter((option) => option.enabled !== false) ?? [];
    return value?.enabled && options.length ? { ...value, options } : undefined;
  };
  const intensity = group("intensity"), element = group("element");
  const matches = useMemo(() => entries.filter(({ entry }) => (Object.keys(selected) as Key[]).every((key) => !selected[key] || matchers[key](entry, selected[key] as string))), [entries, selected]);
  const visibleMatches = showAll ? matches : matches.slice(0, 4);
  const toggle = (key: Key, value: string) => {
    setShowAll(false);
    setSelected((current) => ({ ...current, [key]: current[key] === value ? undefined : value }));
  };
  const hasSelection = Object.values(selected).some(Boolean);

  const options = (key: Key, data: FilterGroup) => (
    <div className="option-grid" role="group" aria-label={data.title}>
      {data.options.map((option) => (
        <button type="button" className={`option-tile ${selected[key] === option.value ? "selected" : ""}`} aria-pressed={selected[key] === option.value} key={option.value} onClick={() => toggle(key, option.value)}>
          <strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {intensity || element ? (
        <div className={`finder ${intensity && element ? "finder-split" : ""}`}>
          {intensity ? (
            <section className="finder-step" aria-labelledby="finder-intensity">
              <span className="step-number">1</span>
              <h2 id="finder-intensity" className="step-heading">{intensity.title}</h2>
              {intensity.description ? <p className="step-copy">{intensity.description}</p> : null}
              <div className="energy-stack" role="group" aria-label={intensity.title}>
                {intensity.options.map((option) => (
                  <button type="button" className={`energy-card ${selected.intensity === option.value ? "selected" : ""}`} aria-pressed={selected.intensity === option.value} key={option.value} onClick={() => toggle("intensity", option.value)}>
                    <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
                    <i className="radio" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {element ? (
            <section className="finder-step" aria-label="Was brauchst du?">
              {intensity ? <span className="step-number">2</span> : null}
              <section className="finder-subsection" aria-labelledby="finder-element"><h2 id="finder-element" className="step-heading">{element.title}</h2>{element.description ? <p className="step-copy">{element.description}</p> : null}{options("element", element)}</section>
            </section>
          ) : null}
        </div>
      ) : null}
      {intensity || element ? (
        <section className="unsure-band">
          <p>Alle Filter sind freiwillig.</p>
          {hasSelection ? <button type="button" className="radio-label" onClick={() => { setSelected({}); setShowAll(false); }}>Alle Filter zurücksetzen</button> : null}
        </section>
      ) : null}
      <section className="section" aria-live="polite">
        <div className="section-heading"><div><p className="eyebrow">DEIN SANFTER START</p><h2>{matches.length ? `${matches.length} ${matches.length === 1 ? "passende Empfehlung" : "passende Empfehlungen"}` : "Ein eigener Moment für dich"}</h2>{!matches.length ? <p>Hier passt gerade nichts. Ändere deine Auswahl oder setze sie zurück.</p> : null}</div></div>
        <div className="grid grid-3">{visibleMatches.map(({ entry, href, collection, isVideo }) => isVideo
          ? <VideoCard entry={entry} href={href} fallbackImage={videoFallbackImage} key={`${collection}/${entry.slug}`} />
          : <ContentCard entry={entry} href={href} key={`${collection}/${entry.slug}`} icon="clock" fallbackImage={fallbackImage} />)}</div>
        {matches.length > visibleMatches.length ? <button type="button" className="button secondary show-more" onClick={() => setShowAll(true)}>Alle {matches.length} Empfehlungen zeigen</button> : null}
      </section>
    </>
  );
}
