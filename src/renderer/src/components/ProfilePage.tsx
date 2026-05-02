import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { HiscoreData } from '../types'

const MAX_XP_FOR_99 = 13034431
const calculateProgress = (xp: number) =>
  Math.min(100, Math.max(0, Math.round((xp / MAX_XP_FOR_99) * 100)))
interface ProfilePageProps {
  username: string
  hiscoreData: HiscoreData
  onBack: () => void
}

function ProfilePage({ username, hiscoreData, onBack }: ProfilePageProps): React.JSX.Element {
  const key = username.toLowerCase()
  const [tasks, setTasks] = useState<{ id: string; text: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`tasks_${key}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [newTask, setNewTask] = useState('')
  const [dailyNewGoal, setDailyNewGoal] = useState('')
  const [dailyGoals, setDailyGoals] = useState<{ id: string; text: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`dailyGoals_${key}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  // Daily goals completion state is stored separately to reset completions without losing the goal list
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [dailyCompleted, setDailyCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`dailyCompleted_${key}`)
      const savedDate = localStorage.getItem(`dailyCompletedDate_${key}`)
      if (saved && savedDate === todayKey) {
        return JSON.parse(saved)
      }
      return []
    } catch {
      return []
    }
  })
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${key}`) || '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const overall = hiscoreData.skills.find((s) => s.name === 'Overall')

  // Adding and removing tasks
  useEffect(() => {
    localStorage.setItem(`tasks_${key}`, JSON.stringify(tasks))
  }, [tasks, key])

  useEffect(() => {
    localStorage.setItem(`dailyGoals_${key}`, JSON.stringify(dailyGoals))
  }, [dailyGoals, key])

  useEffect(() => {
    localStorage.setItem(`dailyCompleted_${key}`, JSON.stringify(dailyCompleted))
    localStorage.setItem(`dailyCompletedDate_${key}`, todayKey)
  }, [dailyCompleted, key, todayKey])

  const addTask = useCallback(() => {
    if (newTask.trim()) {
      setTasks((prev) => [...prev, { id: crypto.randomUUID(), text: newTask.trim() }])
      setNewTask('')
    }
  }, [newTask])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const addDailyGoal = useCallback(() => {
    if (dailyNewGoal.trim()) {
      setDailyGoals((prev) => [...prev, { id: crypto.randomUUID(), text: dailyNewGoal.trim() }])
      setDailyNewGoal('')
    }
  }, [dailyNewGoal])

  const toggleDailyGoal = useCallback((id: string) => {
    setDailyCompleted((prev) =>
      prev.includes(id) ? prev.filter((goalId) => goalId !== id) : [...prev, id]
    )
  }, [])

  const removeDailyGoal = useCallback((id: string) => {
    setDailyGoals((prev) => prev.filter((goal) => goal.id !== id))
    setDailyCompleted((prev) => prev.filter((goalId) => goalId !== id))
  }, [])

  const dailyDoneCount = dailyCompleted.length
  const dailyTotalCount = dailyGoals.length

  // Resizing textarea based on content
  const notesRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto'
      notesRef.current.style.height = `${notesRef.current.scrollHeight}px`
    }
  }, [notes])

  // Debounce notes saving
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`notes_${key}`, notes)
    }, 1000)
    return () => clearTimeout(timer)
  }, [notes, key])

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-info">
          <p className="eyebrow">OSRS Goal Tracker</p>
          <h1>{username}</h1>
          <p className="profile-meta">
            Total Level: <strong>{overall?.level ?? '-'}</strong> · XP:{' '}
            <strong>{overall?.xp?.toLocaleString() ?? '-'}</strong> · Rank:{' '}
            <strong>{overall?.rank?.toLocaleString() ?? '-'}</strong>
          </p>
          <p className="profile-copy"></p>
        </div>
        <div className="header-actions">
          <button onClick={() => setDrawerOpen(true)} className="btn btn-secondary">
            View full skills
          </button>
          <button onClick={onBack} className="btn btn-secondary">
            ← Change user
          </button>
        </div>
      </div>

      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <button className="btn drawer-close" onClick={() => setDrawerOpen(false)}>
          ✕
        </button>
        <h2 className="skills-header">Full skill progress</h2>
        <div className="skills-circle-grid">
          {hiscoreData.skills
            .filter((skill) => skill.name !== 'Overall')
            .sort((a, b) => b.xp - a.xp)
            .map((skill) => {
              const progress = calculateProgress(skill.xp)
              return (
                <div
                  key={skill.id}
                  className="skill-ring-card"
                  title={`XP: ${skill.xp.toLocaleString()}`}
                >
                  <span className="skill-tooltip">XP: {skill.xp.toLocaleString()}</span>
                  <div
                    className="skill-ring"
                    style={{
                      background: `conic-gradient(var(--color-background-green) ${progress}%, rgba(255,255,255,0.08) ${progress}% 100%)`
                    }}
                  >
                    <div className="skill-ring-core">
                      <strong>{skill.level}</strong>
                      <small>{progress}%</small>
                    </div>
                  </div>
                  <span className="skill-label">{skill.name}</span>
                </div>
              )
            })}
        </div>
      </div>

      <div className="profile-content">
        <div className="workspace">
          <section className="tracker-card">
            <div className="section-head">
              <div>
                <h2>Goals</h2>
                <p>Manage your one-off goals and repeatable dailies.</p>
              </div>
              <span className="task-badge">
                {dailyDoneCount}/{dailyTotalCount} Dailies completed today
              </span>
            </div>
            <div className="subsection">
              <div className="subsection-header">
                <h3>Daily goals</h3>
              </div>
              <div className="add-task">
                <input
                  type="text"
                  value={dailyNewGoal}
                  onChange={(e) => setDailyNewGoal(e.target.value)}
                  placeholder="Add a daily goal (e.g. Herb run)"
                  onKeyDown={(e) => e.key === 'Enter' && addDailyGoal()}
                />
                <button className="btn" onClick={addDailyGoal}>
                  Add daily goal
                </button>
              </div>
              <ul className="task-list">
                {dailyGoals.length === 0 ? (
                  <li className="empty-state">
                    No daily goals yet. Add repeatable OSRS tasks to check off each day.
                  </li>
                ) : (
                  dailyGoals.map((goal) => (
                    <li
                      key={goal.id}
                      className={dailyCompleted.includes(goal.id) ? 'completed' : ''}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={dailyCompleted.includes(goal.id)}
                          onChange={() => toggleDailyGoal(goal.id)}
                        />
                        <span className="task-text">{goal.text}</span>
                      </label>
                      <button className="btn btn-icon" onClick={() => removeDailyGoal(goal.id)}>
                        x
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="subsection">
              <div className="subsection-header">
                <h3>Tasks</h3>
              </div>
              <div className="add-task">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task (e.g. 'Get dragon daggers')"
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button className="btn" onClick={addTask}>
                  Add task
                </button>
              </div>
              <ul className="task-list">
                {tasks.length === 0 ? (
                  <li className="empty-state">
                    No tasks yet. Add a goal to keep your OSRS grind organized.
                  </li>
                ) : (
                  tasks.map((task) => (
                    <li key={task.id}>
                      <span>{task.text}</span>
                      <button className="btn btn-icon" onClick={() => removeTask(task.id)}>
                        x
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <section className="tracker-card notes-card">
            <div className="section-head">
              <div>
                <h2>Journal</h2>
                <p>Write notes about goals, routes, drops, or upcoming skill plans.</p>
              </div>
            </div>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
            />
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
