'use client';

import { useState } from 'react';
import type { MediaPresentation } from '@/types/api';

interface ProductGalleryProps {
  primaryImage?: MediaPresentation;
  gallery: MediaPresentation[];
  productName: string;
}

export function ProductGallery({ primaryImage, gallery, productName }: ProductGalleryProps) {
  const allImages = primaryImage ? [primaryImage, ...gallery] : gallery;
  const [activeIndex, setActiveIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="product-hero__primary-image">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-body" style={{ color: 'var(--color-text-tertiary)' }}>
            {productName}
          </span>
        </div>
      </div>
    );
  }

  const activeImage = allImages[activeIndex];

  return (
    <div className="product-hero__gallery">
      <div className="product-hero__primary-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          loading="eager"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {allImages.length > 1 && (
        <div className="product-hero__thumbnails" role="tablist" aria-label="Product images">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}${image.alt ? `: ${image.alt}` : ''}`}
              className={`product-hero__thumbnail ${index === activeIndex ? 'product-hero__thumbnail--active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
