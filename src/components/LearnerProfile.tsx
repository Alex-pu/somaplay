import { allVocabulary } from '../data/vocabulary'
import { useGameStore } from '../store/gameStore'

interface LearnerProfileProps {
  onClose: () => void
}

export default function LearnerProfile({ onClose }: LearnerProfileProps) {
  const learned = useGameStore((state) => state.learned)
  const profile = useGameStore((state) => state.profile)
  const wordProgress = useGameStore((state) => state.wordProgress)
  const updateProfile = useGameStore((state) => state.updateProfile)
  const words = allVocabulary.map((item) => ({
    item,
    progress: wordProgress[item.id] ?? { visits: 0, speechAttempts: 0, speechMatches: 0, lastPracticedAt: null },
    isLearned: learned.includes(item.id),
  }))
  const totalVisits = words.reduce((total, word) => total + word.progress.visits, 0)
  const totalAttempts = words.reduce((total, word) => total + word.progress.speechAttempts, 0)
  const totalMatches = words.reduce((total, word) => total + word.progress.speechMatches, 0)
  const strongWords = words.filter((word) => word.progress.speechAttempts >= 2
    && word.progress.speechMatches / word.progress.speechAttempts >= 0.75)
  const practiceWords = words.filter((word) => word.progress.speechAttempts >= 2
    && word.progress.speechMatches / word.progress.speechAttempts < 0.5)
  const completionPercent = Math.round((learned.length / allVocabulary.length) * 100)

  const editProfile = (field: keyof typeof profile, value: string) => {
    updateProfile({ ...profile, [field]: value })
  }

  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="profile-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="close-button" type="button" aria-label="Close learner profile" onClick={onClose}>×</button>
        <p className="eyebrow">LEARNER PROFILE · PRIVATE TO THIS DEVICE</p>
        <h1 id="profile-title">Learning journey</h1>
        <p className="profile-intro">A helpful snapshot for the learner, family, and therapy team.</p>

        <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Name or nickname
            <input value={profile.name} maxLength={60} onChange={(event) => editProfile('name', event.target.value)} placeholder="What should we call the learner?" />
          </label>
          <label>
            Age <span>(optional)</span>
            <input type="number" min="0" max="120" value={profile.age} onChange={(event) => editProfile('age', event.target.value)} placeholder="Age in years" />
          </label>
          <label className="profile-form-wide">
            Therapy or learning goal <span>(optional)</span>
            <input value={profile.therapyGoal} maxLength={160} onChange={(event) => editProfile('therapyGoal', event.target.value)} placeholder="For example: practise recalling new words" />
          </label>
          <label className="profile-form-wide">
            Caregiver or therapist notes <span>(optional)</span>
            <textarea value={profile.notes} maxLength={500} rows={3} onChange={(event) => editProfile('notes', event.target.value)} placeholder="Add a note to support the next session" />
          </label>
        </form>

        <section className="profile-progress" aria-labelledby="profile-progress-title">
          <div className="profile-section-heading">
            <div>
              <p className="eyebrow">PROGRESS OVERVIEW</p>
              <h2 id="profile-progress-title">A little progress adds up</h2>
            </div>
            <strong>{learned.length}<span> / {allVocabulary.length} words</span></strong>
          </div>
          <div className="profile-progress-track" aria-label={`${completionPercent}% of words learned`}>
            <span style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="profile-stats">
            <div><strong>{totalVisits}</strong><span>lesson visits</span></div>
            <div><strong>{totalAttempts}</strong><span>speech-to-text tries</span></div>
            <div><strong>{totalMatches}</strong><span>approximate matches</span></div>
          </div>
        </section>

        <div className="profile-insights">
          <section className="profile-insight-card">
            <p className="eyebrow">WORDS GOING WELL</p>
            {strongWords.length
              ? <p>{strongWords.map(({ item }) => item.english).join(', ')}</p>
              : <p className="profile-muted">Keep practising. Patterns will appear after a few speech-to-text tries for a word.</p>}
          </section>
          <section className="profile-insight-card profile-practice-card">
            <p className="eyebrow">SUGGESTED PRACTICE</p>
            {practiceWords.length
              ? <p>Try revisiting {practiceWords.map(({ item }) => item.english).join(', ')}.</p>
              : <p className="profile-muted">No words to flag yet. This is a gentle guide, not a score.</p>}
          </section>
        </div>
        <p className="profile-caveat">
          Word suggestions use at least two speech-to-text attempts. Browser recognition can be inaccurate; these signals are not a pronunciation score or clinical assessment.
        </p>

        <section className="profile-word-list" aria-labelledby="profile-words-title">
          <div className="profile-section-heading">
            <div><p className="eyebrow">ALL WORDS</p><h2 id="profile-words-title">Practice at your own pace</h2></div>
          </div>
          {words.map(({ item, progress, isLearned }) => (
            <div className="profile-word-row" key={item.id}>
              <div>
                <strong>{item.english}</strong><span>{item.swahili}</span>
              </div>
              <div className="profile-word-detail">
                <span className={isLearned ? 'word-status word-status-learned' : 'word-status'}>
                  {isLearned ? 'Learned' : progress.visits ? 'Practising' : 'Not started'}
                </span>
                {progress.visits > 0 && (
                  <small>
                    {progress.visits} practice {progress.visits === 1 ? 'visit' : 'visits'}
                    {progress.lastPracticedAt && !Number.isNaN(Date.parse(progress.lastPracticedAt))
                      ? ` · last ${new Date(progress.lastPracticedAt).toLocaleDateString()}`
                      : ''}
                  </small>
                )}
                {progress.speechAttempts > 0 && (
                  <small>{progress.speechMatches}/{progress.speechAttempts} approximate speech matches</small>
                )}
              </div>
            </div>
          ))}
        </section>
        <p className="profile-privacy">Profile details and learning progress are saved only in this browser on this device.</p>
      </section>
    </div>
  )
}
