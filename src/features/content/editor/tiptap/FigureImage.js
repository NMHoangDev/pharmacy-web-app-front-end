import { Node, mergeAttributes } from "@tiptap/core";

const FigureImage = Node.create({
  name: "figureImage",
  group: "block",
  isolating: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
      alt: {
        default: "",
      },
      title: {
        default: "",
      },
      caption: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.tiptap-figure",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};
          const img = node.querySelector("img");
          const figcaption = node.querySelector("figcaption");
          return {
            src: img?.getAttribute("src") || "",
            alt: img?.getAttribute("alt") || "",
            title: img?.getAttribute("title") || "",
            caption: figcaption?.textContent?.trim() || "",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (node) => {
          if (!(node instanceof HTMLImageElement)) return {};
          const altText = node.getAttribute("alt") || "";
          return {
            src: node.getAttribute("src") || "",
            alt: altText,
            title: node.getAttribute("title") || "",
            caption: altText,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, alt, ...imgAttrs } = HTMLAttributes;
    const figureAttrs = { class: "tiptap-figure" };
    const imgNode = ["img", mergeAttributes({ ...imgAttrs, alt })];
    const captionText = String(caption || alt || "").trim();

    if (captionText.length > 0) {
      return [
        "figure",
        figureAttrs,
        imgNode,
        ["figcaption", { class: "tiptap-caption" }, captionText],
      ];
    }

    return ["figure", figureAttrs, imgNode];
  },

  addCommands() {
    return {
      insertFigureImage:
        (attrs) =>
        ({ commands, editor }) => {
          const captionText = String(attrs?.caption || attrs?.alt || "").trim();
          const payload = {
            src: attrs?.src || "",
            alt: attrs?.alt || captionText || "",
            title: attrs?.title || "",
            caption: captionText,
          };
          const insertPos = editor.state.selection.from;
          const inserted = commands.insertContentAt(insertPos, [
            { type: this.name, attrs: payload },
            { type: "paragraph" },
          ]);

          if (!inserted) return false;

          if (commands.setStoredMarks) {
            commands.setStoredMarks([]);
          } else {
            commands.unsetMark("bold");
            commands.unsetMark("italic");
            commands.unsetMark("underline");
          }

          return true;
        },
      updateFigureImageCaption:
        (caption) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, {
            caption: caption || "",
          }),
    };
  },
});

export default FigureImage;
