'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { replaceAll } from '@milkdown/utils';
import { listener, listenerCtx } from '@milkdown/plugin-listener';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface MilkdownContextType {
  crepeRef: React.MutableRefObject<Crepe | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  
  // Live Markdown State
  liveMarkdown: string;
  setMarkdownContent: (markdown: string) => void;

}

import { registerCarouselMenu } from './plugins/carousel';
import { registerIframeMenu } from './plugins/iframe';
import { registerAccordionMenu } from './plugins/accordion';
import { registerCardsMenu } from './plugins/cards';

const MilkdownContext = createContext<MilkdownContextType | undefined>(undefined);

export function useMilkdownContext() {
  const context = useContext(MilkdownContext);
  if (!context) {
    throw new Error('useMilkdownContext must be used within a MilkdownProvider');
  }
  return context;
}

export interface MilkdownProviderProps {
  content?: string;
  plugins?: unknown[];
  children: ReactNode;
}

export function MilkdownProvider({ content, plugins = [], children }: MilkdownProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);

  // Live Markdown State
  const [liveMarkdown, setLiveMarkdown] = useState(content || '');

  const setMarkdownContent = (newMarkdown: string) => {
    if (newMarkdown !== liveMarkdown) {
      setLiveMarkdown(newMarkdown);
      if (crepeRef.current && crepeRef.current.editor) {
        // Prevent empty newlines at the end from jumping/getting stripped unnecessarily 
        // Note: Milkdown's replaceAll can be aggressive, so we replace carefully.
        crepeRef.current.editor.action(replaceAll(newMarkdown));
      }
    }
  };

  useEffect(() => {
    let active = true;

    async function initEditor() {
      if (!containerRef.current) return;

      const crepe = new Crepe({
        root: containerRef.current,
        defaultValue: content || '',
        featureConfigs: {
          [CrepeFeature.ImageBlock]: {
            onUpload: async (file: File) => {
              const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(f);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
              });

              const dataUrl = await toBase64(file);
              const id = crypto.randomUUID();
              const payload = {
                id,
                name: file.name,
                dataUrl,
                type: file.type,
                size: file.size
              };

              const response = await fetch('/images', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });

              if (!response.ok) {
                throw new Error('Upload failed');
              }

              return `/images/${id}`;
            }
          },
          [CrepeFeature.BlockEdit]: {
            buildMenu: (builder: unknown) => {
              const b = builder as { getGroup: (g: string) => { addItem: (id: string, options: unknown) => void } | undefined };
              const advancedGroup = b.getGroup('advanced');
              if (advancedGroup) {
                registerIframeMenu(advancedGroup);
                registerCarouselMenu(advancedGroup);
                registerAccordionMenu(advancedGroup);
                registerCardsMenu(advancedGroup);
              }
            }
          }
        }
      });

      crepe.editor.config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          // Remove extra empty lines between list items that Milkdown's serializer may add
          const cleanedMarkdown = markdown.replace(/^([ \t]*(?:[-*+]|\d+\.)\s+[^\n]+)\n{2,}(?=[ \t]*(?:[-*+]|\d+\.)\s+)/gm, '$1\n');
          setLiveMarkdown(cleanedMarkdown);
        });
      }).use(listener);

      plugins.forEach(plugin => {
        crepe.editor.use(plugin as unknown as Parameters<typeof crepe.editor.use>[0]);
      });

      try {
        await crepe.create();
        if (active) {
          crepeRef.current = crepe;
        } else {
          crepe.destroy();
        }
      } catch (err) {
        console.error('Failed to initialize Milkdown:', err);
      }
    }

    initEditor();

    return () => {
      active = false;
      if (crepeRef.current) {
        crepeRef.current.destroy();
        crepeRef.current = null;
      }
    };
  }, [content, plugins]);

  const value = {
    crepeRef,
    containerRef,
    liveMarkdown,
    setMarkdownContent,
  };

  return (
    <MilkdownContext.Provider value={value}>
      {children}
    </MilkdownContext.Provider>
  );
}