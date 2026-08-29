// Route prefetch helpers for common navigation targets.
// This improves perceived interaction responsiveness by warming up lazy-loaded chunks.
export const preloadGuides = () => {
  import('@/pages/guides/GuidesIndex');
  import('@/pages/guides/Guide');
};

export const preloadBlog = () => {
  import('@/pages/Blog');
};
