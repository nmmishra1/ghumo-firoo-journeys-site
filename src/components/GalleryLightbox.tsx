import React, { useEffect, useState } from "react";
  import { pushEvent } from "@/lib/analytics";

  type ImageItem = { src: string; alt?: string; width?: number; height?: number };

  type Props = {
    images: ImageItem[];
    columns?: 2 | 3 | 4;
    thumbAspectRatio?: string; // CSS aspect-ratio, e.g., "4 / 3"
    className?: string;
  };

  const GalleryLightbox: React.FC<Props> = ({ images, columns = 3, thumbAspectRatio = "4 / 3", className = "" }) => {
    const [open, setOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === "Escape") setOpen(false);
        if (e.key === "ArrowRight") setIdx((i) => Math.min(images.length - 1, i + 1));
        if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, images.length]);

    const openAt = (i: number) => {
      setIdx(i);
      setOpen(true);
      pushEvent("gallery_open", { index: i });
    };

    const gridCols =
      columns === 4 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

    return (
      <>
        <div className={["grid gap-3", gridCols, className].join(" ")} role="list">
          {images.map((img, i) => (
            <button
              key={i}
              className="relative overflow-hidden rounded-lg bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              onClick={() => openAt(i)}
              role="listitem"
              aria-label={`Open image ${i + 1}`}
              style={{ aspectRatio: thumbAspectRatio }}
            >
              <img
                src={img.src}
                alt={img.alt || "Gallery image"}
                loading="lazy"
                width={img.width || 600}
                height={img.height || 400}
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </button>
          ))}
        </div>

        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
          >
            <button
              className="absolute right-5 top-4 text-3xl text-white/90 hover:text-white"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 select-none px-3 py-2 text-5xl text-white/80 hover:text-white disabled:opacity-40"
              aria-label="Previous"
              disabled={idx === 0}
              onClick={(e) => {
                e.stopPropagation();
                setIdx((i) => Math.max(0, i - 1));
              }}
            >
              ‹
            </button>

            <img
              className="max-h-[86vh] max-w-[92vw] rounded-lg shadow-2xl"
              src={images[idx].src}
              alt={images[idx].alt || "Gallery image"}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 select-none px-3 py-2 text-5xl text-white/80 hover:text-white disabled:opacity-40"
              aria-label="Next"
              disabled={idx === images.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setIdx((i) => Math.min(images.length - 1, i + 1));
              }}
            >
              ›
            </button>
          </div>
        )}
      </>
    );
  };

  export default GalleryLightbox;