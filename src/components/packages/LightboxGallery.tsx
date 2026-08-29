import React, { useState } from "react"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import LazyImage from "@/components/ui/LazyImage"

export interface LightboxGalleryProps {
  images: { src: string; alt: string; title?: string }[]
}

export function LightboxGallery({ images }: LightboxGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const navigateLeft = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  const navigateRight = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  return (
    <div className="space-y-4">
      {/* Grid view */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-[4/3] rounded-luxury-sm overflow-hidden border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A25A]/50"
          >
            <LazyImage src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Dialog Overlay */}
      {selectedIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer"
        >
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4 text-white">
            <span className="text-xs font-poppins">{`${selectedIndex + 1} / ${images.length}`}</span>
            <button onClick={closeLightbox} className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer" aria-label="Close lightbox">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Stage */}
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
            {/* Nav Left */}
            <button
              onClick={navigateLeft}
              className="absolute left-2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer z-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="max-w-full max-h-full object-contain rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Nav Right */}
            <button
              onClick={navigateRight}
              className="absolute right-2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer z-50"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Description Footer */}
          {images[selectedIndex].title && (
            <div className="absolute bottom-6 text-center text-white px-6 py-2 bg-black/60 rounded backdrop-blur-sm border border-white/5">
              <p className="text-sm font-serif font-light">{images[selectedIndex].title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default LightboxGallery
