import React from 'react'
import CodeEditor from './CodeEditor'

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

const CodeMirrorHeatmap = ({ value, onChange, heatData, isDark, placeholder }: CodeMirrorHeatmapProps) => {
	// For simplicity, each sentence gets a fixed height block.
	return (
		<div style={{ position: 'relative', display: 'flex' }}>
			{/* CodeEditor area */}
			<CodeEditor value={value} onChange={onChange} isDark={isDark} placeholder={placeholder} />
			{/* Heatmap overlay */}
			<div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10px' }}>
				{heatData.map((s, i) => {
					const intensity = Math.round(255 * (1 - s.score))
					const bgColor = `rgb(${intensity}, ${255 - intensity}, 0)`
					return <div key={i} style={{ height: '20px', background: bgColor }} title={s.sentence} />
				})}
			</div>
		</div>
	)
}

export default CodeMirrorHeatmap
