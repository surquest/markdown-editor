import { $inputRule, $node, $remark, $prose } from "@milkdown/kit/utils";
import { Node } from "@milkdown/kit/prose/model";
import { InputRule } from "@milkdown/kit/prose/inputrules";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import directive from "remark-directive";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { EDIT_ICON_SVG } from "../icons";

const remarkDirective = $remark("remarkDirective", () => directive);

export const cardsNode = $node("cards", () => ({
  group: "block",
  atom: true,
  isolating: true,
  marks: "",
  attrs: {
    columns: { default: "3" },
    target: { default: "_blank" },
    data: { default: "%5B%5D" }, // JSON stringified array of { title, image, description, link }
  },
  parseDOM: [
    {
      tag: "div.cards-plugin-container",
      getAttrs: (dom) => ({
        columns: (dom as HTMLElement).getAttribute("data-columns"),
        target: (dom as HTMLElement).getAttribute("data-target"),
        data: (dom as HTMLElement).getAttribute("data-cards"),
      }),
    },
  ],
  toDOM: (node: Node) => {
    let cards: any[] = [];
    try {
      cards = JSON.parse(decodeURIComponent(node.attrs.data || "%5B%5D"));
    } catch { }

    const cols = parseInt(node.attrs.columns, 10) || 3;

    const cardElements = cards.length > 0
      ? cards.map((card) => [
          "a",
          {
            class: "cards-item", // See globals.css for hover effects
            href: card.link || "#",
            target: node.attrs.target || "_blank",
            style: "display: flex; flex-direction: column; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; background: #fff;",
            "data-card-link": "true",
          },
          [
            "div",
            { style: "width: 100%; aspect-ratio: 16/9; background: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;" },
            card.image ? ["img", { src: card.image, style: "width: 100%; height: 100%; object-fit: cover;" }] : ["span", { style: "color: #999;" }, "No Image"]
          ],
          [
            "div",
            { style: "padding: 16px; display: flex; flex-direction: column; gap: 8px;" },
            ["h4", { style: "margin: 0; font-size: 16px; font-weight: 600; line-height: 1.3;" }, card.title || "Untitled"],
            ...(card.description ? [(() => {
              const p = document.createElement("div");
              p.setAttribute("style", "margin: 0; font-size: 14px; color: #666; line-height: 1.5;");
              try {
                p.innerHTML = remark().use(remarkHtml).processSync(card.description).toString();
              } catch {
                p.innerText = card.description;
              }
              return p;
            })()] : [])
          ]
        ])
      : [
          ["div", { style: `grid-column: span ${cols}; padding: 40px; text-align: center; color: #888; background: #f5f5f5; border-radius: 8px;` }, "No cards in collection. Click Edit to add."]
        ];

    return [
      "div",
      {
        class: "cards-plugin-container",
        style: "position: relative; margin: 1em 0; width: 100%; clear: both;",
        "data-columns": node.attrs.columns,
        "data-target": node.attrs.target,
        "data-cards": node.attrs.data,
      },
      [
        "button",
        {
          id: "cards-edit-button",
          class: "plugin-control-button edit-btn",
          contenteditable: "false",
          title: "Edit Collection",
        },
        [
          "img",
          { src: EDIT_ICON_SVG, style: "width: 24px; height: 24px;", alt: "Edit Collection" }
        ]
      ],
      [
        "div",
        {
          class: "cards-grid",
          contenteditable: "false",
          style: `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, ${100 / cols}% - 16px), 1fr)); gap: 16px; width: 100%;`,
        },
        ...cardElements
      ]
    ];
  },
  parseMarkdown: {
    match: (node) => (node.type === "leafDirective" || node.type === "containerDirective") && node.name === "cards",
    runner: (state, node, type) => {
      const attrs = (node.attributes || {}) as any;
      let cardsData: any[] = [];

      // Support old leafDirective format
      if (node.type === "leafDirective" && attrs.data) {
        try {
          cardsData = JSON.parse(decodeURIComponent(attrs.data));
        } catch { }
      }

      // Support new containerDirective format
      if (node.type === "containerDirective" && node.children) {
        const searchCards = (children: any[]) => {
          for (const child of children) {
            if (child.type === "leafDirective" && child.name === "card") {
              cardsData.push({
                title: child.attributes?.title || "",
                image: child.attributes?.image || "",
                description: child.attributes?.description || "",
                link: child.attributes?.link || "",
              });
            }
            if (child.children) {
              searchCards(child.children);
            }
          }
        };
        searchCards(node.children);
      }

      state.addNode(type, {
        columns: attrs.columns || "3",
        target: attrs.target || "_blank",
        data: encodeURIComponent(JSON.stringify(cardsData)),
      });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "cards",
    runner: (state, node) => {
      let cardsData: any[] = [];
      try {
        cardsData = JSON.parse(decodeURIComponent(node.attrs.data || "%5B%5D"));
      } catch { }

      state.openNode("containerDirective", undefined, {
        name: "cards",
        attributes: {
          columns: String(node.attrs.columns),
          target: String(node.attrs.target),
        },
      });

      if (cardsData.length > 0) {
        cardsData.forEach(card => {
          state.addNode("leafDirective", undefined, undefined, {
            name: "card",
            attributes: {
              title: card.title || "",
              image: card.image || "",
              description: card.description || "",
              link: card.link || "",
            }
          });
        });
      }

      state.closeNode();
    },
  },
}));

const inputRule = $inputRule(
  (ctx) =>
    new InputRule(
      /^:::cards\s$/,
      (state, match, start, end) => {
        const { tr } = state;
        tr.replaceWith(start, end, cardsNode.type(ctx).create());
        return tr;
      },
    ),
);

const cardsInteractionPlugin = $prose(
  (ctx) =>
    new Plugin({
      key: new PluginKey("CARDS_INTERACTION"),
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target as HTMLElement;

            const editBtn = target.closest("#cards-edit-button");
            if (editBtn) {
              const container = target.closest(".cards-plugin-container");
              if (container) {
                const columns = container.getAttribute("data-columns") || "3";
                const urlTarget = container.getAttribute("data-target") || "_blank";
                const data = container.getAttribute("data-cards") || "%5B%5D";
                const pos = view.posAtDOM(container, 0);

                document.dispatchEvent(
                  new CustomEvent("milkdown-cards-edit", {
                    detail: { columns, target: urlTarget, data, pos, ctx },
                  }),
                );

                event.preventDefault();
                event.stopPropagation();
                return true;
              }
            }

            const cardLink = target.closest("a.cards-item") as HTMLAnchorElement;
            if (cardLink) {
              const href = cardLink.getAttribute("href");
              const linkTarget = cardLink.getAttribute("target") || "_blank";
              if (href && href !== "#") {
                window.open(href, linkTarget);
              }
              event.preventDefault();
              event.stopPropagation();
              return true;
            }

            return false;
          },
        },
      },
    }),
);

export const cardsPlugin = [
  remarkDirective,
  cardsNode,
  inputRule,
  cardsInteractionPlugin,
];