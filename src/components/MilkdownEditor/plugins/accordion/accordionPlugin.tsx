import { $inputRule, $node, $remark, $prose } from "@milkdown/kit/utils";
import { Node } from "@milkdown/kit/prose/model";
import { InputRule } from "@milkdown/kit/prose/inputrules";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import directive from "remark-directive";
import { EDIT_ICON_SVG } from "../icons";
import { remark } from "remark";
import remarkHtml from "remark-html";

const remarkDirective = $remark("remarkDirective", () => directive);

const directiveNode = $node("accordion", () => ({
  group: "block",
  atom: true,
  isolating: true,
  marks: "",
  attrs: {
    title: { default: "Accordion Title" },
    icon: { default: "📌" },
    description: { default: "Accordion description goes here." },
  },
  parseDOM: [
    {
      tag: "div.accordion-plugin-container",
      getAttrs: (dom) => ({
        title: (dom as HTMLElement).getAttribute("data-title"),
        icon: (dom as HTMLElement).getAttribute("data-icon"),
        description: (dom as HTMLElement).getAttribute("data-description"),
      }),
    },
  ],
  toDOM: (node: Node) => {
    const isIconUrl = node.attrs.icon?.startsWith("http") || node.attrs.icon?.startsWith("data:");
    
    return [
      "div",
      {
        class: "accordion-plugin-container",
        style:
          "position: relative; margin: 1em 0; width: 100%; border: 1px solid #ddd; border-radius: 8px; background: #fff;",
        "data-title": node.attrs.title,
        "data-icon": node.attrs.icon,
        "data-description": node.attrs.description,
        "data-expanded": "false", // initial state
      },
      [
        "button",
        {
          id: "accordion-edit-button",
          class: "plugin-control-button edit-btn",
          title: "Edit Accordion",
        },
        [
          "img",
          {
            src: EDIT_ICON_SVG,
            style: "width: 24px; height: 24px;",
            alt: "Edit Accordion",
          },
        ],
      ],
      [
        "div",
        {
          class: "accordion-header",
          contenteditable: "false",
          style:
            "display: flex; align-items: center; padding: 12px 16px; background: #f9f9f9; cursor: pointer; border-bottom: 1px solid transparent; user-select: none; border-radius: 8px 8px 0 0;",
        },
        [
          "span",
          {
            class: "accordion-icon",
            style: "margin-right: 12px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;",
          },
          isIconUrl 
            ? ["img", { src: node.attrs.icon, style: "max-width: 100%; max-height: 100%; object-fit: contain;" }]
            : node.attrs.icon || "",
        ],
        [
          "span",
          {
            class: "accordion-title",
            style: "font-weight: 600; flex-grow: 1; margin-right: 32px;",
          },
          node.attrs.title || "Untitled",
        ],
        [
          "span",
          {
            class: "accordion-toggle-icon",
            style: "transition: transform 0.2s; display: inline-block;",
          },
          "▼",
        ],
      ],
      (() => {
        const bodyDiv = document.createElement("div");
        bodyDiv.className = "accordion-body";
        bodyDiv.contentEditable = "false";
        bodyDiv.setAttribute(
          "style",
          "display: none; padding: 16px; border-top: 1px solid #ddd; line-height: 1.6; color: #333; background: #fff;"
        );
        try {
          bodyDiv.innerHTML = remark()
            .use(remarkHtml)
            .processSync(node.attrs.description || "")
            .toString();
        } catch {
          bodyDiv.innerText = node.attrs.description || "";
        }
        return bodyDiv;
      })(),
    ];
  },
  parseMarkdown: {
    match: (node) => node.type === "leafDirective" && node.name === "accordion",
    runner: (state, node, type) => {
      state.addNode(type, { 
        title: (node.attributes as { title?: string }).title || "",
        icon: (node.attributes as { icon?: string }).icon || "",
        description: (node.attributes as { description?: string }).description || "",
      });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "accordion",
    runner: (state, node) => {
      state.addNode("leafDirective", undefined, undefined, {
        name: "accordion",
        attributes: { 
          title: node.attrs.title,
          icon: node.attrs.icon,
          description: node.attrs.description,
        },
      });
    },
  },
}));

const inputRule = $inputRule(
  (ctx) =>
    new InputRule(
      /::accordion\{title\="([^"]*)"?\s*icon\="([^"]*)"?\s*description\="([^"]*)"?\}/,
      (state, match, start, end) => {
        const [okay, title = "", icon = "", description = ""] = match;
        const { tr } = state;
        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            directiveNode.type(ctx).create({ title, icon, description }),
          );
        }

        return tr;
      },
    ),
);

const accordionInteractionPlugin = $prose(
  (ctx) =>
    new Plugin({
      key: new PluginKey("ACCORDION_INTERACTION"),
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target as HTMLElement;
            
            // Handle edit button
            const editBtn = target.closest("#accordion-edit-button");
            if (editBtn) {
              const container = target.closest(".accordion-plugin-container");
              if (container) {
                const title = container.getAttribute("data-title");
                const icon = container.getAttribute("data-icon");
                const description = container.getAttribute("data-description");
                const pos = view.posAtDOM(container, 0);

                document.dispatchEvent(
                  new CustomEvent("milkdown-accordion-edit", {
                    detail: { title, icon, description, pos, ctx },
                  }),
                );

                event.preventDefault();
                event.stopPropagation();
                return true;
              }
            }

            // Handle accordion toggle
            const header = target.closest(".accordion-header") as HTMLElement;
            if (header) {
              const container = header.closest(".accordion-plugin-container") as HTMLElement;
              const body = container.querySelector(".accordion-body") as HTMLElement;
              const toggleIcon = container.querySelector(".accordion-toggle-icon") as HTMLElement;
              
              if (container && body && toggleIcon) {
                const isExpanded = container.getAttribute("data-expanded") === "true";
                
                if (isExpanded) {
                  container.setAttribute("data-expanded", "false");
                  body.style.display = "none";
                  header.style.borderBottomColor = "transparent";
                  toggleIcon.style.transform = "rotate(0deg)";
                } else {
                  container.setAttribute("data-expanded", "true");
                  body.style.display = "block";
                  header.style.borderBottomColor = "#ddd";
                  toggleIcon.style.transform = "rotate(180deg)";
                }
                
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

export const accordionPlugin = [
  remarkDirective,
  directiveNode,
  inputRule,
  accordionInteractionPlugin,
];
