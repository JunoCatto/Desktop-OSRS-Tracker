import { useState, useEffect, useCallback, useRef } from 'react'
import type { HiscoreData } from '../types'

interface ProfilePageProps {
  username: string
  hiscoreData: HiscoreData
  onBack: () => void
}

function ProfilePage({ username, hiscoreData, onBack }: ProfilePageProps): React.JSX.Element {
  const [tasks, setTasks] = useState<{ id: string; text: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`tasks_${username}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [newTask, setNewTask] = useState('')
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${username}`) || '')

  const overall = hiscoreData.skills.find((s) => s.name === 'Overall')

  // Adding and removing tasks
  const addTask = useCallback(() => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: crypto.randomUUID(), text: newTask.trim() }]
      setTasks(updatedTasks)
      localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks))
      setNewTask('')
    }
  }, [newTask, tasks, username])

  const removeTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.filter((task) => task.id !== id)
      setTasks(updatedTasks)
      localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks))
    },
    [tasks, username]
  )

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
      localStorage.setItem(`notes_${username}`, notes)
    }, 1000)
    return () => clearTimeout(timer)
  }, [notes, username])

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
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
      </div>

      <div className="profile-content">
        <div className="skills-section">
          <h2>Skills</h2>
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Level</th>
                <th>XP</th>
                <th>Rank</th>
              </tr>
            </thead>
            <tbody>
              {hiscoreData.skills.map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.level}</td>
                  <td>{skill.xp > 0 ? skill.xp.toLocaleString() : 0}</td>
                  <td>{skill.rank > 0 ? skill.rank.toLocaleString() : 'Unranked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <button onClick={addTask}>Add</button>
            </div>
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.text}
                  <button onClick={() => removeTask(task.id)}>×</button>
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
              style={{ resize: 'none', overflow: 'hidden' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
