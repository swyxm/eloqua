/**
 * Position mapping utility for debate positions
 * Converts full position names to shorter abbreviations for display in constrained spaces
 */

const POSITION_MAPPINGS = {
  // British Parliamentary positions
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
  
  // WSDC positions - Proposition (with hyphens as stored in Supabase)
  'Proposition - First Speaker': 'Prop 1st',
  'Proposition - Second Speaker': 'Prop 2nd',
  'Proposition - Third Speaker': 'Prop 3rd',
  
  // WSDC positions - Opposition (with hyphens as stored in Supabase)
  'Opposition - First Speaker': 'Opp 1st',
  'Opposition - Second Speaker': 'Opp 2nd',
  'Opposition - Third Speaker': 'Opp 3rd',
  
  // WSDC positions - Alternative format without hyphens
  'Proposition First Speaker': 'Prop 1st',
  'Proposition Second Speaker': 'Prop 2nd',
  'Proposition Third Speaker': 'Prop 3rd',
  'Opposition First Speaker': 'Opp 1st',
  'Opposition Second Speaker': 'Opp 2nd',
  'Opposition Third Speaker': 'Opp 3rd',
  
  // Alternative formats that might exist
  'First Speaker Proposition': 'Prop 1st',
  'Second Speaker Proposition': 'Prop 2nd',
  'Third Speaker Proposition': 'Prop 3rd',
  'First Speaker Opposition': 'Opp 1st',
  'Second Speaker Opposition': 'Opp 2nd',
  'Third Speaker Opposition': 'Opp 3rd',
  
  // Handle variations with "of" or "for"
  'First Speaker of Proposition': 'Prop 1st',
  'Second Speaker of Proposition': 'Prop 2nd',
  'Third Speaker of Proposition': 'Prop 3rd',
  'First Speaker of Opposition': 'Opp 1st',
  'Second Speaker of Opposition': 'Opp 2nd',
  'Third Speaker of Opposition': 'Opp 3rd',
}

/**
 * Maps a full position name to its abbreviated form
 * @param {string} position - The full position name
 * @param {boolean} fallbackToOriginal - Whether to return original if no mapping found (default: true)
 * @returns {string} The abbreviated position name
 */
export const mapPosition = (position, fallbackToOriginal = true) => {
  if (!position || typeof position !== 'string') {
    return fallbackToOriginal ? (position || '') : ''
  }
  
  // Trim and normalize the position string
  const normalizedPosition = position.trim()
  
  // Direct mapping lookup
  if (POSITION_MAPPINGS[normalizedPosition]) {
    return POSITION_MAPPINGS[normalizedPosition]
  }
  
  // Case-insensitive lookup
  const lowerPosition = normalizedPosition.toLowerCase()
  for (const [fullName, shortName] of Object.entries(POSITION_MAPPINGS)) {
    if (fullName.toLowerCase() === lowerPosition) {
      return shortName
    }
  }
  
  // Pattern matching for flexible WSDC formats
  const wsdcPatterns = [
    // Handle "Proposition - First Speaker" format (with hyphens)
    { pattern: /^(proposition|prop)\s*-\s*(first|1st|one)\s+speaker$/i, replacement: 'Prop 1st' },
    { pattern: /^(proposition|prop)\s*-\s*(second|2nd|two)\s+speaker$/i, replacement: 'Prop 2nd' },
    { pattern: /^(proposition|prop)\s*-\s*(third|3rd|three)\s+speaker$/i, replacement: 'Prop 3rd' },
    { pattern: /^(opposition|opp)\s*-\s*(first|1st|one)\s+speaker$/i, replacement: 'Opp 1st' },
    { pattern: /^(opposition|opp)\s*-\s*(second|2nd|two)\s+speaker$/i, replacement: 'Opp 2nd' },
    { pattern: /^(opposition|opp)\s*-\s*(third|3rd|three)\s+speaker$/i, replacement: 'Opp 3rd' },
    
    // Handle "Proposition First Speaker" format (without hyphens)
    { pattern: /^(proposition|prop)\s+(first|1st|one)\s+speaker$/i, replacement: 'Prop 1st' },
    { pattern: /^(proposition|prop)\s+(second|2nd|two)\s+speaker$/i, replacement: 'Prop 2nd' },
    { pattern: /^(proposition|prop)\s+(third|3rd|three)\s+speaker$/i, replacement: 'Prop 3rd' },
    { pattern: /^(opposition|opp)\s+(first|1st|one)\s+speaker$/i, replacement: 'Opp 1st' },
    { pattern: /^(opposition|opp)\s+(second|2nd|two)\s+speaker$/i, replacement: 'Opp 2nd' },
    { pattern: /^(opposition|opp)\s+(third|3rd|three)\s+speaker$/i, replacement: 'Opp 3rd' },
    
    // Handle "First/Second/Third Speaker for/of Proposition/Opposition"
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
  
  // Return original if no mapping found and fallback is enabled
  return fallbackToOriginal ? normalizedPosition : ''
}

/**
 * Maps an array of positions to their abbreviated forms
 * @param {string[]} positions - Array of position names
 * @param {boolean} fallbackToOriginal - Whether to return original if no mapping found
 * @returns {string[]} Array of abbreviated position names
 */
export const mapPositions = (positions, fallbackToOriginal = true) => {
  if (!Array.isArray(positions)) {
    return []
  }
  
  return positions.map(position => mapPosition(position, fallbackToOriginal))
}

/**
 * Gets all available position mappings
 * @returns {Object} Object containing all position mappings
 */
export const getAllPositionMappings = () => {
  return { ...POSITION_MAPPINGS }
}

/**
 * Checks if a position has a mapping available
 * @param {string} position - The position to check
 * @returns {boolean} True if mapping exists
 */
export const hasPositionMapping = (position) => {
  return mapPosition(position, false) !== ''
}
