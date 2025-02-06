import CodeEditor from './CodeEditor'
import { saplingHighlightExtension, SentenceRange } from '../extensions/saplingHighlightExtension'

interface SentenceScore {
	score: number
	sentence: string
}

interface CodeMirrorHeatmapProps {
	value: string
	onChange: (value: string) => void
	heatData: SentenceScore[]
	isDark?: boolean
	placeholder?: string
}

// Dummy function to compute sentence ranges from the text.
const getSentenceRanges = (text: string): SentenceRange[] => {
  // This example uses a simple period-split.
  const ranges: SentenceRange[] = [] // changed from 'let' to 'const'
  let pos = 0
  text.split('.').forEach(sentence => {
    const trimmed = sentence.trim()
    if (trimmed) {
      const start = text.indexOf(trimmed, pos)
      const end = start + trimmed.length
      ranges.push({ from: start, to: end, sentence: trimmed })
      pos = end
    }
  })
  return ranges
}

const CodeMirrorHeatmap = ({ value, onChange, heatData, isDark, placeholder }: CodeMirrorHeatmapProps) => {
	// Create the highlight extension using the current text.
  const highlightExt = saplingHighlightExtension(heatData, () => getSentenceRanges(value))
	return (
		<div style={{ position: 'relative', display: 'flex' }}>
			{/* CodeEditor area with an extra extensions prop */}
			<CodeEditor 
        value={value} 
        onChange={onChange} 
        isDark={isDark} 
        placeholder={placeholder}
				extensions={[highlightExt]} 
      />
		</div>
	)
}

export default CodeMirrorHeatmap
