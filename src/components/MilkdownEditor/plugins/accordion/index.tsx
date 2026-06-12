export * from './accordionPlugin';
export { default as AccordionDialog } from './AccordionDialog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerAccordionMenu = (advancedGroup: any) => {
  advancedGroup.addItem('accordion', {
    label: 'Accordion',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-240H200v240Zm0-320h560v-240H200v240ZM480-264l104-104H376l104 104Zm0-320l104-104H376l104 104Z"/></svg>`,
    onRun: (ctx: unknown) => {
      document.dispatchEvent(new CustomEvent('milkdown-accordion-insert', {
        detail: { ctx }
      }));
    }
  });
};