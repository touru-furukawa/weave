import { Container, Overlay, Tooltip, Form } from 'react-bootstrap'
import { useRef, useState } from 'react'
import { getSourceFilePath } from '../lib/config'
import { getStory } from '../lib/stories'

export default function Page({ story }) {
  const count = countCharacters(story.content)
  const [showTodos, setShowTodos] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [doubleSpace, setDoubleSpace] = useState(false)
  const text = stringify(story.content, { showTodos, showNotes })

  return (
    <Container className="mt-4">
      <div className="mt-2 mb-2">
        <span className='badge rounded-pill bg-secondary'>{count} 字</span>
        <CopyButton text={text} className='badge bg-primary ms-1'>
          Copy
        </CopyButton>
        <Form.Check type="switch" label="Show TODOs" checked={showTodos} onChange={() => { setShowTodos(!showTodos) }} />
        <Form.Check type="switch" label="Show notes" checked={showNotes} onChange={() => { setShowNotes(!showNotes) }} />
        <Form.Check type="switch" label="Double spacing" checked={doubleSpace} onChange={() => { setDoubleSpace(!doubleSpace) }} />
      </div>
      <h1>{story.title}</h1>
      <Content showTodos={showTodos} doubleSpace={doubleSpace}>{text}</Content>
    </Container >
  )
}

//
// Components
//

function CopyButton({ text, children, className }) {
  const target = useRef(null)
  const [show, setShow] = useState(false)

  return <>
    <span
      className={className}
      style={{ cursor: 'pointer' }}
      ref={target}
      onClick={() => {
        navigator.clipboard.writeText(text)
        setShow(true)
      }}
      onMouseOut={() => { setShow(false) }}
    >
      {children}
    </span>
    <Overlay target={target.current} show={show} placement='right'>
      <Tooltip>Copied</Tooltip>
    </Overlay>
  </>
}

function Content({ children, doubleSpace }) {
  const style = {
    whiteSpace: 'break-spaces',
    lineHeight: 2,
    fontFamily: "'Noto Serif JP', serif"
  }
  if (doubleSpace) {
    style.lineHeight = 4
  }
  return (
    <pre style={style}>
      {children}
    </pre>
  )
}

//
// Next.js framework
//

export async function getStaticProps() {
  const story = getStory(getSourceFilePath())
  return { props: { story } }
}

//
// Utilities
//

function countCharacters(content) {
  const count = content.children
    .filter(node => node.type == 'paragraph')

    // count for each paragraph
    .reduce((count, node) => {
      count += (node.children || [])
        .filter(node => node.type == 'text')
        // count inner texts
        .reduce((count, node) => count + node.value.length, 0)
      return count
    }, 0)

  return count
}

function stringify(content, { showTodos, showNotes }) {
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
    || ['「', '―'].includes(paragraph[0])) {
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