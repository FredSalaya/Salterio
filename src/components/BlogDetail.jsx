// src/components/BlogDetail.jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw' 
//import 'highlight.js/styles/github.css'

export default function BlogDetail({ cuerpo_md }) {
  return (
    <div className=" prose-lg md:prose-xl mx-auto">
      <aside >
      <ReactMarkdown
        children={cuerpo_md}
        remarkPlugins={[
          [remarkToc, { tight: true, maxDepth: 3 }],
          remarkGfm
        ]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      />
      </aside>
      </div>
  )
}