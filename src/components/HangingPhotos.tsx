import React from 'react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { handleImageError } from '../utils/imageFallback';
import './HangingPhotos.css';

interface HangingPhotoItem {
  id: string;
  storySlug: string;
  title: string;
  tagline: string;
  imageUrl: string;
  positionClass: string;
  rotateDeg: number;
  swayDuration: string;
  swayDelay: string;
  stringLength: number;
}

interface HangingPhotosProps {
  onPhotoClick?: (story: WeddingStory, imageIndex: number) => void;
  className?: string;
}

// 4 curated hanging photos with elevated positions and short strings to perfectly frame header without overlapping the showreel
const DEFAULT_HANGING_PHOTOS: HangingPhotoItem[] = [
  {
    id: 'hang-1',
    storySlug: 'jasraj-urmi',
    title: 'Jasraj & Urmi',
    tagline: 'Rajasthan Royal Heritage',
    imageUrl: couplesData[0]?.images[1]?.url || 'https://static.wixstatic.com/media/62230b_669876f3c423429a86a5811c0658ecb1~mv2.jpg',
    positionClass: 'hang-pos-top-left',
    rotateDeg: -7.5,
    swayDuration: '7.2s',
    swayDelay: '0s',
    stringLength: 32
  },
  {
    id: 'hang-2',
    storySlug: 'suchi-hira',
    title: 'Suchi & Hira',
    tagline: 'Mountain Twilight Vows',
    imageUrl: couplesData[1]?.images[2]?.url || 'https://static.wixstatic.com/media/62230b_94e35dd74b0948c2b7405232ba53ae3c~mv2.jpg',
    positionClass: 'hang-pos-flank-left',
    rotateDeg: 5.5,
    swayDuration: '6.5s',
    swayDelay: '1.2s',
    stringLength: 52
  },
  {
    id: 'hang-3',
    storySlug: 'paraj-mrinmoyee',
    title: 'Paraj & Mrinmoyee',
    tagline: 'Sublime Bengal Wedding',
    imageUrl: couplesData[2]?.images[0]?.url || 'https://static.wixstatic.com/media/62230b_a19d27376c7c4c3aa1c944ebbb7d9eb0~mv2.jpg',
    positionClass: 'hang-pos-top-right',
    rotateDeg: 8.5,
    swayDuration: '6.8s',
    swayDelay: '0.8s',
    stringLength: 30
  },
  {
    id: 'hang-4',
    storySlug: 'ankita-subhadeep',
    title: 'Ankita & Subhadeep',
    tagline: 'Agartala Heritage Vivah',
    imageUrl: couplesData[4]?.images[1]?.url || 'https://static.wixstatic.com/media/62230b_4bf03a070eb348f9855502c34bcbbdb5~mv2.jpg',
    positionClass: 'hang-pos-flank-right',
    rotateDeg: -6.2,
    swayDuration: '7.8s',
    swayDelay: '1.9s',
    stringLength: 54
  }
];

export const HangingPhotos: React.FC<HangingPhotosProps> = ({
  onPhotoClick,
  className = ''
}) => {
  const handleClick = (item: HangingPhotoItem) => {
    if (!onPhotoClick) return;
    const story = couplesData.find(c => c.slug === item.storySlug) || couplesData[0];
    onPhotoClick(story, 0);
  };

  return (
    <div
      className={`hanging-photos-layer ${className}`}
      aria-label="Gallery wall of hanging memories"
    >
      {DEFAULT_HANGING_PHOTOS.map((item) => (
        <div
          key={item.id}
          className={`hanging-photo-node ${item.positionClass}`}
          style={{
            '--hang-rotate': `${item.rotateDeg}deg`,
            '--hang-duration': item.swayDuration,
            '--hang-delay': item.swayDelay,
            '--string-len': `${item.stringLength}px`
          } as React.CSSProperties}
        >
          {/* Subtle hanging twine string ascending towards the ceiling */}
          <div className="hanging-twine" aria-hidden="true" />

          {/* Golden metallic pin/clip securing the frame */}
          <div className="hanging-clip" aria-hidden="true">
            <span className="hanging-clip-inner" />
          </div>

          {/* Polaroid photo frame with tilt and realistic drop shadow */}
          <figure
            className="hanging-photo-card"
            onClick={() => handleClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(item);
              }
            }}
            aria-label={`View photo of ${item.title} — ${item.tagline}`}
          >
            <div className="hanging-photo-media">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="hanging-photo-img"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="hanging-photo-sheen" aria-hidden="true" />
            </div>

            <figcaption className="hanging-photo-caption">
              <span className="hanging-couple-name">{item.title}</span>
              <span className="hanging-couple-tag">{item.tagline}</span>
            </figcaption>
          </figure>
        </div>
      ))}
    </div>
  );
};
