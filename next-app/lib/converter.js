export function stringify(content, { showTodos, showNotes }) {
  const text = content.children
    .map(nodeToLines({ showTodos, showNotes }))
    .filter(nonNull)
    .map(linesToParagraph)
    .map(indent)
    .join('\n')
  return text
}

function nodeToLines({ showTodos, showNotes }) {
  return (node) => {
    if (node.type == 'paragraph') {
      const lines = (node.children || [])
        .map(node => {
          switch (node.type) {
            case 'text':
              return node.value
            case 'break':
              return '\n'
            case 'textDirective':
              return renderTextDirective(node, { showTodos, showNotes })
          }
        })
        .filter(nonNull)
      return lines
    }

    if (node.type == 'leafDirective') {
      return renderLeafDirective(node, { showTodos, showNotes })
    }

    if (node.type == 'containerDirective') {
      return renderContainerDirective(node, { showTodos, showNotes })
    }

    return null
  }
}

function nonNull(val) {
  return val !== null
}

function linesToParagraph(lines) {
  return lines.join('')
}

function indent(paragraph, i) {
  if ((i == 0)  // genron wordpress
    || ['「', '―', '（'].includes(paragraph[0])) {
    return paragraph
  }
  return '　' + paragraph
}

function renderTextDirective(node, { showTodos, showNotes }) {
  if (node.name == 'todo' && showTodos) {
    return `[TODO ${node.children[0].value || ''}]`
  }

  if (node.name == 'note' && showNotes) {
    return `[NOTE ${node.children[0].value || ''}]`
  }
}

function renderLeafDirective(node, { showTodos, showNotes }) {
  if (node.name == 'separator') {
    return ['']
  }

  if (node.name == 'todo' && showTodos) {
    return [`[TODO ${node.children[0].value}]`]
  }

  if (node.name == 'note' && showNotes) {
    return [`[NOTE ${node.children[0].value}]`]
  }

  return null
}

function renderContainerDirective(node, { showTodos, showNotes }) {
  if (
    (node.name == 'todo' && showTodos) ||
    (node.name == 'note' && showNotes)
  ) {
    const label = node.name.toUpperCase()
    const lines = nodeToLines({ showTodos: true })(node.children[0])
      .map((line) => '  ' + line)  // indent
    lines.unshift(`[${label}\n`)
    lines.push('\n]')
    return lines
  }

  return null
}
