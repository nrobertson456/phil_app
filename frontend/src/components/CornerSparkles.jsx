import React, { useMemo } from 'react';

const SPARKLE_COUNT = 24;
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function createSparkles() {
  return Array.from({ length: SPARKLE_COUNT }, (_, index) => {
    const corner = CORNERS[index % CORNERS.length];
    const baseOffset = randomInRange(0, 22);
    const secondaryOffset = randomInRange(0, 24);

    const size = randomInRange(10, 22);
    const delay = randomInRange(0, 8);
    const duration = randomInRange(5, 11);
    const rotateDuration = randomInRange(12, 24);

    const style = {
      '--sparkle-size': `${size}px`,
      '--sparkle-delay': `${delay.toFixed(2)}s`,
      '--sparkle-duration': `${duration.toFixed(2)}s`,
      '--sparkle-rotate-duration': `${rotateDuration.toFixed(1)}s`,
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

    return { id: index, style };
  });
}

export default function CornerSparkles() {
  const sparkles = useMemo(createSparkles, []);

  return (
    <div className="sparkle-layer" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle-cross"
          style={sparkle.style}
        >
          <span className="sparkle-cross-inner" />
        </div>
      ))}
    </div>
  );
}
