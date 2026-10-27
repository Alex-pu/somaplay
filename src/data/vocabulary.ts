export type VocabularyId =
  | 'mti' | 'nyumba' | 'ngombe' | 'mbwa' | 'tembo'
  | 'bunny' | 'cat' | 'monkey' | 'parrot' | 'lion' | 'fox' | 'taxi'
export type VocabularyKind = 'tree' | 'house' | 'cow' | 'dog' | 'elephant' | 'bunny' | 'cat' | 'monkey' | 'parrot' | 'lion' | 'fox' | 'taxi'
export type WorldStage = 'village' | 'destination' | 'forest' | 'city'
export type GameStage = WorldStage | 'launch' | 'complete'

export interface VocabularyItem {
  id: VocabularyId
  swahili: string
  english: string
  pronunciation: string
  kind: VocabularyKind
  position: [number, number, number]
  color: string
  hint: string
}

export const vocabulary: VocabularyItem[] = [
  { id: 'mti', swahili: 'Mti', english: 'Tree', pronunciation: 'tree', kind: 'tree', position: [-5, 0, 1], color: '#4e9e57', hint: 'Trees give us shade and fresh air.' },
  { id: 'nyumba', swahili: 'Nyumba', english: 'House', pronunciation: 'howss', kind: 'house', position: [5, 0, -3], color: '#e78655', hint: 'A house is a place to call home.' },
  { id: 'ngombe', swahili: "Ng'ombe", english: 'Cow', pronunciation: 'kow', kind: 'cow', position: [7, 0, 5], color: '#d8b890', hint: 'Cows give us milk and say moo!' },
  { id: 'mbwa', swahili: 'Mbwa', english: 'Dog', pronunciation: 'dawg', kind: 'dog', position: [-7, 0, -5], color: '#d2914e', hint: 'Dogs can be playful, loyal friends.' },
  { id: 'tembo', swahili: 'Tembo', english: 'Elephant', pronunciation: 'EL-uh-fuhnt', kind: 'elephant', position: [0, 0, -10], color: '#9ba7a2', hint: 'Elephants are the largest land animals.' },
]

export const starVocabulary: VocabularyItem[] = [
  { id: 'bunny', swahili: 'Sungura', english: 'Bunny', pronunciation: 'BUN-ee', kind: 'bunny', position: [-7, 0, -3], color: '#d8b890', hint: 'A bunny has long ears and loves to hop.' },
  { id: 'cat', swahili: 'Paka', english: 'Cat', pronunciation: 'kat', kind: 'cat', position: [7, 0, -3], color: '#d2914e', hint: 'A cat has whiskers and a gentle purr.' },
  { id: 'monkey', swahili: 'Tumbili', english: 'Monkey', pronunciation: 'MUN-kee', kind: 'monkey', position: [-8, 0, 6], color: '#bd8057', hint: 'A monkey can swing from branch to branch.' },
  { id: 'parrot', swahili: 'Kasuku', english: 'Parrot', pronunciation: 'PAIR-uht', kind: 'parrot', position: [8, 0, 6], color: '#68b780', hint: 'A parrot is a colorful bird that can mimic sounds.' },
  { id: 'lion', swahili: 'Simba', english: 'Lion', pronunciation: 'LY-un', kind: 'lion', position: [0, 0, -8], color: '#dba64e', hint: 'A lion is a big cat with a fluffy mane.' },
]

export const forestVocabulary: VocabularyItem[] = [
  { id: 'fox', swahili: 'Mbweha', english: 'Fox', pronunciation: 'foks', kind: 'fox', position: [0, 0, -7], color: '#d98244', hint: 'A fox has a bushy tail and likes to explore.' },
]

export const cityVocabulary: VocabularyItem[] = [
  { id: 'taxi', swahili: 'Teksi', english: 'Taxi', pronunciation: 'TAK-see', kind: 'taxi', position: [0, 0, -7], color: '#f3bd38', hint: 'A taxi takes people where they need to go.' },
]

export const levelVocabulary: Record<WorldStage, VocabularyItem[]> = {
  village: vocabulary,
  destination: starVocabulary,
  forest: forestVocabulary,
  city: cityVocabulary,
}

export const stageDetails: Record<WorldStage, { level: number; title: string; label: string; greeting: string }> = {
  village: { level: 1, title: 'Word Village', label: 'KIJIJI CHA MANENO', greeting: 'Jambo, explorer!' },
  destination: { level: 2, title: 'Star Island', label: 'STAR ISLAND', greeting: 'Star Island · Level 2' },
  forest: { level: 3, title: 'Woodland Trail', label: 'WOODLAND TRAIL', greeting: 'Woodland Trail · Level 3' },
  city: { level: 4, title: 'Sunny City', label: 'SUNNY CITY', greeting: 'Sunny City · Level 4' },
}

export function getNextWorldStage(learned: VocabularyId[]): WorldStage | 'complete' {
  return (Object.keys(levelVocabulary) as WorldStage[])
    .find((stage) => !levelVocabulary[stage].every((item) => learned.includes(item.id))) ?? 'complete'
}

export const allVocabulary = [...vocabulary, ...starVocabulary, ...forestVocabulary, ...cityVocabulary]
