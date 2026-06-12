'use client';

import React, { useEffect, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeReact from 'rehype-react';
import * as jsxRuntime from 'react/jsx-runtime';
import { visit } from 'unist-util-visit';
import { Typography, Link, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import 'highlight.js/styles/github.css';

import { CustomAccordion } from './CustomAccordion';
import { CustomIframe } from './CustomIframe';
import { CustomCarousel } from './CustomCarousel';
import { CustomCards } from './CustomCards';
import { CustomCard } from './CustomCard';

export interface HtmlSourceRendererProps {
  markdown: string;
}

function remarkDirectiveToHast() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {});
        data.hName = node.name;
        data.hProperties = node.attributes || {};
      }
    });
  };
}

export default function HtmlSourceRenderer({ markdown }: HtmlSourceRendererProps) {
  const [content, setContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    let active = true;
    const processMarkdown = async () => {
      try {
        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkDirective)
          .use(remarkDirectiveToHast)
          .use(remarkRehype)
          .use(rehypeHighlight)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .use(rehypeReact, {
            Fragment: jsxRuntime.Fragment,
            jsx: jsxRuntime.jsx,
            jsxs: jsxRuntime.jsxs,
            components: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              h1: ({ paragraph, ...props }: any) => <Typography variant="h3" fontWeight={700} gutterBottom {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              h2: ({ paragraph, ...props }: any) => <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mt: 4 }} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              h3: ({ paragraph, ...props }: any) => <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mt: 3 }} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              h4: ({ paragraph, ...props }: any) => <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              p: (props: any) => {
                const { paragraph, ...rest } = props;
                return <Typography variant="body1" paragraph={true} sx={{ lineHeight: 1.7 }} {...rest} />;
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              a: (props: any) => {
                // Determine if this is a raw link meant to be an image (for Carousel compatibility)
                const isImageLink = typeof props.children === 'string' && (props.children.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || props.children.startsWith("https://fastly.picsum.photos"));
                if (isImageLink) {
                 return <Box component="img" src={props.href} sx={{ display: 'block', margin: '0 auto', maxWidth: '100%', objectFit: 'contain' }} alt="Rendered Link" />
                }
                return <Link color="primary" {...props} />
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              table: (props: any) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 4 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ width: 'max-content', maxWidth: '100%', overflowX: 'auto', border: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                    <Table {...props} />
                  </TableContainer>
                </Box>
              ),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              thead: (props: any) => <TableHead sx={{ backgroundColor: 'background.paper'}} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tbody: (props: any) => <TableBody {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tr: (props: any) => <TableRow {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              th: (props: any) => <TableCell sx={{ fontWeight: 600, backgroundColor: 'action.hover' }} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              td: (props: any) => <TableCell {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              img: (props: any) => (
                <Box component="img" sx={{ display: 'block', margin: '0 auto', maxWidth: '100%', objectFit: 'contain' }} {...props} />
              ),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              li: (props: any) => {
                // Determine if this is a raw link string meant to be an image (for Carousel compatibility inside lists context if not parsed as <a>)
                const extractText = (val: any): string => {
                    if (typeof val === 'string') return val;
                    if (Array.isArray(val)) return val.map(extractText).join('');
                    if (val && typeof val === 'object' && val.props && val.props.children) return extractText(val.props.children);
                    if (val && typeof val === 'object' && val.props && val.props.href) return extractText(val.props.href); // Handle intercepted <a> tag
                    return '';
                };

                const textChild = extractText(props.children);
                const isUrlLike = textChild.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || textChild.includes('fastly.picsum.photos');
                
                if (isUrlLike && textChild.startsWith('http')) {
                  return (
                    <li {...props}>
                        <img src={textChild} alt={textChild} />
                    </li>
                  )
                }
                return <li {...props} />;
              },
              accordion: CustomAccordion,
              iframe: CustomIframe,
              carousel: CustomCarousel,
              cards: CustomCards,
              card: CustomCard,
            }
          });

        const vfile = await processor.process(markdown);
        if (active) {
          setContent(vfile.result as React.ReactNode);
        }
      } catch (error) {
        console.error('Error rendering markdown to react', error);
        if (active) {
          setContent(<Typography color="error">Error rendering content.</Typography>);
        }
      }
    };
    processMarkdown();

    return () => {
      active = false;
    };
  }, [markdown]);

  return (
    <Box className="milkdown-rendered-content" sx={{ pb: 8 }}>
      {content}
    </Box>
  );
}
