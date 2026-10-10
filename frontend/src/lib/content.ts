import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Inhalte liegen als Markdown/JSON in frontend/content (siehe README).
const contentDir = path.resolve(process.cwd(), "content");

export type Entry = {
  title: string;
  slug: string;
  pageType?: string;
  description?: string;
  excerpt?: string;
  energyLevel?: string;
  elements?: string[];
  duration?: number | string;
  category?: string;
  emotionalState?: string;
  recommendation?: string;
  type?: string;
  difficulty?: string;
  image?: string;
  coverImage?: string;
  videoUrl?: string;
  videoFile?: string;
  thumbnail?: string;
  videoDuration?: string;
  videoDescription?: string;
  author?: string;
  contactEmail?: string;
  metaTitle?: string;
  metaDescription?: string;
  date?: string;
  body: string;
};

function readJson<T>(file: string, fallback?: T): T {
  const full = path.join(contentDir, file);
  if (!fs.existsSync(full)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Inhaltsdatei fehlt: content/${file}`);
  }
  return JSON.parse(fs.readFileSync(full, "utf8")) as T;
}

export function getEntries(collection: string): Promise<Entry[]> {
  const folder = path.join(contentDir, collection);
  const files = fs.existsSync(folder) ? fs.readdirSync(folder).filter((file) => file.endsWith(".md")) : [];
  const entries = files.map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(folder, file), "utf8"));
    const entry: Record<string, unknown> = { ...data };
    if (entry.date instanceof Date) entry.date = entry.date.toISOString();
    if (typeof entry.duration === "string" && /^\d+$/.test(entry.duration)) entry.duration = Number(entry.duration);
    entry.slug = data.slug || file.replace(/\.md$/, "");
    entry.title = data.title || "Ohne Titel";
    entry.body = content.trim();
    return entry as unknown as Entry;
  });
  return Promise.resolve(entries.sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : a.title.localeCompare(b.title))));
}

export async function getEntry(collection: string, slug: string) {
  return (await getEntries(collection)).find((entry) => entry.slug === slug);
}

export type FilterOption = { value: string; label: string; description?: string; image?: string; enabled?: boolean };
export type FilterGroup = { enabled: boolean; title: string; description?: string; options: FilterOption[] };
export type YogaFilters = { intensity: FilterGroup; element: FilterGroup };
export type ToolState = { name: string; detail: string; image?: string };
export type SiteImages = { hero?: string; ornament?: string; railArt?: string; bandVase?: string; bandLeaves?: string; fallbacks: Record<string, string | undefined> };
export type SiteSettings = { brand_name: string; tagline: string; site_name: string; description: string; rail_note: string; footer_text: string };
export type NavItem = { placement: "rail" | "top" | "footer"; label: string; note?: string; href: string; icon?: string; opens_rail?: boolean; sort?: number };
export type Intro = { eyebrow: string; title: string; lead: string; metaTitle?: string; metaDescription?: string; body: string };

const emptyGroup: FilterGroup = { enabled: false, title: "", options: [] };
export const getYogaFilters = () => Promise.resolve(readJson<YogaFilters>("yoga-filters.json", { intensity: emptyGroup, element: emptyGroup }));
export const getToolStates = () => Promise.resolve(readJson<{ states: ToolState[] }>("tool-states.json", { states: [] }).states);

const site = () => readJson<Record<string, string | undefined>>("site.json");

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = site();
  const text = (key: string) => row[key] ?? "";
  return { brand_name: text("brand_name"), tagline: text("tagline"), site_name: text("site_name"), description: text("description"), rail_note: text("rail_note"), footer_text: text("footer_text") };
}

export async function getSiteImages(): Promise<SiteImages> {
  const row = site();
  return {
    hero: row.hero, ornament: row.ornament, railArt: row.rail_art, bandVase: row.band_vase, bandLeaves: row.band_leaves,
    fallbacks: Object.fromEntries(["yoga", "tools", "routines", "challenges", "community", "videos"].map((name) => [name, row[`fallback_${name}`]])),
  };
}

export const getNavigation = async (): Promise<NavItem[]> => readJson<NavItem[]>("navigation.json").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

// Titel, Einleitung und Meta-Angaben einer Seite aus content/pages.
export async function getIntro(slug: string): Promise<Intro> {
  const page = await getEntry("pages", slug);
  if (!page) throw new Error(`Seite "${slug}" fehlt in content/pages.`);
  return { eyebrow: page.pageType || "", title: page.title, lead: page.description || "", metaTitle: page.metaTitle, metaDescription: page.metaDescription, body: page.body };
}

export function getVideoEmbed(url?: string) {
  if (!url) return undefined;
  const bare = url.trim().match(/^(\d+)(?:\/([\w]+))?$/);
  if (bare) return `https://player.vimeo.com/video/${bare[1]}?dnt=1${bare[2] ? `&h=${bare[2]}` : ""}`;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return undefined;
    const host = parsed.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host) || host === "youtu.be") {
      const videoId = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).at(-1);
      return videoId && /^[\w-]+$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : undefined;
    }
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const videoId = parts.find((part) => /^\d+$/.test(part));
      const hash = parsed.searchParams.get("h") || (videoId && parts[parts.indexOf(videoId) + 1]?.match(/^\w+$/)?.[0]);
      return videoId ? `https://player.vimeo.com/video/${videoId}?dnt=1${hash ? `&h=${hash}` : ""}` : undefined;
    }
    if (host === "iframe.videodelivery.net" || host === "cloudflarestream.com" || host.endsWith(".cloudflarestream.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).at(-1);
      return videoId && /^[\w-]+$/.test(videoId) ? `https://iframe.videodelivery.net/${videoId}` : undefined;
    }
  } catch {
    return undefined;
  }
}