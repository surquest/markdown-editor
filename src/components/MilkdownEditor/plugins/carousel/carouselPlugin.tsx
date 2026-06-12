import { $node, $remark, $prose } from "@milkdown/kit/utils";
import { Node } from "@milkdown/kit/prose/model";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import directive from "remark-directive";
import { EDIT_ICON_SVG } from "../icons";

const remarkDirective = $remark("remarkDirective", () => directive);

export const carouselNode = $node("carousel", () => ({
  group: "block",
  atom: true,
  isolating: true,
  marks: "",
  attrs: {
    images: { default: "%5B%5D" }, // URI encoded empty array []
    autorotate: { default: "false" },
    speed: { default: "3" },
  },
  parseDOM: [
    {
      tag: "div.carousel-plugin-container",
      getAttrs: (dom) => ({
        images: (dom as HTMLElement).getAttribute("data-images"),
        autorotate: (dom as HTMLElement).getAttribute("data-autorotate"),
        speed: (dom as HTMLElement).getAttribute("data-speed"),
      }),
    },
  ],
  toDOM: (node: Node) => {
    const imagesStr = node.attrs.images || "%5B%5D";
    let images: string[] = [];
    try {
      images = JSON.parse(decodeURIComponent(imagesStr));
    } catch {
      // Ignored
    }
    if (!Array.isArray(images)) images = [];

    const sliderChildren: unknown[] =
      images.length > 0
        ? images.map((src) => [
            "div",
            {
              class: "carousel-slide",
              style:
                "flex: 0 0 100%; scroll-snap-align: start; min-width: 100%; width: 100%; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; background: #F1F2F2;",
            },
            [
              "img",
              {
                src,
                style:
                  "max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none;",
              },
            ],
          ])
        : [
            [
              "div",
              {
                style:
                  "width: 100%; padding: 40px; text-align: center; color: #888; background: #f5f5f5; flex: 0 0 100%;",
              },
              "No images in carousel. Click Edit to add.",
            ],
          ];

    return [
      "div",
      {
        class: "carousel-plugin-container",
        style:
          "position: relative; margin: 1em 0; width: 100%; border: 1px solid #ddd; border-radius: 8px;",
        "data-images": imagesStr,
        "data-autorotate": String(node.attrs.autorotate),
        "data-speed": String(node.attrs.speed),
      },
      [
        "button",
        {
          id: "carousel-edit-button",
          class: "plugin-control-button edit-btn",
          contenteditable: "false",
          title: "Edit Carousel",
        },
        [
          "img",
          {
            src: EDIT_ICON_SVG,
            style: "width: 24px; height: 24px;",
            alt: "Edit Carousel",
          }
        ]
      ],
      [
        "button",
        {
          id: "carousel-prev-button",
          class: "plugin-control-button nav-btn prev",
          contenteditable: "false",
        },
        [
          "img",
          {
            src: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20width%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22rgba%280%2C0%2C0%2C0.54%29%22%3E%3Cpath%20d%3D%22M15.41%2016.59L10.83%2012l4.58-4.59L14%206l-6%206%206%206%201.41-1.41z%22%2F%3E%3C%2Fsvg%3E",
            style: "width: 24px; height: 24px;",
            alt: "Previous",
          },
        ],
      ],
      [
        "button",
        {
          id: "carousel-next-button",
          class: "plugin-control-button nav-btn next",
          contenteditable: "false",
        },
        [
          "img",
          {
            src: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20width%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22rgba%280%2C0%2C0%2C0.54%29%22%3E%3Cpath%20d%3D%22M8.59%2016.59L13.17%2012%208.59%207.41%2010%206l6%206-6%206-1.41-1.41z%22%2F%3E%3C%2Fsvg%3E",
            style: "width: 24px; height: 24px;",
            alt: "Next",
          },
        ],
      ],
      [
        "div",
        {
          class: "carousel-slider-wrapper",
          style: "border-radius: 8px; overflow: hidden; width: 100%;",
        },
        [
          "div",
          {
            class: "carousel-slider",
            style:
              "display: flex; overflow-x: hidden; scroll-snap-type: x mandatory; scroll-behavior: smooth; width: 100%; gap: 0; outline: none;",
          },
          ...sliderChildren,
        ]
      ]
    ];
  },
  parseMarkdown: {
    match: (node) => (node.type === "leafDirective" || node.type === "containerDirective") && node.name === "carousel",
    runner: (state, node, type) => {
      const attrs = (node.attributes || {}) as {
        images?: string;
        autorotate?: string;
        speed?: string;
      };
      
      let images: string[] = [];
      
      // Support old format where images were in attributes
      if (attrs.images) {
        try {
          const parsed = JSON.parse(decodeURIComponent(attrs.images));
          if (Array.isArray(parsed)) images = parsed;
        } catch {
          // Ignored
        }
      }
      
      // Support new format where images are in a list as children
      if (node.type === "containerDirective" && node.children && node.children.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listNode = node.children.find((child: any) => child.type === 'list');
        if (listNode && listNode.children) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listNode.children.forEach((listItem: any) => {
            if (listItem.children[0]?.type === 'paragraph') {
              const nodeOrLink = listItem.children[0].children[0];
              if (nodeOrLink?.type === 'text') {
                images.push(nodeOrLink.value);
              } else if (nodeOrLink?.type === 'link') {
                images.push(nodeOrLink.url);
              }
            }
          });
        }
      }

      state.addNode(type, {
        images: encodeURIComponent(JSON.stringify(images)),
        autorotate: attrs.autorotate || "false",
        speed: attrs.speed || "3",
      });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "carousel",
    runner: (state, node) => {
      const imagesStr = node.attrs.images || "%5B%5D";
      let images: string[] = [];
      try {
        images = JSON.parse(decodeURIComponent(imagesStr));
      } catch {
        // Ignored
      }

      state.openNode("containerDirective", undefined, {
        name: "carousel",
        attributes: {
          autorotate: String(node.attrs.autorotate),
          speed: String(node.attrs.speed),
        },
      });

      if (images.length > 0) {
        state.openNode("list", undefined, { ordered: false, spread: false });
        images.forEach((imgUrl) => {
          state.openNode("listItem", undefined, { spread: false });
          state.openNode("paragraph");
          state.addNode("text", undefined, imgUrl);
          state.closeNode(); // paragraph
          state.closeNode(); // listItem
        });
        state.closeNode(); // list
      }

      state.closeNode(); // containerDirective
    },
  },
}));

