import React, { useRef } from 'react';

const TRAIL_COUNT = 10;

export default function Fairy({ onComplete }) {
  const containerRef = useRef(null);

  const handleAnimationEnd = (e) => {
    if (e.target !== containerRef.current) return;
    if (e.animationName === 'fairy-fly') onComplete?.();
  };

  return (
    <div
      ref={containerRef}
      className="fairy-wrap"
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <div className="fairy-trail">
        {Array.from({ length: TRAIL_COUNT }, (_, i) => (
          <span
            key={i}
            className="fairy-trail-dot"
            style={{
              '--trail-index': i,
              '--trail-total': TRAIL_COUNT,
            }}
          />
        ))}
      </div>

      <div className="fairy-figure">
        <svg
          className="fairy-svg"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="fairy-aura" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="rgba(255, 236, 179, 0.35)" />
              <stop offset="50%" stopColor="rgba(255, 228, 163, 0.12)" />
              <stop offset="100%" stopColor="rgba(242, 199, 107, 0)" />
            </radialGradient>
            <filter id="fairy-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="fairy-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.4" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <linearGradient id="fairy-dress" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="40%" stopColor="rgba(255, 252, 240, 0.98)" />
              <stop offset="100%" stopColor="rgba(255, 236, 179, 0.9)" />
            </linearGradient>
            <linearGradient id="fairy-wing-main" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.92)" />
              <stop offset="50%" stopColor="rgba(255, 248, 220, 0.85)" />
              <stop offset="100%" stopColor="rgba(242, 199, 107, 0.5)" />
            </linearGradient>
            <linearGradient id="fairy-wing-vein" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 236, 179, 0.6)" />
              <stop offset="100%" stopColor="rgba(199, 156, 74, 0.4)" />
            </linearGradient>
            <linearGradient id="fairy-skin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="rgba(255, 250, 240, 0.98)" />
            </linearGradient>
          </defs>

          <ellipse cx="60" cy="62" rx="42" ry="52" fill="url(#fairy-aura)" />

          <g filter="url(#fairy-glow)">
            <path
              d="M22 38 Q8 48 12 72 Q18 88 28 78 Q24 58 22 38"
              fill="url(#fairy-wing-main)"
              stroke="url(#fairy-wing-vein)"
              strokeWidth="0.5"
              strokeOpacity="0.8"
            />
            <path
              d="M26 42 Q14 52 16 68 Q20 80 28 74 Q26 56 26 42"
              fill="rgba(255,255,255,0.75)"
              stroke="url(#fairy-wing-vein)"
              strokeWidth="0.35"
              strokeOpacity="0.7"
            />
            <path
              d="M28 44 Q20 52 22 62 Q24 70 28 66 Q28 52 28 44"
              fill="rgba(255,248,220,0.6)"
              stroke="rgba(199,156,74,0.35)"
              strokeWidth="0.3"
            />
          </g>

          <g filter="url(#fairy-glow)">
            <path
              d="M98 38 Q112 48 108 72 Q102 88 92 78 Q96 58 98 38"
              fill="url(#fairy-wing-main)"
              stroke="url(#fairy-wing-vein)"
              strokeWidth="0.5"
              strokeOpacity="0.8"
            />
            <path
              d="M94 42 Q106 52 104 68 Q100 80 92 74 Q94 56 94 42"
              fill="rgba(255,255,255,0.75)"
              stroke="url(#fairy-wing-vein)"
              strokeWidth="0.35"
              strokeOpacity="0.7"
            />
            <path
              d="M92 44 Q100 52 98 62 Q96 70 92 66 Q92 52 92 44"
              fill="rgba(255,248,220,0.6)"
              stroke="rgba(199,156,74,0.35)"
              strokeWidth="0.3"
            />
          </g>

          <g filter="url(#fairy-soft)">
            <path
              d="M44 52 L52 52 L56 58 L54 108 Q52 118 60 120 Q68 118 66 108 L64 58 L68 52 L76 52 L72 58 L74 100 Q76 114 60 116 Q44 114 46 100 Z"
              fill="url(#fairy-dress)"
            />
            <path
              d="M48 50 Q60 48 72 50 L70 54 Q60 52 50 54 Z"
              fill="#fff"
            />
            <path
              d="M46 54 L74 54 L72 62 L68 70 L60 72 L52 70 L48 62 Z"
              fill="rgba(255,252,245,0.98)"
            />
          </g>

          <path
            d="M50 48 L60 46 L70 48 L68 52 L52 52 Z"
            fill="#fff"
            filter="url(#fairy-soft)"
          />

          <path
            d="M44 48 Q38 54 40 60 Q42 58 48 52"
            fill="url(#fairy-skin)"
            filter="url(#fairy-soft)"
          />
          <path
            d="M76 48 Q82 54 80 60 Q78 58 72 52"
            fill="url(#fairy-skin)"
            filter="url(#fairy-soft)"
          />

          <ellipse cx="60" cy="38" rx="6" ry="8" fill="url(#fairy-skin)" filter="url(#fairy-soft)" />
          <circle cx="60" cy="22" r="10" fill="url(#fairy-skin)" filter="url(#fairy-glow)" />
          <path
            d="M50 18 Q48 28 52 38 Q56 32 54 20 Q52 16 50 18"
            fill="rgba(255, 236, 179, 0.4)"
            filter="url(#fairy-soft)"
          />
          <path
            d="M70 18 Q72 28 68 38 Q64 32 66 20 Q68 16 70 18"
            fill="rgba(255, 236, 179, 0.4)"
            filter="url(#fairy-soft)"
          />
        </svg>
      </div>
    </div>
  );
}
