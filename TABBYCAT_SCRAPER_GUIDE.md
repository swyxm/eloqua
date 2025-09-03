# Enhanced Tabbycat Scraper Guide

The enhanced Tabbycat scraper has been designed to systematically extract personalized debate data for individual debaters from Tabbycat tournament management systems.

## Features

### 🎯 Personalized Data Extraction
- **Name-based Search**: Input your first and last name to find your specific records
- **Institution Matching**: Optional institution field for better name disambiguation
- **Comprehensive Statistics**: Extract speaker scores, rankings, team info, and round results

### 🧭 Systematic Navigation
- **Intelligent Page Discovery**: Automatically discovers available tournament pages
- **Navbar Analysis**: Parses navigation structure to find relevant sections
- **Multi-page Coverage**: Systematically searches through:
  - Participant lists
  - Speaker standings  
  - Team standings
  - Round results
  - Break announcements

### 📊 Data Categories

#### ✅ Personal Statistics
- Speaker scores and averages
- Tournament ranking position
- Performance metrics

#### 🏆 Rankings & Standings
- **Speaker Rankings**: Individual speaker leaderboard position
- **Team Rankings**: Team performance and placement
- **Break Status**: Qualification for elimination rounds

#### 👥 Team Information
- Team name and composition
- Partner identification
- Institution affiliations

#### 🎯 Round-by-Round Results
- Individual round performance
- Motion/topic for each round
- Position assignments (Gov/Opp, OG/OO/CG/CO)
- Scores and placements
- Win/loss records

## How to Use

### 1. Access the Data Ingest Page
Navigate to the **Data Ingest** page in your Eloqua application.

### 2. Fill in Required Information
#### **Tournament URL** (Required)
```
https://your-tournament.herokuapp.com
```
Enter the full Heroku URL of your Tabbycat tournament.

#### **Your Name** (Required)
- **First Name**: Your first name as it appears in the tournament
- **Last Name**: Your last name as it appears in the tournament

#### **Institution** (Optional but Recommended)
Your school or institution name for better matching accuracy.

### 3. Select Data Options
Choose which types of data to extract:

- ☑️ **Personal speaker statistics** - Your scores and averages
- ☑️ **Individual round results** - Round-by-round performance  
- ☑️ **Team information and partners** - Team composition details
- ☑️ **Speaker and team rankings** - Leaderboard positions
- ☐ **Break rounds and elimination results** - Post-preliminary results

### 4. Start Scraping
Click **Start Scraping** to begin the systematic data extraction process.

## How It Works

### Phase 1: Discovery
1. **Tournament Analysis**: Loads the main tournament page
2. **Navigation Discovery**: Identifies available sections (participants, results, standings, etc.)
3. **Structure Mapping**: Maps out the tournament's organizational structure

### Phase 2: Search
1. **Name Matching**: Searches for your name across multiple pages
2. **Fuzzy Matching**: Uses advanced algorithms to handle typos and variations
3. **Context Verification**: Validates matches using institution and other context

### Phase 3: Data Extraction
1. **Speaker Statistics**: Extracts scores, averages, and performance metrics
2. **Team Information**: Identifies partners and team compositions
3. **Round Results**: Collects round-by-round performance data
4. **Rankings**: Determines your position in various leaderboards

### Phase 4: Processing
1. **Data Structuring**: Organizes extracted data into consistent format
2. **Speech Record Creation**: Converts data into individual speech records
3. **Database Integration**: Prepares data for storage in your Eloqua database

## Output Data Structure

The scraper generates structured data including:

```json
{
  "success": true,
  "data": {
    "debaterName": "John Doe",
    "tournamentName": "World Universities Championship 2024",
    "speechesFound": 8,
    "speakerRank": 15,
    "teamRank": 8,
    "speeches": [
      {
        "round": "Round 1",
        "position": "Opening Government",
        "motion": "This house believes that...",
        "partner": "Jane Smith", 
        "score": 78.5,
        "place_in_round": "Second Place",
        "team_name": "Harvard A",
        "institution": "Harvard University"
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

#### ❌ "Could not find debater"
**Causes:**
- Name spelling mismatch
- Different name format in tournament
- Name not yet entered in tournament system

**Solutions:**
- Check exact spelling in tournament participant list
- Try variations (nicknames, middle names, etc.)
- Add institution for better matching

#### ❌ "Could not access tournament"
**Causes:**
- Incorrect URL
- Tournament not publicly accessible
- Network connectivity issues

**Solutions:**
- Verify the Heroku URL is correct
- Ensure tournament has public pages enabled
- Check your internet connection

#### ❌ "No data found"
**Causes:**
- Tournament hasn't published results yet
- Results are in non-standard format
- Pages are password protected

**Solutions:**
- Wait for tournament organizers to publish results
- Contact tournament organizers about data availability
- Try different data extraction options

### Name Matching Tips

1. **Use Full Legal Name**: Use the exact name as registered in the tournament
2. **Check Variations**: Try common variations if initial search fails
3. **Institution Helps**: Adding your institution significantly improves matching accuracy
4. **Case Insensitive**: The scraper handles different capitalizations automatically

## Technical Details

### Supported Tournament Formats
- **British Parliamentary (BP)**: Full support for 4-team rounds
- **World Schools (WSDC)**: Government vs Opposition format
- **Other Formats**: Basic support with position detection

### Page Types Scanned
- `/participants/` - Main participant listings
- `/participants/speakers/` - Speaker-specific pages  
- `/participants/teams/` - Team listings
- `/results/` - Round results and outcomes
- `/standings/speaker/` - Speaker leaderboards
- `/standings/team/` - Team rankings
- `/break/` - Break announcements and elimination brackets

### Data Accuracy
- **Name Matching**: 85%+ similarity threshold with fuzzy matching
- **Score Extraction**: Handles various number formats and currencies
- **Position Mapping**: Intelligent position detection and standardization
- **Round Identification**: Pattern matching for round names and types

## Privacy & Ethics

### Data Usage
- Only extracts **your own** debate records and statistics
- Does not collect other participants' sensitive information
- Respects tournament privacy settings and access controls

### Best Practices
- Only scrape tournaments you participated in
- Respect rate limits and server resources
- Use extracted data responsibly and in accordance with tournament policies

---

*For technical support or feature requests, please check the application's main documentation or contact support.*
