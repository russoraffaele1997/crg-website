import { Node, mergeAttributes } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqBlockAttrs {
  items: FaqItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    faqBlock: {
      insertFaqBlock: (attrs?: Partial<FaqBlockAttrs>) => ReturnType;
    };
  }
}

export const FaqBlock = Node.create({
  name: "faqBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      items: {
        default: [{ question: "Domanda", answer: "Risposta" }] as FaqItem[],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="faq-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const items = (node.attrs.items ?? []) as FaqItem[];
    const details: DOMOutputSpec[] = items.map((item) => [
      "details",
      { class: "border border-border-warm p-5" },
      ["summary", { class: "font-heading font-semibold text-charcoal cursor-pointer" }, item.question],
      ["p", { class: "font-sans text-sm text-mid-gray mt-3 leading-relaxed" }, item.answer],
    ]);
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "faq-block", class: "my-8 space-y-3" }),
      ...details,
    ] as DOMOutputSpec;
  },

  addCommands() {
    return {
      insertFaqBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent([{ type: this.name, attrs }, { type: "paragraph" }]),
    };
  },
});
