import { Node, mergeAttributes } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";

export interface VideoBlockAttrs {
  url: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoBlock: {
      insertVideoBlock: (attrs?: Partial<VideoBlockAttrs>) => ReturnType;
    };
  }
}

function toEmbedUrl(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  return { kind: "video", src: url };
}

export const VideoBlock = Node.create({
  name: "videoBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const url = (node.attrs.url ?? "") as string;
    if (!url) {
      return ["div", mergeAttributes(HTMLAttributes, { "data-type": "video-block" })] as DOMOutputSpec;
    }
    const embed = toEmbedUrl(url);
    const media: DOMOutputSpec =
      embed.kind === "iframe"
        ? ["iframe", { src: embed.src, class: "w-full h-full", frameborder: "0", allowfullscreen: "true" }]
        : ["video", { src: embed.src, class: "w-full h-full", controls: "true" }];

    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "video-block", class: "my-6 relative aspect-video bg-charcoal" }),
      media,
    ] as DOMOutputSpec;
  },

  addCommands() {
    return {
      insertVideoBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent([{ type: this.name, attrs }, { type: "paragraph" }]),
    };
  },
});
