import { useEffect, useState } from 'react'

export function useHeroTypewriter(words: readonly string[]) {
  const [heroCycleIndex, setHeroCycleIndex] = useState(0)
  const [typedHeroWord, setTypedHeroWord] = useState('')
  const [isDeletingHeroWord, setIsDeletingHeroWord] = useState(false)

  useEffect(() => {
    const activeWord = words[heroCycleIndex]
    const isWordComplete = typedHeroWord === activeWord
    const isWordEmpty = typedHeroWord.length === 0

    let timeoutMs = isDeletingHeroWord ? 120 : 210

    if (!isDeletingHeroWord && isWordComplete) {
      timeoutMs = 1200
    } else if (isDeletingHeroWord && isWordEmpty) {
      timeoutMs = 260
    }

    const timeoutId = window.setTimeout(() => {
      if (!isDeletingHeroWord && !isWordComplete) {
        setTypedHeroWord(activeWord.slice(0, typedHeroWord.length + 1))
        return
      }

      if (!isDeletingHeroWord && isWordComplete) {
        setIsDeletingHeroWord(true)
        return
      }

      if (isDeletingHeroWord && !isWordEmpty) {
        setTypedHeroWord(activeWord.slice(0, typedHeroWord.length - 1))
        return
      }

      setIsDeletingHeroWord(false)
      setHeroCycleIndex((current) => (current + 1) % words.length)
    }, timeoutMs)

    return () => window.clearTimeout(timeoutId)
  }, [heroCycleIndex, isDeletingHeroWord, typedHeroWord, words])

  return typedHeroWord
}
