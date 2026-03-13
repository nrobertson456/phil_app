import React, { useMemo } from 'react';

const STAR_COUNT = 20;
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function createStars() {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const corner = CORNERS[index % CORNERS.length];
    const baseOffset = randomInRange(0, 14); // how far in from each edge (0–14%)
    const secondaryOffset = randomInRange(0, 18);

    const style = {
      animationDelay: `${randomInRange(0, 6).toFixed(2)}s`,
      animationDuration: `${randomInRange(3.5, 7.5).toFixed(2)}s`,
    };

    switch (corner) {
      case 'top-left':
        style.top = `${baseOffset}%`;
        style.left = `${secondaryOffset}%`;
        break;
      case 'top-right':
        style.top = `${baseOffset}%`;
        style.right = `${secondaryOffset}%`;
        break;
      case 'bottom-left':
        style.bottom = `${baseOffset}%`;
        style.left = `${secondaryOffset}%`;
        break;
      case 'bottom-right':
      default:
        style.bottom = `${baseOffset}%`;
        style.right = `${secondaryOffset}%`;
        break;
    }

    // Slight size variation per star
    const size = randomInRange(5, 9);
    style.width = `${size}px`;
    style.height = `${size}px`;

    return { id: index, style };
  });
}

export default function CornerSparkles() {
  const stars = useMemo(createStars, []);

  return (
    <div className="sparkle-layer" aria-hidden="true">
      {stars.map((star) => (
        <div key={star.id} className="sparkle-star" style={star.style} />
      ))}
    </div>
  );
}

