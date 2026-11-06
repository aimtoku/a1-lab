import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { beatDuration, type Scene } from './types'

type Status = 'ready' | 'playing' | 'paused' | 'ended'

const STATUS_LABEL: Record<Status, string> = {
  ready: '再生ボタンを押すと始まります',
  playing: '再生中',
  paused: '一時停止中',
  ended: '最後まで再生しました',
}

/** 動く図解（紙芝居）の再生。場面の絵、せりふ、進み具合、再生・一時停止のボタン */
export function ScenePlayer({ scene }: { scene: Scene }) {
  const { beats, Stage } = scene
  const [beat, setBeat] = useState(0)
  const [status, setStatus] = useState<Status>('ready')
  /** 同じ場面をもう一度数え直すための番号（再開したときに、進み具合のバーを最初から伸ばす） */
  const [run, setRun] = useState(0)
  const last = beats.length - 1
  const current = beats[beat]!
  const duration = beatDuration(current)

  // 再生中は、場面の時間がたったら次へ。最後の場面のあとは「終わり」にする
  useEffect(() => {
    if (status !== 'playing') return
    const t = window.setTimeout(() => {
      if (beat >= last) setStatus('ended')
      else setBeat((b) => b + 1)
    }, duration)
    return () => window.clearTimeout(t)
  }, [status, beat, last, duration, run])

  const play = useCallback(() => {
    if (status === 'ended') setBeat(0)
    setStatus('playing')
    setRun((r) => r + 1)
  }, [status])
  const pause = () => setStatus('paused')
  const goTo = (i: number) => {
    setBeat(Math.min(Math.max(i, 0), last))
    setStatus((s) => (s === 'playing' ? 'playing' : 'paused'))
    setRun((r) => r + 1)
  }

  const playing = status === 'playing'
  return (
    <section className={`scene scene-${status}`} aria-label="動く図解">
      <div className="scene-stage">
        <svg viewBox="0 0 640 360" className="scene-svg" role="img" aria-label={scene.label}>
          <Stage beat={beat} />
        </svg>
        {status === 'ready' && (
          <button type="button" className="scene-big-play" onClick={play}>
            <span className="scene-big-play-icon" aria-hidden="true">
              ▶
            </span>
            再生する
          </button>
        )}
      </div>

      <div className="scene-caption" aria-live="polite">
        <p className="scene-say">
          <span className="scene-beat-no">
            {beat + 1}/{beats.length}
          </span>
          {current.say}
        </p>
        {current.formula && <p className="scene-formula">{current.formula}</p>}
      </div>

      <div className="scene-progress" role="group" aria-label="場面">
        {beats.map((b, i) => (
          <button
            key={i}
            type="button"
            className={i < beat ? 'scene-seg done' : i === beat ? 'scene-seg current' : 'scene-seg'}
            onClick={() => goTo(i)}
            aria-label={`場面 ${i + 1}：${b.say}`}
            aria-current={i === beat ? 'step' : undefined}
          >
            {i === beat && (
              <span
                key={`${beat}-${run}`}
                className={playing ? 'scene-seg-fill running' : status === 'ended' ? 'scene-seg-fill full' : 'scene-seg-fill'}
                style={{ '--d': `${duration}ms` } as CSSProperties}
              />
            )}
          </button>
        ))}
      </div>

      <div className="scene-controls">
        <span className={`scene-status ${status}`}>
          <span className="scene-status-dot" aria-hidden="true" />
          {STATUS_LABEL[status]}
        </span>
        <div className="scene-buttons">
          <button type="button" className="ghost-button" onClick={() => goTo(beat - 1)} disabled={beat === 0} aria-label="前の場面">
            ◀ 前
          </button>
          {playing ? (
            <button type="button" className="button-primary scene-toggle" onClick={pause}>
              ❚❚ 一時停止
            </button>
          ) : (
            <button type="button" className="button-primary scene-toggle" onClick={play}>
              {status === 'ended' ? '↺ 最初から' : status === 'paused' ? '▶ 続きを再生' : '▶ 再生'}
            </button>
          )}
          <button type="button" className="ghost-button" onClick={() => goTo(beat + 1)} disabled={beat === last} aria-label="次の場面">
            次 ▶
          </button>
        </div>
      </div>
    </section>
  )
}
