
export const renderMarkdown = (text) => {
  if (!text) return ''
  
  const lines = text.split('\n')
  const result = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
    if (/^### (.+)$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(line.replace(/^### (.+)$/, '<h3 class="text-lg font-semibold text-primary mb-2 mt-3">$1</h3>'))
      continue
    }
    if (/^## (.+)$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(line.replace(/^## (.+)$/, '<h2 class="text-xl font-semibold text-primary mb-3 mt-4">$1</h2>'))
      continue
    }
    if (/^# (.+)$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(line.replace(/^# (.+)$/, '<h1 class="text-2xl font-semibold text-primary mb-4 mt-6">$1</h1>'))
      continue
    }
    
    // List items: -, *, or numbered
    const listMatch = line.match(/^(\s*)[-*]\s+(.+)$/) || line.match(/^(\s*)\d+\.\s+(.+)$/)
    if (listMatch) {
      if (!inList) { result.push('<ul class="list-disc ml-4 mb-3">'); inList = true }
      let content = listMatch[2]
      content = applyInline(content)
      result.push(`<li class="ml-4 mb-1 pl-2">${content}</li>`)
      continue
    }
    
    // Empty line
    if (line.trim() === '') {
      if (inList) { result.push('</ul>'); inList = false }
      continue
    }
    
    // Regular paragraph
    if (inList) { result.push('</ul>'); inList = false }
    result.push(`<p class="mb-3">${applyInline(line)}</p>`)
  }
  
  if (inList) result.push('</ul>')
  
  return result.join('\n')
}

function applyInline(text) {
  return text
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic: *text* (but not inside bold)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
}
