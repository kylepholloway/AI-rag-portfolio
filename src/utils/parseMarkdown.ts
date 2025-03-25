export function parseMarkdown(input: string): string {
  const lines = input.split('\n')
  const output: string[] = []

  let inUnorderedList = false
  let inOrderedList = false
  let currentListItemIndex = -1
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
      currentListItemIndex = -1
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

    // Normalize stray heading hashes like "# ####" → "####"
    line = line.replace(/^#+\s*#+\s*/, '### ')
    const nextLine = lines[i + 1] || ''

    line = processLinks(line)
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')
    line = line.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')

    // Headings (detect in descending priority)
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

      currentListItemIndex++
      const content = line.replace(/^\d+\.\s+/, '').trim()
      orderedListBuffer.push(`<li class="ai-list-item">${content}</li>`)

      // Handle nested bullets under this item
      const nested: string[] = []
      let j = i + 1
      while (j < lines.length && /^[-*]\s+/.test(lines[j])) {
        const nestedLine = processLinks(lines[j])
          .replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
          .replace(/^[-*]\s+/, '')
        nested.push(`<li class="ai-list-item">${nestedLine}</li>`)
        j++
      }

      if (nested.length > 0) {
        orderedListBuffer[currentListItemIndex] = orderedListBuffer[currentListItemIndex].replace(
          '</li>',
          `<ul class="ai-sublist">${nested.join('')}</ul></li>`,
        )
        i = j - 1 // Skip processed nested lines
      }

      continue
    }

    // Unordered list (standalone)
    if (/^[-*]\s+/.test(line)) {
      if (!inUnorderedList) {
        closeLists()
        output.push('<ul class="ai-list">')
        inUnorderedList = true
      }
      output.push(`<li class="ai-list-item">${line.replace(/^[-*]\s+/, '')}</li>`)
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
