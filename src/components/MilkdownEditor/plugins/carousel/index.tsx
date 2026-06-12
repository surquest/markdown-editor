export * from './carouselPlugin';
export { default as CarouselDialog } from './CarouselDialog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerCarouselMenu = (advancedGroup: any) => {
  advancedGroup.addItem('carousel', {
    label: 'Carousel',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24"><path d="M4 6h16v12H4zm2 2v8h12V8z"/><path d="M8 10h8v4H8z"/></svg>`,
    onRun: (ctx: unknown) => {
      document.dispatchEvent(new CustomEvent('milkdown-carousel-insert', {
        detail: { ctx }
      }));
    }
  });
};
