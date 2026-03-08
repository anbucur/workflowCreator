import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';
  const codeText = typeof children === 'string'
    ? children
    : React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className={`rounded-lg overflow-hidden border my-2 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
      <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
        <span className="font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-600 hover:text-slate-200' : 'hover:bg-slate-200 hover:text-slate-700'}`}
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className={`p-3 overflow-x-auto text-xs font-mono leading-relaxed ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

/**
 * Returns custom React-Markdown component overrides for the AI chat.
 * Accepts isDarkMode to style elements accordingly.
 */
export function getMarkdownComponents(isDarkMode: boolean) {
  return {
    // Code blocks (fenced with ```)
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
      // Extract the <code> child to get language class
      const codeChild = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && (child as React.ReactElement).type === 'code'
      ) as React.ReactElement | undefined;

      if (codeChild) {
        const codeProps = codeChild.props as { className?: string; children?: React.ReactNode };
        return (
          <CodeBlock className={codeProps.className} isDarkMode={isDarkMode}>
            {codeProps.children}
          </CodeBlock>
        );
      }

      return <pre {...props}>{children}</pre>;
    },

    // Inline code
    code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
      // If it has a language class, it's inside a <pre> — let the pre handler deal with it
      if (className?.startsWith('language-')) {
        return <code className={className} {...props}>{children}</code>;
      }
      return (
        <code
          className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Tables
    table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className={`overflow-x-auto rounded-lg border my-2 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
        <table className="w-full text-xs" {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className={`text-left ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`} {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th className="px-3 py-2 font-semibold text-xs" {...props}>{children}</th>
    ),
    td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className={`px-3 py-1.5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`} {...props}>
        {children}
      </td>
    ),
    tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr className={`${isDarkMode ? 'even:bg-slate-800/50' : 'even:bg-slate-50'}`} {...props}>
        {children}
      </tr>
    ),

    // Links
    a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-0.5 underline decoration-1 underline-offset-2 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
        {...props}
      >
        {children}
        <ExternalLink size={10} className="shrink-0" />
      </a>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        className={`border-l-3 pl-3 my-2 italic ${isDarkMode ? 'border-purple-500/50 text-slate-400' : 'border-purple-300 text-slate-600'}`}
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className={`my-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} {...props} />
    ),
  };
}
