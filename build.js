import { getSourceFilePath } from './next-app/lib/config.js'
import { getStory } from './next-app/lib/stories.js'
import fs from 'fs'
import { stringify } from './next-app/lib/converter.js'

function main() {
  // read content
  const story = getStory(getSourceFilePath())

  // convert content
  const text = stringify(story.content, { showTodos: false, showNotes: false })

  // write file
  fs.writeFileSync('story-snapshot.txt', text);

  // count
  console.log(countCharacters(story.content))

}

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

main()
