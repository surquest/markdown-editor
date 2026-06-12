import { $inputRule, $node, $remark, $prose } from "@milkdown/kit/utils";
import { Node } from "@milkdown/kit/prose/model";
import { InputRule } from "@milkdown/kit/prose/inputrules";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import directive from "remark-directive";
import { EDIT_ICON_SVG } from "../icons";

const remarkDirective = $remark("remarkDirective", () => directive);

const directiveNode = $node("iframe", () => ({
  group: "block",
  atom: true,
  isolating: true,
  marks: "",
  attrs: {
    src: { default: null },
  },
  parseDOM: [
    {
      tag: "div.iframe-plugin-container",
      getAttrs: (dom) => ({
        src: (dom as HTMLElement).getAttribute("data-iframe-src"),
      }),
    },
    {
      tag: "iframe",
      getAttrs: (dom) => ({
        src: (dom as HTMLElement).getAttribute("src"),
      }),
    },
  ],
  toDOM: (node: Node) => [
    "div",
    {
      class: "iframe-plugin-container",
      style: "position: relative; margin: 1em 0;",
      "data-iframe-src": node.attrs.src,
    },
    [
      "button",
      {
        id: "iframe-edit-button",
        class: "plugin-control-button edit-btn",
        title: "Edit Iframe",
      },
      [
        "img",
        {
          src: EDIT_ICON_SVG,
          style: "width: 24px; height: 24px;",
          alt: "Edit Iframe",
        }
      ]
    ],
    [
      "div",
      {
        class: "iframe-overlay",
        style:
          "width: 100%; min-height: 400px; border: none; border-radius: 4px; overflow: hidden; pointer-events: auto;",
      },
      [
        "iframe",
        {
          ...node.attrs,
          contenteditable: "false",
          style: "width: 100%; height: 100%; min-height: 400px; border: none;",
        },
        0,
      ],
    ],
  ],
  parseMarkdown: {
    match: (node) => node.type === "leafDirective" && node.name === "iframe",
    runner: (state, node, type) => {
      state.addNode(type, { src: (node.attributes as { src: string }).src });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "iframe",
    runner: (state, node) => {
      state.addNode("leafDirective", undefined, undefined, {
        name: "iframe",
        attributes: { src: node.attrs.src },
      });
    },
  },
}));

const inputRule = $inputRule(
  (ctx) =>
    new InputRule(
      /::iframe\{src\="([^"]+)?"?\}/,
      (state, match, start, end) => {
        const [okay, src = ""] = match;
        const { tr } = state;
        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            directiveNode.type(ctx).create({ src }),
          );
        }

        return tr;
      },
    ),
);

const iframeEditPlugin = $prose(
  (ctx) =>
    new Plugin({
      key: new PluginKey("IFRAME_EDIT"),
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target as HTMLElement;
            const editBtn = target.closest("#iframe-edit-button");
            if (editBtn) {
              const container = target.closest(".iframe-plugin-container");
              if (container) {
                const src = container.getAttribute("data-iframe-src");
                const pos = view.posAtDOM(container, 0);

                document.dispatchEvent(
                  new CustomEvent("milkdown-iframe-edit", {
                    detail: { src, pos, ctx },
                  }),
                );

                event.preventDefault();
                event.stopPropagation();
                return true;
              }
            }
            return false;
          },
        },
      },
    }),
);

export const iframePlugin = [
  remarkDirective,
  directiveNode,
  inputRule,
  iframeEditPlugin,
];
