export const getScoreGradient = (score, format = 'BP') => {
  if (!score) return 'url(#lowScore)'
  const maxScore = format === 'BP' ? 87 : 77
  const percentage = score / maxScore
  
  if (percentage >= 0.94) return 'url(#excellentScore)'
  if (percentage >= 0.88) return 'url(#highScore)'
  if (percentage >= 0.82) return 'url(#midScore)'
  if (percentage >= 0.76) return 'url(#lowScore)'
  return 'url(#lowScore)'
}

export const getScorePercentage = (score, format = 'BP') => {
  if (!score) return 0
  const maxScore = format === 'BP' ? 85 : 75
  return Math.min((score / maxScore) * 100, 100)
}