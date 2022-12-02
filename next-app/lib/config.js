import path from 'path'

export function getSourceFilePath() {
  const SOURCE_DIR = path.join(process.cwd())
  const filepath = path.join(SOURCE_DIR, 'story.md')
  return filepath
}
