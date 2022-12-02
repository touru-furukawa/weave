import fs from 'fs'
import path from 'path'
import { unified } from 'unified'
import { VFile } from 'vfile'
import remarkParse from 'remark-parse'
import frontmatterExtract from 'remark-extract-frontmatter'
import frontmatter from 'remark-frontmatter'
import yaml from 'yaml'
import remarkDirective from 'remark-directive'
import remarkBreaks from 'remark-breaks'
import { visit } from 'unist-util-visit'
import { h } from 'hastscript'

const SOURCE_DIR = path.join(process.cwd())

export function getStory() {
  const filepath = path.join(SOURCE_DIR, 'story.md')
  const markdown = readMarkdown(filepath)
  const story = markdown.data
  story.content = markdown.result
  return story
}

function readMarkdown(path) {
  const text = fs.readFileSync(path, 'utf8')
  const input = new VFile(text)
  const output = unified()
    .use(remarkParse)
    .use([frontmatter, [frontmatterExtract, { yaml: yaml.parse }]])
    .use(remarkBreaks)
    .use([remarkDirective, htmlDirective])
    .use(jsonCompiler)
    .processSync(input)
  return output
}

function jsonCompiler() {
  Object.assign(this, { Compiler: tree => tree })
}

// convert directives into HTML elements
function htmlDirective() {
  return function (tree) {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], function (node) {
      const data = node.data || (node.data = {})
      const hast = h(node.name, node.attributes)

      data.hName = hast.tagName
      data.hProperties = hast.properties
    })
  }
}
