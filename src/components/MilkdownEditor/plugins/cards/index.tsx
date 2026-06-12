export * from './cardsPlugin';
export { default as CardsDialog } from './CardsDialog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerCardsMenu = (advancedGroup: any) => {
  advancedGroup.addItem('cards', {
    label: 'Cards Collection',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h280v-480H160v480Zm360 0h280v-480H520v480Z"/></svg>`,
    onRun: (ctx: unknown) => {
      document.dispatchEvent(new CustomEvent('milkdown-cards-insert', {
        detail: { ctx }
      }));
    }
  });
};