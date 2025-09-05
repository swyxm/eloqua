
export const renderMarkdown = (text) => {
  if (!text) return ''
  
  let html = text

    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-primary mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-primary mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold text-primary mb-4 mt-6">$1</h1>')

    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4 mb-1 pl-4">$1</li>')
    .replace(/^[-*]\s+(.*$)/gim, '<li class="ml-4 mb-1 pl-4">$1</li>')

    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')

    .replace(/^(.+)$/gm, '<p class="mb-3">$1</p>')
    .replace(/<p class="mb-3"><\/p>/g, '')
    .replace(/<p class="mb-3"><br><\/p>/g, '')
  
  html = html.replace(/(<li class="ml-4 mb-1 pl-4">.*?<\/li>)(\s*<li class="ml-4 mb-1 pl-4">.*?<\/li>)*/g, (match) => {
    return `<ul class="list-disc ml-4 mb-3">${match}</ul>`
  })
  
  return html
}
