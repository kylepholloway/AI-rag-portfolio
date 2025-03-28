export function parseMarkdown(input: string): string {
  const lines = input.split('\n')
  const output: string[] = []

  let inUnorderedList = false
  let inOrderedList = false
  const orderedListBuffer: string[] = []

  const closeLists = () => {
    if (inUnorderedList) {
      output.push('</ul>')
      inUnorderedList = false
    }
    if (inOrderedList) {
      if (orderedListBuffer.length > 0) {
        output.push('<ol class="ai-list">', ...orderedListBuffer, '</ol>')
        orderedListBuffer.length = 0
      }
      inOrderedList = false
    }
  }

  const processLinks = (line: string): string => {
    const linkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g
    return line.replace(
      linkRegex,
      (_match, text, href) =>
        `<a href="${href}" class="ai-link" target="_blank" rel="noopener noreferrer">${text}</a>`,
    )
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // Normalize stray heading hashes
    line = line.replace(/^#+\s*#+\s*/, '### ')
    line = processLinks(line)
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')
    line = line.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')

    // Headings
    if (/^#{4}\s/.test(line)) {
      closeLists()
      output.push(`<h4 class="ai-subheading">${line.replace(/^#{4}\s*/, '').trim()}</h4>`)
      continue
    }
    if (/^#{3}\s/.test(line)) {
      closeLists()
      output.push(`<h3 class="ai-heading">${line.replace(/^#{3}\s*/, '').trim()}</h3>`)
      continue
    }
    if (/^#{2}\s/.test(line)) {
      closeLists()
      output.push(`<h2 class="ai-heading">${line.replace(/^#{2}\s*/, '').trim()}</h2>`)
      continue
    }
    if (/^#{1}\s/.test(line)) {
      closeLists()
      output.push(`<h1 class="ai-heading">${line.replace(/^#{1}\s*/, '').trim()}</h1>`)
      continue
    }

    // Divider
    if (line === '---') {
      closeLists()
      output.push('<hr class="ai-divider" />')
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      closeLists()
      output.push(`<blockquote class="ai-quote">${line.replace(/^>\s*/, '')}</blockquote>`)
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (!inOrderedList) {
        closeLists()
        inOrderedList = true
      }
      const content = line.replace(/^\d+\.\s+/, '').trim()
      orderedListBuffer.push(`<li class="ai-list-item">${content}</li>`)
      continue
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      if (!inUnorderedList) {
        closeLists()
        inUnorderedList = true
        output.push('<ul class="ai-list">')
      }
      const content = line.replace(/^[-*]\s+/, '').trim()
      output.push(`<li class="ai-list-item">${content}</li>`)
      continue
    }

    // Paragraph fallback
    if (line) {
      closeLists()
      output.push(`<p class="ai-p">${line}</p>`)
    }
  }

  closeLists()
  return output.join('')
}
