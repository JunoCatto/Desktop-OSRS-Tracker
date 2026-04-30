import { useState, useEffect, useCallback, useRef } from 'react'
import type { HiscoreData } from '../types'

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
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${key}`) || '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const overall = hiscoreData.skills.find((s) => s.name === 'Overall')

  // Adding and removing tasks
  useEffect(() => {
    localStorage.setItem(`tasks_${key}`, JSON.stringify(tasks))
  }, [tasks, key])

  const addTask = useCallback(() => {
    if (newTask.trim()) {
      setTasks((prev) => [...prev, { id: crypto.randomUUID(), text: newTask.trim() }])
      setNewTask('')
    }
  }, [newTask])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

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
          <h1>{username}</h1>
          {/* TODO: Replace with symbols rather than tags */}
          <p>
            Total Level: {overall?.level ?? '-'} | XP: {overall?.xp?.toLocaleString() ?? '-'} |
            Rank: {overall?.rank?.toLocaleString() ?? '-'}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={() => setDrawerOpen(true)} className="btn">
            Skills
          </button>
          <button onClick={onBack} className="btn">
            ← Back
          </button>
        </div>
      </div>
      {/* Skills drawer */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <button className="btn" onClick={() => setDrawerOpen(false)}>
          ✕
        </button>
        <h2 className="skills-header">Skills</h2>
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Level</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {hiscoreData.skills
              .filter((s) => s.name !== 'Overall')
              .map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.level}</td>
                  <td>{skill.xp > 0 ? skill.xp.toLocaleString() : 0}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="profile-content">
        <div className="tools-section">
          <div className="tasks">
            <h2>Tasks</h2>
            <div className="add-task">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button className="btn" onClick={addTask}>
                Add
              </button>
            </div>
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.text}
                  <button className="btn" onClick={() => removeTask(task.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="notepad">
            <h2>Notepad</h2>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
