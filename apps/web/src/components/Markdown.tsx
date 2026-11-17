// Markdown tanpa HTML mentah mencegah konten dokumen menyisipkan elemen aktif.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Diagram from './Diagram';
export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
    code({ className, children: content, ...props }) {
      const text = String(content).replace(/\n$/, '');
      if (className === 'language-mermaid') return <Diagram code={text}/>;
      return <code className={className} {...props}>{content}</code>;
    },
    pre({ children: content }) { return <div className="code-block">{content}</div>; },
    a({ children: content, href }) { return <a href={href} target="_blank" rel="noreferrer noopener">{content}</a>; },
  }}>{children}</ReactMarkdown>;
}

