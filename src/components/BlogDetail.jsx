// src/components/BlogDetail.jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import remarkToc from 'remark-toc'
import 'highlight.js/styles/github.css'

export default function BlogDetail({ cuerpo_md }) {
  return (
    <div className="prose prose-lg md:prose-xl mx-auto">
      <ReactMarkdown
        children={cuerpo_md}
        remarkPlugins={[
          [remarkToc, { tight: true, maxDepth: 3 }],
          remarkGfm
        ]}
        rehypePlugins={[rehypeHighlight]}
      />
    </div>
  )
}
