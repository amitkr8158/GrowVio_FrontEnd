import { Node, mergeAttributes } from '@tiptap/core';

export interface PdfEmbedAttrs {
  src: string;
  fileName: string;
  caption: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdfEmbed: {
      setPdfEmbed: (attrs: PdfEmbedAttrs) => ReturnType;
    };
  }
}

export const PdfEmbed = Node.create<object>({
  name: 'pdfEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src:      { default: '' },
      fileName: { default: 'document.pdf' },
      caption:  { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pdf-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, fileName, caption } = HTMLAttributes as PdfEmbedAttrs;
    return [
      'div',
      mergeAttributes({ 'data-type': 'pdf-embed', class: 'pdf-embed-block' }),
      [
        'div',
        { class: 'pdf-embed-header flex items-center justify-between py-2 px-3 bg-slate-100 rounded-t border border-slate-200' },
        ['span', { class: 'text-sm font-medium text-slate-700' }, `📄 ${fileName}`],
        ['a', { href: src, target: '_blank', class: 'text-xs text-indigo-600 hover:underline' }, 'Download'],
      ],
      ['iframe', {
        src,
        class: 'w-full rounded-b border border-t-0 border-slate-200',
        style: 'height:500px',
        title: caption || fileName,
      }],
    ];
  },

  addCommands() {
    return {
      setPdfEmbed: (attrs: PdfEmbedAttrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});
