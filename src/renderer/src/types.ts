export interface HiscoreData {
  name: string
  skills: {
    id: number
    name: string
    rank: number
    level: number
    xp: number
  }[]
  activities: {
    id: number
    name: string
    rank: number
    score: number
  }[]
}
