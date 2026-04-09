import { useEffect, useState, type ReactNode } from 'react';
import * as s from './CodeBlock.css';

interface CodeBlockProps {
  language?: string;
  filename?: string;
  children: ReactNode;
}

let shikiHighlighter: Awaited<ReturnType<typeof import('shiki')['createHighlighter']>> | null = null;

async function getHighlighter() {
  if (shikiHighlighter) return shikiHighlighter;
  const { createHighlighter } = await import('shiki');
  shikiHighlighter = await createHighlighter({
    themes: ['github-dark-dimmed'],
    langs: ['c', 'bash', 'typescript', 'python', 'plaintext'],
  });
  return shikiHighlighter;
}

export function CodeBlock({ language = 'c', filename, children }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const codeText = extractText(children);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      const result = hl.codeToHtml(codeText, {
        lang: language,
        theme: 'github-dark-dimmed',
      });
      setHtml(result);
    });
    return () => { cancelled = true; };
  }, [codeText, language]);

  return (
    <div className={s.wrapper}>
      {filename && (
        <div className={s.header}>
          <span>{filename}</span>
          <span>{language}</span>
        </div>
      )}
      {html ? (
        <div
          className={s.pre}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className={s.pre}>
          <code className={s.code}>{codeText}</code>
        </pre>
      )}
    </div>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}
