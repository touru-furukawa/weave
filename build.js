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

}

main()
