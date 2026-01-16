// Global manual mock for Next.js Image used by tests
// This strips unsupported props (fetchPriority, unoptimized, fill, etc.) and renders a plain <img />
const React = require('react');

module.exports = {
  __esModule: true,
  default: function MockNextImage(props) {
    // Explicitly pick only allowed attributes to avoid passing Next.js-only props (fill, unoptimized, etc.)
    const { src, alt, className, width, height } = props;
    const resolvedSrc = typeof src === 'object' && src?.src ? src.src : src;

    const attrs = { src: resolvedSrc };
    if (alt !== undefined) attrs.alt = alt;
    if (className !== undefined) attrs.className = className;
    if (width !== undefined) attrs.width = width;
    if (height !== undefined) attrs.height = height;

    return React.createElement('img', attrs);
  },
};
