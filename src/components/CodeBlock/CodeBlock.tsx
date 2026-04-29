import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = codeText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={s.wrapper}>
      {filename && (
        <div className={s.header}>
          <span>{filename}</span>
          <span>{language}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className={`${s.copyButton} ${copied ? s.copyButtonCopied : ''}`}
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
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

function CopyIcon() {
  return (
    <svg
      className={s.copyIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className={s.copyIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
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
