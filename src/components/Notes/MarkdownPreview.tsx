import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const MarkdownPreview = ({ content, className, style }: MarkdownPreviewProps) => {
  return (
    <div className={className} style={style}>
      <ReactMarkdown>{content || '*Start writing to see preview...*'}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
