import {EditorView, Decoration, DecorationSet} from "@codemirror/view"
import {Extension, StateField} from "@codemirror/state"

export interface SentenceRange {
  from: number
  to: number
  sentence: string
}

export function saplingHighlightExtension(
  heatData: { score: number; sentence: string }[] | { score: number; sentence_scores: { score: number; sentence: string }[]; text: string },
  getSentences: () => SentenceRange[]
): Extension {
   function normalizeSentence(s: string): string {
     return s.trim().replace(/[.,;:!?]+$/, "").toLowerCase();
   }

  const getDecorations = () => {
    const sentences = getSentences()
     console.log("saplingHighlightExtension: getDecorations called, heatData:", heatData);
     console.log("saplingHighlightExtension: getSentences returned", sentences.length, "sentences");
     // If heatData is an object with a sentence_scores property, use that array.
     const scores = Array.isArray(heatData)
       ? heatData
       : ("sentence_scores" in heatData ? heatData.sentence_scores : []);
     console.log("saplingHighlightExtension: scores array:", scores);

    const decorations = sentences.map(({from, to, sentence}) => {
      const normalizedSentence = normalizeSentence(sentence);
       let data = scores.find(s => normalizeSentence(s.sentence) === normalizedSentence);
       if (!data) {
         // Fallback: try fuzzy matching where one string contains the other.
         data = scores.find(s => {
           const candidate = normalizeSentence(s.sentence);
           return candidate === normalizedSentence || candidate.includes(normalizedSentence) || normalizedSentence.includes(candidate);
         });
         if (data) {
           console.info("saplingHighlightExtension: Fallback match used for sentence:", sentence, "Normalized:", normalizedSentence);
         } else {
           console.warn("saplingHighlightExtension: No score entry found for sentence:", sentence, "Normalized:", normalizedSentence);
           scores.forEach(s => {
             console.debug("Candidate normalized sentence:", normalizeSentence(s.sentence));
           });
         }
       }
      // Determine score: according to Sapling docs, a score of 0 indicates maximum confidence the text is human-written
       // (good) and 1 indicates maximum confidence that the text is AI-generated.
       // Thus, if the score is low (human-written) no highlighting is applied,
       // while a higher score (AI-generated) results in a more opaque red highlight.
      const rawScore = data?.score ?? 0;
      const normalizedScore = rawScore > 1 ? rawScore / 100 : rawScore;
      const alpha = normalizedScore; // higher score yields a stronger red highlight
      const bgColor = `rgba(255, 0, 0, ${alpha})`;
       console.log("saplingHighlightExtension: processing sentence:", sentence, "from:", from, "to:", to, "rawScore:", rawScore, "normalizedScore:", normalizedScore, "alpha:", alpha, "bgColor:", bgColor);
       // Removed any extra styling that causes a color bar on the right; only inline highlighting is applied.
      return Decoration.mark({attributes: {style: `display: inline; background-color: ${bgColor};`}}).range(from, to);
    });
    return Decoration.set(decorations)
  }

  const decoField = StateField.define<DecorationSet>({
    create() {
      return getDecorations()
    },
    update(deco, tr) {
      if (tr.docChanged) {
        return getDecorations()
      }
      return deco
    },
    provide: f => EditorView.decorations.from(f)
  })

  return [decoField]
}
