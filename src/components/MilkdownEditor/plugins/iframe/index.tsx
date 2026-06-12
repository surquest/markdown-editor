export * from './iframePlugin';
export { default as IframeDialog } from './IframeDialog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerIframeMenu = (advancedGroup: any) => {
  advancedGroup.addItem('iframe', {
    label: 'Iframe',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24"><path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12zm-2-2H5V8h14v8z"/></svg>`,
    onRun: (ctx: unknown) => {
      document.dispatchEvent(new CustomEvent('milkdown-iframe-insert', {
        detail: { ctx }
      }));
    }
  });
};
