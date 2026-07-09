import { Node, mergeAttributes } from "@tiptap/core";

export interface ButtonBlockAttrs {
  label: string;
  href: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    buttonBlock: {
      insertButtonBlock: (attrs?: Partial<ButtonBlockAttrs>) => ReturnType;
    };
  }
}

/**
 * Renders identically whether produced by the editor's NodeView (see
 * components/admin/blog/nodes/ButtonBlockView.tsx) or by generateHTML() on
 * the public read-only renderer — both paths go through this node's
 * renderHTML, only the editor additionally overlays an interactive NodeView.
 */
export const ButtonBlock = Node.create({
  name: "buttonBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      label: { default: "Scopri di più" },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="button-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "button-block", class: "my-6" }),
      [
        "a",
        {
          href: node.attrs.href,
          class:
            "inline-flex items-center justify-center px-8 py-3.5 bg-crg-red text-white font-sans text-xs tracking-[0.18em] uppercase no-underline",
        },
        node.attrs.label,
      ],
    ];
  },

  addCommands() {
    return {
      insertButtonBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
