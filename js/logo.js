// PalomoProgram mark: minimalist German Shepherd in profile.
export const MARK_PATH = 'M18 96 L22 68 L27 52 L31 42 L33 12 L43 34 L49 32 L54 6 L62 34 L67 40 L71 47 L87 53 L98 57 L99 62 L94 65 L88 66 L84 70 L77 73 L69 77 L65 84 L63 96 Z';
export const EYE_PATH = 'M70 49 L75 52 L72 55 L67 53 Z';
export const COLLAR_PATH = 'M22 84 L64 84 L63.5 88 L21.5 88 Z';

export function markSVG({ size = 40, fill = 'var(--accent)', cut = 'var(--bg)', className = '' } = {}) {
  return `<svg class="mark ${className}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <path fill="${fill}" d="${MARK_PATH}"/>
    <path fill="${cut}" d="${EYE_PATH}"/>
    <path fill="${cut}" d="${COLLAR_PATH}"/>
  </svg>`;
}

export function appIconSVG(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0F1115"/>
  <g transform="translate(8 6) scale(0.84)">
    <path fill="#E3A72F" d="${MARK_PATH}"/>
    <path fill="#0F1115" d="${EYE_PATH}"/>
    <path fill="#0F1115" d="${COLLAR_PATH}"/>
  </g>
</svg>`;
}
