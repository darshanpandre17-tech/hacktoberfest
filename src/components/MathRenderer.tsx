import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Helper to safely render KaTeX to HTML string
function renderKaTeX(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch (err) {
    // Fallback: clean up raw LaTeX tags so \text{} doesn't show to students
    return latex
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\(?:times|cdot)/g, '×')
      .replace(/\\(?:pm)/g, '±');
  }
}

// Clean any accidental orphaned LaTeX commands in non-math plain text
function sanitizePlainText(text: string): string {
  return text
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\(?:times|cdot)/g, '×')
    .replace(/\\(?:pm)/g, '±')
    .replace(/\\(?:le|leq)/g, '≤')
    .replace(/\\(?:ge|geq)/g, '≥')
    .replace(/\\(?:ne|neq)/g, '≠')
    .replace(/\\(?:approx)/g, '≈');
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // First split lines to preserve blocks, headings, steps, and lists
    const lines = content.split('\n');

    return lines.map((line, lineIndex) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '');
        return (
          <h4
            key={`h4-${lineIndex}`}
            className="text-base font-bold font-cinzel text-purple-200 mt-4 mb-2 flex items-center gap-2"
          >
            <span className="text-orange-400">✦</span>
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h4>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '');
        return (
          <h3
            key={`h3-${lineIndex}`}
            className="text-lg font-bold font-cinzel text-orange-200 mt-5 mb-2.5 pb-1 border-b border-purple-900/40 flex items-center gap-2"
          >
            <span className="text-purple-400">🕯️</span>
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h3>
        );
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^#\s+/, '');
        return (
          <h2
            key={`h2-${lineIndex}`}
            className="text-xl font-bold font-cinzel text-purple-100 mt-6 mb-3 flex items-center gap-2"
          >
            <span className="text-orange-400">📜</span>
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h2>
        );
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        const text = trimmed.replace(/^>\s+/, '');
        return (
          <blockquote
            key={`quote-${lineIndex}`}
            className="my-2 pl-4 border-l-2 border-orange-500 text-orange-200/90 italic text-sm"
          >
            {renderInlineMathAndMarkdown(text)}
          </blockquote>
        );
      }

      // Display Math Block $$ ... $$
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
        const mathContent = trimmed.slice(2, -2).trim();
        const html = renderKaTeX(mathContent, true);
        return (
          <div
            key={`display-math-${lineIndex}`}
            className="my-3 py-2 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s+/, '');
        return (
          <li key={`li-${lineIndex}`} className="ml-5 list-disc text-sm text-purple-200/90 leading-relaxed my-1">
            {renderInlineMathAndMarkdown(text)}
          </li>
        );
      }

      // Empty line spacing
      if (trimmed === '') {
        return <div key={`space-${lineIndex}`} className="h-2" />;
      }

      // Regular paragraph
      return (
        <p key={`p-${lineIndex}`} className="text-sm text-purple-100/90 leading-relaxed my-1.5">
          {renderInlineMathAndMarkdown(trimmed)}
        </p>
      );
    });
  }, [content]);

  return <div className={`math-content ${className}`}>{renderedElements}</div>;
};

// Parses inline math ($...$), bold (**...**), italics (*...*), code (`...`), and plain text
export function renderInlineMathAndMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. Display math $$...$$
  // 2. Inline math $...$
  // 3. LaTeX inline \(...\)
  // 4. Raw LaTeX expressions like \frac{...}{...} or 55\text{ m}
  // 5. Bold **...**
  // 6. Inline code `...`
  // 7. Italic *...*
  const pattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\(.*?\\\)|\\\w+\{[^}]*\}(?:\{[^}]*\})*|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g;

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Display math $$ ... $$
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      const html = renderKaTeX(math, true);
      return (
        <span
          key={`dm-${index}`}
          className="inline-block my-1 text-orange-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Inline math $ ... $
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1).trim();
      const html = renderKaTeX(math, false);
      return (
        <span
          key={`im-${index}`}
          className="inline text-purple-100 px-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // LaTeX \( ... \)
    if (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      const html = renderKaTeX(math, false);
      return (
        <span
          key={`lp-${index}`}
          className="inline text-purple-100 px-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Standalone LaTeX macro like \frac{a}{b} or \text{m}
    if (part.startsWith('\\') && part.includes('{') && part.includes('}')) {
      // If it's a known math macro, render with KaTeX
      const html = renderKaTeX(part, false);
      return (
        <span
          key={`macro-${index}`}
          className="inline text-purple-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={`b-${index}`} className="text-orange-200 font-semibold">
          {renderInlineMathAndMarkdown(inner)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={`c-${index}`}
          className="px-1.5 py-0.5 rounded bg-purple-950/80 text-orange-300 font-mono-code text-xs border border-purple-800/40"
        >
          {inner}
        </code>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={`em-${index}`} className="text-purple-300/90 italic">
          {inner}
        </em>
      );
    }

    // Plain text: sanitize any accidental raw LaTeX escapes so students see clean text
    const sanitized = sanitizePlainText(part);
    return <span key={`txt-${index}`}>{sanitized}</span>;
  });
}
