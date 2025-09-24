const BREAK_ROUNDS = {
  'Triple Octofinals': 'Triple Octofinals',
  'Double Octofinals': 'Double Octofinals', 
  'Octofinals': 'Octofinals',
  'Quarterfinals': 'Quarterfinals',
  'Semifinals': 'Semifinals',
  'Finals': 'Finals'
}
const BREAK_ROUND_ORDER = [
  'Triple Octofinals',
  'Double Octofinals', 
  'Octofinals',
  'Quarterfinals',
  'Semifinals',
  'Finals'
]
export const generateRoundList = (preliminaryRounds, selectedBreakRounds = []) => {
  if (!preliminaryRounds || preliminaryRounds < 1) {
    return []
  }
  const rounds = []
  for (let i = 1; i <= preliminaryRounds; i++) {
    rounds.push(`Round ${i}`)
  }
  if (selectedBreakRounds && selectedBreakRounds.length > 0) {
    const orderedBreakRounds = BREAK_ROUND_ORDER.filter(round => 
      selectedBreakRounds.includes(round)
    )
    rounds.push(...orderedBreakRounds)
  }
  return rounds
}

export const isBreakRound = (roundName) => {
  return BREAK_ROUND_ORDER.includes(roundName)
}
export const getBreakRounds = () => {
  return [...BREAK_ROUND_ORDER]
}
export const getBreakRoundOrder = () => {
  return [...BREAK_ROUND_ORDER]
}

export const getRoundNumber = (roundName) => {
  const breakRoundIndex = BREAK_ROUND_ORDER.indexOf(roundName)
  if (breakRoundIndex !== -1) {
    return breakRoundIndex + 100
  }  const prelimMatch = roundName.match(/^Round (\d+)$/)
  if (prelimMatch) {
    return parseInt(prelimMatch[1], 10)
  }
  
  return null
}
