import { useState, type ReactNode } from 'react'
import { CHOICE_MARKS } from '../content'
import type { ChoiceQuestion } from '../types'

/** 確認問題（科目A-1と同じ4択）。答えは保存しない */
export function Quiz({ questions, text }: { questions: readonly ChoiceQuestion[]; text: (t: string) => ReactNode }) {
  const [picks, setPicks] = useState<(number | undefined)[]>([])
  const answered = picks.filter((p) => p !== undefined).length
  const correct = picks.filter((p, i) => p !== undefined && p === questions[i]?.answer).length
  return (
    <>
      <div className="study-head">
        <h2 id="quiz-title">確認問題</h2>
        <p className="score" aria-live="polite">
          {answered === 0 ? `全${questions.length}問` : `${answered}問中 ${correct}問 正解`}
        </p>
        {answered > 0 && (
          <button type="button" className="ghost-button" onClick={() => setPicks([])}>
            やり直す
          </button>
        )}
      </div>
      {questions.map((q, i) => (
        <ChoiceCard key={i} no={i + 1} q={q} picked={picks[i]} onPick={(j) => setPicks((p) => Object.assign([...p], { [i]: j }))} text={text} />
      ))}
    </>
  )
}

function ChoiceCard({
  no,
  q,
  picked,
  onPick,
  text,
}: {
  no: number
  q: ChoiceQuestion
  picked: number | undefined
  onPick: (j: number) => void
  text: (t: string) => ReactNode
}) {
  const done = picked !== undefined
  const ok = picked === q.answer
  return (
    <article className="question" aria-labelledby={`choice-${no}`}>
      <h3 id={`choice-${no}`} className="question-no">
        問{no}
      </h3>
      <p className="question-text">{text(q.question)}</p>
      <ul className="choices">
        {q.choices.map((c, j) => {
          const state = !done ? '' : j === q.answer ? ' is-answer' : j === picked ? ' is-wrong' : ''
          return (
            <li key={j}>
              <button type="button" className={`choice${state}`} onClick={() => onPick(j)} disabled={done} aria-pressed={j === picked}>
                <span className="choice-mark">{CHOICE_MARKS[j]}</span>
                <span>{c}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {done && (
        <div className={`feedback ${ok ? 'ok' : 'ng'}`} role="status">
          <strong>{ok ? '正解' : `不正解（正解は ${CHOICE_MARKS[q.answer]}）`}</strong>
          <p>{text(q.explanation)}</p>
        </div>
      )}
    </article>
  )
}
