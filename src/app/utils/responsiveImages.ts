type ResponsiveImageMeta = {
  width: number;
  height: number;
  widths: number[];
};

const responsiveImageMeta: Record<string, ResponsiveImageMeta> = {
  '/images/profile-1770267166986-8045a8ad.webp': {
    width: 1628,
    height: 2048,
    widths: [480, 768, 1200],
  },
  '/images/profile-1770267153868-d79c92d4.webp': {
    width: 1400,
    height: 1021,
    widths: [480, 768, 1200],
  },
  '/images/urfu-social-psychology.webp': {
    width: 967,
    height: 666,
    widths: [480, 768],
  },
  '/images/cbt.webp': {
    width: 1400,
    height: 1021,
    widths: [480, 768, 1200],
  },
  '/images/eastern-europe-psychoanalysis.webp': {
    width: 1050,
    height: 745,
    widths: [480, 768],
  },
  '/images/institute-psychotherapy-psychoanalysis.webp': {
    width: 871,
    height: 624,
    widths: [480, 768],
  },
  '/images/association.webp': {
    width: 1280,
    height: 819,
    widths: [480, 768, 1200],
  },
};

const ensureExtension = (src: string) => (/\.[a-zA-Z0-9]+$/.test(src) ? src : `${src}.webp`);

const normalizeBaseSrc = (src: string) => {
  const withExt = ensureExtension(src);
  return withExt.replace(/-\d+w(\.[a-zA-Z0-9]+)$/i, '$1');
};

const addWidthSuffix = (src: string, width: number) =>
  normalizeBaseSrc(src).replace(/(\.[a-zA-Z0-9]+)$/, `-${width}w$1`);

export const getResponsiveMeta = (src: string) => responsiveImageMeta[normalizeBaseSrc(src)];

export const buildSrcSet = (src: string, widths: number[]) =>
  widths.map((width) => `${addWidthSuffix(src, width)} ${width}w`).join(', ');

export const normalizeImageSrc = (src: string) => normalizeBaseSrc(src);
