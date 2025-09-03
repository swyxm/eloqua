const POSITION_MAPPINGS = {
  'Prime Minister': 'PM',
  'Leader of Opposition': 'LO',
  'Deputy Prime Minister': 'DPM',
  'Deputy Leader of the Opposition': 'DLO',
  'Member of Government': 'MG',
  'Government Extension': 'MG',
  'Member of the Opposition': 'MO',
  'Opposition Extension': 'MO',
  'Government Whip': 'GW',
  'Opposition Whip': 'OW',
  
  'Proposition - First Speaker': 'Prop 1st',
  'Proposition - Second Speaker': 'Prop 2nd',
  'Proposition - Third Speaker': 'Prop 3rd',
  
  'Opposition - First Speaker': 'Opp 1st',
  'Opposition - Second Speaker': 'Opp 2nd',
  'Opposition - Third Speaker': 'Opp 3rd',
  
  'Proposition First Speaker': 'Prop 1st',
  'Proposition Second Speaker': 'Prop 2nd',
  'Proposition Third Speaker': 'Prop 3rd',
  'Opposition First Speaker': 'Opp 1st',
  'Opposition Second Speaker': 'Opp 2nd',
  'Opposition Third Speaker': 'Opp 3rd',
  
  'First Speaker Proposition': 'Prop 1st',
  'Second Speaker Proposition': 'Prop 2nd',
  'Third Speaker Proposition': 'Prop 3rd',
  'First Speaker Opposition': 'Opp 1st',
  'Second Speaker Opposition': 'Opp 2nd',
  'Third Speaker Opposition': 'Opp 3rd',
  
  'First Speaker of Proposition': 'Prop 1st',
  'Second Speaker of Proposition': 'Prop 2nd',
  'Third Speaker of Proposition': 'Prop 3rd',
  'First Speaker of Opposition': 'Opp 1st',
  'Second Speaker of Opposition': 'Opp 2nd',
  'Third Speaker of Opposition': 'Opp 3rd',
}

export const mapPosition = (position, fallbackToOriginal = true) => {
  if (!position || typeof position !== 'string') {
    return fallbackToOriginal ? (position || '') : ''
  }
  
  const normalizedPosition = position.trim()
  
  if (POSITION_MAPPINGS[normalizedPosition]) {
    return POSITION_MAPPINGS[normalizedPosition]
  }
  
  const lowerPosition = normalizedPosition.toLowerCase()
  for (const [fullName, shortName] of Object.entries(POSITION_MAPPINGS)) {
    if (fullName.toLowerCase() === lowerPosition) {
      return shortName
    }
  }
  
  const wsdcPatterns = [
    { pattern: /^(proposition|prop)\s*-\s*(first|1st|one)\s+speaker$/i, replacement: 'Prop 1st' },
    { pattern: /^(proposition|prop)\s*-\s*(second|2nd|two)\s+speaker$/i, replacement: 'Prop 2nd' },
    { pattern: /^(proposition|prop)\s*-\s*(third|3rd|three)\s+speaker$/i, replacement: 'Prop 3rd' },
    { pattern: /^(opposition|opp)\s*-\s*(first|1st|one)\s+speaker$/i, replacement: 'Opp 1st' },
    { pattern: /^(opposition|opp)\s*-\s*(second|2nd|two)\s+speaker$/i, replacement: 'Opp 2nd' },
    { pattern: /^(opposition|opp)\s*-\s*(third|3rd|three)\s+speaker$/i, replacement: 'Opp 3rd' },
    
    { pattern: /^(proposition|prop)\s+(first|1st|one)\s+speaker$/i, replacement: 'Prop 1st' },
    { pattern: /^(proposition|prop)\s+(second|2nd|two)\s+speaker$/i, replacement: 'Prop 2nd' },
    { pattern: /^(proposition|prop)\s+(third|3rd|three)\s+speaker$/i, replacement: 'Prop 3rd' },
    { pattern: /^(opposition|opp)\s+(first|1st|one)\s+speaker$/i, replacement: 'Opp 1st' },
    { pattern: /^(opposition|opp)\s+(second|2nd|two)\s+speaker$/i, replacement: 'Opp 2nd' },
    { pattern: /^(opposition|opp)\s+(third|3rd|three)\s+speaker$/i, replacement: 'Opp 3rd' },
    
    { pattern: /^(first|1st|one)\s+speaker\s+(for|of)\s+(proposition|prop)$/i, replacement: 'Prop 1st' },
    { pattern: /^(second|2nd|two)\s+speaker\s+(for|of)\s+(proposition|prop)$/i, replacement: 'Prop 2nd' },
    { pattern: /^(third|3rd|three)\s+speaker\s+(for|of)\s+(proposition|prop)$/i, replacement: 'Prop 3rd' },
    { pattern: /^(first|1st|one)\s+speaker\s+(for|of)\s+(opposition|opp)$/i, replacement: 'Opp 1st' },
    { pattern: /^(second|2nd|two)\s+speaker\s+(for|of)\s+(opposition|opp)$/i, replacement: 'Opp 2nd' },
    { pattern: /^(third|3rd|three)\s+speaker\s+(for|of)\s+(opposition|opp)$/i, replacement: 'Opp 3rd' },
  ]
  
  for (const { pattern, replacement } of wsdcPatterns) {
    if (pattern.test(normalizedPosition)) {
      return replacement
    }
  }
  
  return fallbackToOriginal ? normalizedPosition : ''
}
