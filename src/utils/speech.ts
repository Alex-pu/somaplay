const feminineVoiceNames = [
  'aria',
  'ava',
  'allison',
  'hazel',
  'jenny',
  'joanna',
  'karen',
  'moira',
  'samantha',
  'serena',
  'susan',
  'tessa',
  'victoria',
  'zira',
  'female',
]

export type SpeechVoiceChoice = 'feminine' | 'default' | 'unavailable'

let clickAudioContext: AudioContext | null = null

function chooseEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const feminineVoices = englishVoices
    .map((voice) => ({
      voice,
      score: feminineVoiceNames.reduce(
        (score, name) => score + (voice.name.toLowerCase().includes(name) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return {
    voice: feminineVoices[0]?.voice ?? englishVoices[0] ?? null,
    choice: feminineVoices.length ? 'feminine' as const : englishVoices.length ? 'default' as const : 'unavailable' as const,
  }
}

export function speakEnglish(
  text: string,
  onEnd?: () => void,
  onError?: () => void,
): SpeechVoiceChoice {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return 'unavailable'
  }

  window.speechSynthesis.cancel()
  const { voice, choice } = chooseEnglishVoice(window.speechSynthesis.getVoices())
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.75
  utterance.pitch = 1.05
  utterance.volume = 0.92
  if (voice) utterance.voice = voice
  utterance.onend = onEnd ?? null
  utterance.onerror = onError ? () => onError() : null
  window.speechSynthesis.speak(utterance)
  return choice
}

export function speakWordPrompt(english: string): SpeechVoiceChoice {
  const word = english.toLocaleLowerCase('en-US')
  const article = /^[aeiou]/.test(word) ? 'an' : 'a'
  return speakEnglish(`This is ${article} ${word}. Can you say ${article} ${word}?`)
}

function playClick(context: AudioContext) {
  const oscillator = context.createOscillator()
  const volume = context.createGain()
  const now = context.currentTime
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(760, now)
  volume.gain.setValueAtTime(0.0001, now)
  volume.gain.exponentialRampToValueAtTime(0.045, now + 0.008)
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.065)
  oscillator.connect(volume)
  volume.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.07)
}

export function playCollisionClick() {
  if (!window.AudioContext) return
  if (!clickAudioContext || clickAudioContext.state === 'closed') {
    clickAudioContext = new window.AudioContext()
  }
  const context = clickAudioContext
  if (context.state === 'running') {
    playClick(context)
    return
  }
  void context.resume().then(() => playClick(context)).catch((error: unknown) => {
    console.warn('The word encounter sound could not be played.', error)
  })
}
