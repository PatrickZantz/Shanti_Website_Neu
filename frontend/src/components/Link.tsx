import type { AnchorHTMLAttributes } from "react";

// Ersatz für next/link: einfache Anker, die Navigation übernimmt der Browser.
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a {...props} />;
}
