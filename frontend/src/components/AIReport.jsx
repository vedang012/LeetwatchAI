import { Fragment } from 'react'

function normalizeMarkdown(markdown) {
  return String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+(?=#{1,6}\s)/g, '\n')
    .replace(/[ \t]+(?=\d+\.\s)/g, '\n')
    .replace(/[ \t]+(?=[*-]\s)/g, '\n')
    .trim()
}

function splitHeadingContent(content) {
  const value = String(content || '').trim()

  if (!value) {
    return { title: '', trailing: '' }
  }

  const words = value.split(/\s+/)

  if (words.length <= 4) {
    return { title: value, trailing: '' }
  }

  if (/^The$/i.test(words[0]) && words[1]) {
    return {
      title: words.slice(0, 2).join(' '),
      trailing: words.slice(2).join(' '),
    }
  }

  if (/^\d+-[A-Za-z]+$/.test(words[0]) && words[1]) {
    return {
      title: words.slice(0, 2).join(' '),
      trailing: words.slice(2).join(' '),
    }
  }

  return {
    title: words[0],
    trailing: words.slice(1).join(' '),
  }
}

function parseMarkdown(markdown) {
  const normalized = normalizeMarkdown(markdown)

  if (!normalized) {
    return []
  }

  const lines = normalized.split('\n')
  const blocks = []
  const paragraphBuffer = []
  let index = 0

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return
    }

    blocks.push({
      type: 'paragraph',
      content: paragraphBuffer.join(' ').trim(),
    })

    paragraphBuffer.length = 0
  }

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      flushParagraph()
      index += 1
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)

    if (headingMatch) {
      flushParagraph()

      const { title, trailing } = splitHeadingContent(headingMatch[2])

      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: title,
      })

      if (trailing) {
        lines.splice(index + 1, 0, trailing)
      }

      index += 1
      continue
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/)
    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/)

    if (orderedMatch || unorderedMatch) {
      flushParagraph()
      const type = orderedMatch ? 'ordered-list' : 'unordered-list'
      const items = []

      while (index < lines.length) {
        const current = lines[index].trim()
        const nextOrdered = current.match(/^(\d+)\.\s+(.*)$/)
        const nextUnordered = current.match(/^[-*+]\s+(.*)$/)

        if (type === 'ordered-list' && nextOrdered) {
          items.push(nextOrdered[2].trim())
          index += 1
          continue
        }

        if (type === 'unordered-list' && nextUnordered) {
          items.push(nextUnordered[1].trim())
          index += 1
          continue
        }

        break
      }

      blocks.push({ type, items })
      continue
    }

    paragraphBuffer.push(line)
    index += 1
  }

  flushParagraph()

  return blocks
}

function renderInline(text) {
  const parts = String(text || '').split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g)

  return parts.filter(Boolean).map((part, index) => {
    if (/^\[[^\]]+\]\([^)]+\)$/.test(part)) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)

      return (
        <a
          key={`inline-${index}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-accent-600 underline decoration-accent-400/60 underline-offset-4 transition hover:text-accent-500 dark:text-accent-300 dark:decoration-accent-300/50 dark:hover:text-accent-200"
        >
          {match[1]}
        </a>
      )
    }

    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={`inline-${index}`}>{part.slice(2, -2)}</strong>
    }

    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={`inline-${index}`}>{part.slice(1, -1)}</em>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`inline-${index}`}
          className="rounded-md bg-slate-950/5 px-1.5 py-0.5 text-[0.95em] text-slate-700 dark:bg-white/10 dark:text-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    return <Fragment key={`inline-${index}`}>{part}</Fragment>
  })
}

function MarkdownReport({ markdown }) {
  const blocks = parseMarkdown(markdown)

  if (!blocks.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500">
        No summary content was returned.
      </div>
    )
  }

  return (
    <div className="ai-markdown mt-6 rounded-3xl border border-slate-200/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/65 sm:p-6">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = `h${Math.min(block.level, 6)}`
          return <HeadingTag key={`block-${index}`}>{renderInline(block.content)}</HeadingTag>
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={`block-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }

        if (block.type === 'unordered-list') {
          return (
            <ul key={`block-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }

        return <p key={`block-${index}`}>{renderInline(block.content)}</p>
      })}
    </div>
  )
}

function AIReport({ report, isLoading, isDisabled, error, onGenerate }) {
  return (
    <section className="card p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">AI Insights</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Generate a study summary</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Fetch the latest markdown summary from your AI layer and render it with clean formatting.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isDisabled || isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isLoading ? 'Generating...' : 'Generate AI Report'}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {report ? (
        <MarkdownReport markdown={report} />
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500">
          Your AI report will appear here after generation.
        </div>
      )}
    </section>
  )
}

export default AIReport