const carouselEditPlugin = $prose(
  (ctx) =>
    new Plugin({
      key: new PluginKey("CAROUSEL_EDIT"),
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target as HTMLElement;
            const prevBtn = target.closest("#carousel-prev-button");
            if (prevBtn) {
              const container = prevBtn.closest(".carousel-plugin-container");
              const slider = container?.querySelector(".carousel-slider");
              if (slider) {
                if (slider.scrollLeft <= 10) {
                  slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
                } else {
                  slider.scrollLeft -= slider.clientWidth;
                }
              }
              event.preventDefault();
              event.stopPropagation();
              return true;
            }

            const nextBtn = target.closest("#carousel-next-button");
            if (nextBtn) {
              const container = nextBtn.closest(".carousel-plugin-container");
              const slider = container?.querySelector(".carousel-slider");
              if (slider) {
                if (
                  slider.scrollLeft + slider.clientWidth + 10 >=
                  slider.scrollWidth
                ) {
                  slider.scrollLeft = 0;
                } else {
                  slider.scrollLeft += slider.clientWidth;
                }
              }
              event.preventDefault();
              event.stopPropagation();
              return true;
            }

            const editBtn = target.closest("#carousel-edit-button");
            if (editBtn) {
              const container = editBtn.closest(".carousel-plugin-container");
              if (container) {
                const images =
                  container.getAttribute("data-images") || "%5B%5D";
                const autorotate =
                  container.getAttribute("data-autorotate") || "false";
                const speed = container.getAttribute("data-speed") || "3";
                const pos = view.posAtDOM(container, 0);

                document.dispatchEvent(
                  new CustomEvent("milkdown-carousel-edit", {
                    detail: { images, autorotate, speed, pos, ctx },
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

// Auto-rotation handling for editor view preview
const carouselAutoRotatePlugin = $prose(() => {
  let interval: ReturnType<typeof setInterval>;
  return new Plugin({
    key: new PluginKey("CAROUSEL_AUTOROTATE"),
    view(editorView) {
      interval = setInterval(() => {
        const sliders = editorView.dom.querySelectorAll(
          '.carousel-plugin-container[data-autorotate="true"] .carousel-slider',
        );
        sliders.forEach((slider: Element) => {
          const container = slider.parentElement;
          if (!container) return;
          const speedRaw = container.getAttribute("data-speed");
          const speed = speedRaw ? parseFloat(speedRaw) : 3;

          const lastRotate = slider.getAttribute("data-last-rotate");
          const now = Date.now();
          if (!lastRotate || now - parseInt(lastRotate) > speed * 1000) {
            slider.setAttribute("data-last-rotate", now.toString());
            const slideWidth = slider.clientWidth;
            if (slider.scrollLeft + slideWidth + 10 >= slider.scrollWidth) {
              slider.scrollLeft = 0; // reset
            } else {
              slider.scrollLeft += slideWidth;
            }
          }
        });
      }, 100);
      return {
        destroy() {
          clearInterval(interval);
        },
      };
    },
  });
});

export const carouselPlugin = [
  remarkDirective,
  carouselNode,
  carouselEditPlugin,
  carouselAutoRotatePlugin,
];
