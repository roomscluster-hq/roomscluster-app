function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// The picked color is treated as shade "600" — everything else is
// generated as a lightness/saturation offset relative to it, so the
// whole ramp feels proportionate no matter what color an Owner picks.
const SHADE_STEPS: Record<string, { lOffset: number; sMultiplier: number }> = {
  '50': { lOffset: 50, sMultiplier: 0.55 },
  '100': { lOffset: 42, sMultiplier: 0.65 },
  '200': { lOffset: 32, sMultiplier: 0.75 },
  '300': { lOffset: 20, sMultiplier: 0.85 },
  '400': { lOffset: 10, sMultiplier: 0.92 },
  '500': { lOffset: 4, sMultiplier: 0.96 },
  '600': { lOffset: 0, sMultiplier: 1 },
  '700': { lOffset: -8, sMultiplier: 1.05 },
  '800': { lOffset: -16, sMultiplier: 1.08 },
  '900': { lOffset: -24, sMultiplier: 1.1 },
};

export function generateColorRamp(baseHex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(baseHex);
  const ramp: Record<string, string> = {};

  for (const [shade, { lOffset, sMultiplier }] of Object.entries(SHADE_STEPS)) {
    const newL = clamp(l + lOffset, 3, 97);
    const newS = clamp(s * sMultiplier, 0, 100);
    ramp[shade] = hslToHex(h, newS, newL);
  }

  return ramp;
}