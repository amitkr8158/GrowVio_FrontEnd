import { X, Eye } from 'lucide-react';

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string }[];
  text?: string;
}

interface Props {
  blocksJson: Record<string, unknown> | null;
  levelName: string;
  requiredPlan?: string;
  onClose: () => void;
}

function renderText(nodes: TipTapNode[] = []): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') return n.text ?? '';
      if (n.content) return renderText(n.content);
      return '';
    })
    .join('');
}

function renderNode(node: TipTapNode, idx: number): React.ReactNode {
  const text = renderText(node.content);

  switch (node.type) {
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      const cls =
        level === 1
          ? 'text-2xl font-bold text-gray-900 mt-6 mb-2'
          : level === 2
          ? 'text-xl font-semibold text-gray-800 mt-5 mb-2'
          : 'text-lg font-medium text-gray-700 mt-4 mb-1';
      return <h2 key={idx} className={cls}>{text}</h2>;
    }
    case 'paragraph':
      return <p key={idx} className="text-gray-700 leading-relaxed my-2">{text || <br />}</p>;
    case 'blockquote':
      return (
        <blockquote key={idx} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">
          {text}
        </blockquote>
      );
    case 'bulletList':
      return (
        <ul key={idx} className="list-disc list-inside space-y-1 my-3 text-gray-700">
          {(node.content ?? []).map((item, i) => (
            <li key={i}>{renderText(item.content?.[0]?.content)}</li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={idx} className="list-decimal list-inside space-y-1 my-3 text-gray-700">
          {(node.content ?? []).map((item, i) => (
            <li key={i}>{renderText(item.content?.[0]?.content)}</li>
          ))}
        </ol>
      );
    case 'horizontalRule':
      return <hr key={idx} className="my-6 border-gray-200" />;
    case 'image':
      return (
        <img
          key={idx}
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) ?? ''}
          className="w-full rounded-lg my-4 shadow-sm"
        />
      );
    case 'pdfEmbed':
      return (
        <div key={idx} className="my-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">📄 {node.attrs?.fileName as string}</span>
            <a href={node.attrs?.src as string} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
              Download
            </a>
          </div>
          <iframe src={node.attrs?.src as string} className="w-full" style={{ height: 500 }} title={node.attrs?.caption as string} />
        </div>
      );
    default:
      if (node.content) {
        return <div key={idx}>{node.content.map(renderNode)}</div>;
      }
      return null;
  }
}

export function PreviewRenderer({ blocksJson, levelName, requiredPlan, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      {/* Preview header */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <Eye className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-800">Preview Mode — {levelName}</span>
        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          As seen by user
        </span>
        <div className="flex-1" />
        {requiredPlan && requiredPlan !== 'FREE' && (
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
            Requires {requiredPlan}
          </span>
        )}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" /> Exit Preview
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Plan gate overlay simulation */}
          {requiredPlan && requiredPlan !== 'FREE' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  This level requires {requiredPlan} plan
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Users on lower plans will see an upgrade prompt here.
                </p>
              </div>
            </div>
          )}

          {!blocksJson ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No content to preview yet.</p>
              <p className="text-xs mt-1">Save a draft first, then preview.</p>
            </div>
          ) : (
            <div className="prose max-w-none">
              {((blocksJson.content ?? []) as TipTapNode[]).map(renderNode)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
