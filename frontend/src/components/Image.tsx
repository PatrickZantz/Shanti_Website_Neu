import type { CSSProperties, ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

// Ersatz für next/image: "fill" füllt den positionierten Elterncontainer.
export default function Image({ fill, priority, style, alt = "", ...rest }: Props) {
  const fillStyle: CSSProperties | undefined = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined;
  return <img {...rest} alt={alt} loading={priority ? "eager" : "lazy"} style={{ ...fillStyle, ...style }} />;
}
