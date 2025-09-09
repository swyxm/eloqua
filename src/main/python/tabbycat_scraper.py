import sys
import json
import requests
from bs4 import BeautifulSoup
import re
import time
from typing import Dict, List, Optional, Any
import logging
from urllib.parse import urljoin

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PersonalTabbycatScraper:
    """
    A streamlined scraper for Tabbycat tournament management system.
    Extracts specific debater's statistics, rankings, and results using Vue.js data extraction.
    """
    
    def __init__(self, base_url: str, first_name: str, last_name: str, 
                 institution: str = ""):
        self.base_url = base_url.rstrip('/')
        self.first_name = first_name.strip()    
        self.last_name = last_name.strip()
        self.full_name = f"{self.first_name} {self.last_name}"
        self.institution = institution.strip() if institution else ""
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })        
        self.navigation_links = {}
        self.debater_data = {
            'personal_info': {},
            'speaker_stats': {},
            'team_info': {},
            'team_stats': {},
            'round_results': [],
            'rankings': {},
            'break_status': {},
            'speeches': [],
            'motions': {}
        }
        self.debug_log: List[str] = []

    def _choose_partner_only(self, names_text: str) -> str:
        """From comma-separated names, return the teammate (exclude our own name)."""
        try:
            parts = [p.strip() for p in names_text.split(',') if p.strip()]
            if not parts:
                return names_text
            mine_first = self.first_name.lower()
            mine_last = self.last_name.lower()
            mine_full = self.full_name.lower()
            if len(parts) == 2:
                a, b = parts
                if mine_first in a.lower() or mine_last in a.lower() or mine_full == a.lower():
                    return b
                if mine_first in b.lower() or mine_last in b.lower() or mine_full == b.lower():
                    return a
            for p in parts:
                pl = p.lower()
                if mine_first not in pl and mine_last not in pl and pl != mine_full:
                    return p
        except Exception:
            pass
        return names_text

    def _debug(self, message: str):
        """Add debug message with timestamp."""
        timestamp = time.strftime('%H:%M:%S')
        line = f"[{timestamp}] {message}"
        self.debug_log.append(line)
        logger.debug(message)
    
    def scrape_personal_data(self) -> Dict[str, Any]:
        """Main scraping function that systematically extracts personal debate data."""
        try:
            logger.info(f"Starting personalized scrape for {self.full_name} at {self.base_url}")
            self._debug(f"Start scrape base_url={self.base_url} full_name={self.full_name} institution={self.institution or '-'}")
            self._discover_navigation()
            debater_found = self._find_debater()
            if not debater_found:
                return {
                    'success': False,
                    'error': f"Could not find debater '{self.full_name}' in tournament participants",
                    'debug': self.debug_log
                }
            
            self._extract_motions()
            speeches = self._convert_to_speeches()
            
            logger.info(f"Successfully extracted data for {self.full_name}: {len(speeches)} speech records")
            
            return {
                'success': True,
                'data': {
                    'debaterName': self.full_name,
                    'tournamentName': self.debater_data['personal_info'].get('tournament_name', 'Unknown Tournament'),
                    'speechesFound': len(speeches),
                    'speakerRank': self.debater_data['rankings'].get('speaker_rank'),
                    'teamRank': self.debater_data['rankings'].get('team_rank'),
                    'speeches': speeches,
                    'combinedRounds': self._get_combined_round_data(),
                    'rawData': self.debater_data,
                    'debugLog': self.debug_log
                }
            }
            
        except Exception as e:
            logger.error(f"Personal scraping failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'debug': self.debug_log
            }
    
    def _make_request(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Make HTTP request with retries and return BeautifulSoup object."""
        for attempt in range(retries):
            try:
                self._debug(f"HTTP GET {url} (attempt {attempt+1}/{retries})")
                response = self.session.get(url, timeout=15)
                self._debug(f"→ status {response.status_code}")
                if response.status_code == 200:
                    return BeautifulSoup(response.content, 'html.parser')
                elif response.status_code == 404:
                    self._debug(f"Page not found: {url}")
                    return None
                else:
                    self._debug(f"HTTP {response.status_code} for {url}")
                    
            except requests.RequestException as e:
                self._debug(f"Request error for {url}: {str(e)}")
                if attempt < retries - 1:
                    time.sleep(2)
                    continue
                    
        return None
    
    def _discover_navigation(self):
        """Discover available navigation links and tournament structure."""
        soup = self._make_request(self.base_url)
        if not soup:
            raise Exception("Could not access tournament home page")
        
        title_selectors = [
            'h1.tournament-title', 'h1', '.tournament-name', 'title',
            '.navbar-brand', '.header-title'
        ]
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                tournament_name = element.get_text().strip()
                if tournament_name and len(tournament_name) > 5:
                    self.debater_data['personal_info']['tournament_name'] = tournament_name
                    self._debug(f"Tournament name detected: {tournament_name}")
                    break
        
        nav_elements = soup.find_all(['nav', 'div'], class_=re.compile(r'nav|menu'))
        for nav in nav_elements:
            links = nav.find_all('a', href=True)
            for link in links:
                href = link['href']
                text = link.get_text().strip().lower()
                full_url = urljoin(self.base_url, href)
                
                if any(word in text for word in ['participant', 'speaker', 'debater']):
                    if 'junior' in text:
                        self.navigation_links['junior_speakers'] = full_url
                    else:
                        self.navigation_links['speakers'] = full_url
                elif any(word in text for word in ['team']):
                    if 'junior' in text:
                        self.navigation_links['junior_teams'] = full_url
                    else:
                        self.navigation_links['teams'] = full_url
                elif any(word in text for word in ['standing', 'ranking', 'tab']):
                    if 'speaker' in text:
                        if 'junior' in text:
                            self.navigation_links['junior_speaker_standings'] = full_url
                        else:
                            self.navigation_links['speaker_standings'] = full_url
                    elif 'team' in text:
                        if 'junior' in text:
                            self.navigation_links['junior_team_standings'] = full_url
                        else:
                            self.navigation_links['team_standings'] = full_url
                elif any(word in text for word in ['motion', 'topic']):
                    self.navigation_links['motions'] = full_url
                elif any(word in text for word in ['round', 'draw']):
                    self.navigation_links['rounds'] = full_url
        
        self._debug(f"Discovered nav categories: {list(self.navigation_links.keys())}")
    
    def _find_debater(self) -> bool:
        """Find the specific debater in participant lists."""
        logger.info(f"Searching for debater: {self.full_name}")
        
        search_urls = []
        
        if 'speakers' in self.navigation_links:
            search_urls.append(self.navigation_links['speakers'])
        
        if 'junior_speakers' in self.navigation_links:
            search_urls.append(self.navigation_links['junior_speakers'])
        
        search_urls.extend([
            f"{self.base_url}/tab/speaker/",
            f"{self.base_url}/tab/speaker/junior/"
        ])
        
        if 'teams' in self.navigation_links:
            search_urls.append(self.navigation_links['teams'])
        if 'junior_teams' in self.navigation_links:
            search_urls.append(self.navigation_links['junior_teams'])
        
        search_urls.extend([
            f"{self.base_url}/tab/team/",
            f"{self.base_url}/tab/team/junior/"
        ])
        
        search_urls.extend([
            f"{self.base_url}/participants/list/",
            f"{self.base_url}/participants/speakers/",
            f"{self.base_url}/participants/teams/"
        ])
        
        debater_found = False
        found_in_main_speaker = False
        
        for url in search_urls:
            if 'speaker' in url.lower() and 'junior' in url.lower() and found_in_main_speaker:
                self._debug("Skipping junior speaker tab since debater already found in main speaker tab")
                continue
                
            self._debug(f"Searching debater in: {url}")
            
            is_participants_page = 'participants' in url.lower()
            if is_participants_page:
                self._debug("Attempting participants page (optional fallback)")
            
            soup = self._make_request(url)
            if soup and self._search_for_debater_in_page(soup, url):
                debater_found = True
                if 'speaker' in url.lower() and 'junior' not in url.lower():
                    self._debug("Found debater in main speaker tab - will continue to check team tabs")
                    found_in_main_speaker = True
            elif is_participants_page and not soup:
                self._debug("Participants page unavailable - continuing with speaker/team tabs (recommended)")
            elif is_participants_page:
                self._debug("Debater not found in participants page - continuing with speaker/team tabs")
        
        self._validate_and_supplement_data()
        
        return debater_found
    
    def _extract_motions(self):
        """Extract motion topics for each round from the motions page."""
        logger.info("Extracting motion topics...")
        
        motion_urls = []
        
        if 'motions' in self.navigation_links:
            motion_urls.append(self.navigation_links['motions'])
        if 'rounds' in self.navigation_links:
            motion_urls.append(self.navigation_links['rounds'])
        
        motion_urls.extend([
            f"{self.base_url}/motions/",
            f"{self.base_url}/motions/statistics/",
            f"{self.base_url}/rounds/",
            f"{self.base_url}/draw/",
            f"{self.base_url}/public/motions/",
            f"{self.base_url}/public/rounds/",
            f"{self.base_url}/motion/",
            f"{self.base_url}/topic/",
            f"{self.base_url}/resolution/"
        ])
        
        for url in motion_urls:
            self._debug(f"Searching for motions in: {url}")
            soup = self._make_request(url)
            if soup:
                if self._parse_motions_page(soup, url):
                    self._debug(f"Successfully extracted motions from {url}")
                    break
    
    def _parse_motions_page(self, soup: BeautifulSoup, page_url: str) -> bool:
        """Parse motions page to extract round-by-round motion topics."""
        # Look for motion data in Vue.js scripts first
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'window.vueData' in script.string:
                self._debug("Found window.vueData script in motions page, extracting motion data...")
                try:
                    # Extract the JSON part from window.vueData = {...}
                    script_text = script.string
                    start_idx = script_text.find('window.vueData = {')
                    if start_idx != -1:
                        # Find the matching closing brace
                        brace_count = 0
                        end_idx = start_idx + len('window.vueData = ')
                        for i in range(end_idx, len(script_text)):
                            if script_text[i] == '{':
                                brace_count += 1
                            elif script_text[i] == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_idx = i + 1
                                    break
                        
                        json_str = script_text[start_idx + len('window.vueData = '):end_idx]
                        
                        # Convert JavaScript object to valid JSON
                        json_str = re.sub(r'(\w+):', r'"\1":', json_str)
                        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
                        json_str = json_str.replace("'", '"')
                        
                        try:
                            vue_data = json.loads(json_str)
                            if self._extract_motions_from_vue_data(vue_data):
                                return True
                        except json.JSONDecodeError as e:
                            self._debug(f"JSON decode error in motions page: {e}")
                            # Try simple extraction
                            vue_data = self._extract_vue_data_simple(script_text)
                            if self._extract_motions_from_vue_data(vue_data):
                                return True
                        
                except Exception as e:
                    self._debug(f"Error parsing motions page Vue data: {e}")
        
        # Targeted parser for Tabbycat Motion Statistics pages (list-group structure)
        if self._parse_tabbycat_motion_statistics(soup):
            return True
        
        # Fallback: Look for motion data in HTML tables
        if self._parse_motions_from_html(soup):
            return True
        
        # Additional fallback: Look for motion data in HTML content
        self._debug("Looking for motion data in HTML content...")
        if self._parse_motions_from_html_content(soup):
            return True
        
        # Final fallback: Look for motion data in page content
        self._debug("Looking for motion data in page content...")
        return self._extract_motions_from_page_content(soup)
    
    def _extract_motions_from_vue_data(self, vue_data: dict) -> bool:
        """Extract motion topics from Vue.js data structure."""
        if 'tablesData' not in vue_data:
            return False
        
        motions_found = False
        for table_data in vue_data['tablesData']:
            if 'head' not in table_data or 'data' not in table_data:
                continue
            
            headers = [col.get('key', '') for col in table_data['head']]
            self._debug(f"Motions table headers: {headers}")
            
                    # Look for motion-related columns
        motion_col = None
        round_col = None
        
        for i, header in enumerate(headers):
            header_lower = header.lower()
            if any(word in header_lower for word in ['motion', 'topic', 'resolution']):
                motion_col = i
            elif any(word in header_lower for word in ['round']) or re.search(r'r\d+', header_lower):
                round_col = i
        
        # If no motion column found, look for motion data in the table content
        if not motion_col:
            self._debug("No motion column found, searching table content for motion data...")
            for table_data in vue_data['tablesData']:
                if 'data' in table_data:
                    for row in table_data['data']:
                        if isinstance(row, list) and len(row) > 0:
                            # Look for motion-like text in any cell
                            for cell in row:
                                if isinstance(cell, dict) and 'text' in cell:
                                    cell_text = str(cell['text'])
                                    if len(cell_text) > 50 and any(word in cell_text.lower() for word in ['house believes', 'this house', 'motion', 'resolution']):
                                        # Found potential motion text
                                        self._debug(f"Found potential motion text: {cell_text[:100]}...")
                                        # Try to determine round from context
                                        round_num = self._extract_round_from_text_context(cell_text)
                                        if round_num:
                                            self.debater_data['motions'][round_num] = cell_text
                                            self._debug(f"Extracted motion for R{round_num} from table content")
                                            motions_found = True
            
            if motion_col is not None:
                for row_data in table_data['data']:
                    if isinstance(row_data, list) and len(row_data) > motion_col:
                        motion_cell = row_data[motion_col]
                        if isinstance(motion_cell, dict) and 'text' in motion_cell:
                            motion_text = str(motion_cell['text']).strip()
                            if motion_text and len(motion_text) > 10:  # Reasonable motion length
                                # Try to determine round number
                                round_num = self._determine_round_number(row_data, headers, round_col)
                                if round_num:
                                    self.debater_data['motions'][round_num] = motion_text
                                    self._debug(f"Extracted motion for R{round_num}: {motion_text[:100]}...")
                                    motions_found = True
            
            # If no motion column found, look for motion data in the page content
            if not motion_col:
                self._debug("No motion column found, looking for motion data in page content...")
                # Look for motion data in the page content or other data structures
                if 'pageData' in vue_data:
                    page_data = vue_data['pageData']
                    if isinstance(page_data, dict):
                        # Look for motion-related fields
                        for key, value in page_data.items():
                            if any(word in key.lower() for word in ['motion', 'topic', 'resolution']):
                                if isinstance(value, str) and len(value) > 10:
                                    # Try to determine round from context
                                    round_num = self._extract_round_from_context(key, value)
                                    if round_num:
                                        self.debater_data['motions'][round_num] = value
                                        self._debug(f"Extracted motion for R{round_num} from page data: {value[:100]}...")
                                        motions_found = True
        
        return motions_found

    def _looks_like_motion(self, text: str) -> bool:
        """Heuristic to detect motion-like strings.

        Accepts common Tabbycat abbreviations:
        - THBT / THS / THW / THO / THP
        - Bare TH with comma or space (e.g., "TH, as ...", "TH as ...")
        - Full phrase "This House ..."
        """
        if not text:
            return False
        t = text.strip().lower()
        if "this house" in t:
            return True
        return re.search(r"^(th(?:bt|s|w|o|p|r|b)?)[\s,\-:]", t, flags=re.IGNORECASE) is not None
    
    def _extract_round_from_context(self, key: str, value: str) -> Optional[int]:
        """Extract round number from context (key name or value content)."""
        # Look for round numbers in the key using regex
        key_lower = key.lower()
        key_round_match = re.search(r'(?:round|r)(\d+)', key_lower)
        if key_round_match:
            return int(key_round_match.group(1))
        
        # Look for round numbers in the value using regex
        value_lower = value.lower()
        value_round_match = re.search(r'round\s*(\d+)', value_lower)
        if value_round_match:
            return int(value_round_match.group(1))
        
        # Check for abbreviated round mentions (r1, r2, r3, etc.)
        value_r_match = re.search(r'\br(\d+)\b', value_lower)
        if value_r_match:
            return int(value_r_match.group(1))
        
        return None
    
    def _determine_round_number(self, row_data, headers: list, round_col: int) -> Optional[int]:
        """Determine which round this motion belongs to."""
        if round_col is not None and round_col < len(row_data):
            round_cell = row_data[round_col]
            if isinstance(round_cell, dict) and 'text' in round_cell:
                round_text = str(round_cell['text']).strip()
                # Look for round numbers using regex
                round_match = re.search(r'(\d+)', round_text)
                if round_match:
                    return int(round_match.group(1))
        
        # Fallback: check if headers contain round info using regex
        for i, header in enumerate(headers):
            header_lower = header.lower()
            header_round_match = re.search(r'(?:round|r)(\d+)', header_lower)
            if header_round_match:
                return int(header_round_match.group(1))
        
        return None
    
    def _parse_motions_from_html(self, soup: BeautifulSoup) -> bool:
        """Fallback: Parse motion data from HTML tables."""
        tables = soup.find_all('table')
        motions_found = False
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
            
            header_row = rows[0]
            headers = [th.get_text().strip().lower() for th in header_row.find_all(['th', 'td'])]
            
            # Look for motion-related columns
            motion_col = None
            round_col = None
            
            for i, header in enumerate(headers):
                if any(word in header for word in ['motion', 'topic', 'resolution']):
                    motion_col = i
                elif any(word in header for word in ['round']) or re.search(r'r\d+', header):
                    round_col = i
            
            if motion_col is not None:
                for row in rows[1:]:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) > motion_col:
                        motion_text = cells[motion_col].get_text().strip()
                        if motion_text and len(motion_text) > 10:
                            # Try to determine round number
                            round_num = None
                            if round_col is not None and round_col < len(cells):
                                round_text = cells[round_col].get_text().strip()
                                # Use regex to extract round number dynamically
                                round_match = re.search(r'(\d+)', round_text)
                                if round_match:
                                    round_num = int(round_match.group(1))
                            
                            if round_num:
                                self.debater_data['motions'][round_num] = motion_text
                                self._debug(f"Extracted motion for R{round_num} from HTML: {motion_text[:100]}...")
                                motions_found = True
        
        return motions_found
    
    def _parse_motions_from_html_content(self, soup: BeautifulSoup) -> bool:
        """Parse motion data from HTML content (not just tables)."""
        motions_found = False
        
        # Look for motion data in page title or main heading
        page_title = soup.find('title')
        if page_title:
            title_text = page_title.get_text().strip()
            if 'round' in title_text.lower():
                # Extract round number from title
                round_match = re.search(r'round\s*(\d+)', title_text.lower())
                if round_match:
                    round_num = int(round_match.group(1))
                    # Look for motion in the page content near the title
                    self._debug(f"Found round {round_num} in page title: {title_text}")
        
        # Look for motion data in specific content areas
        motion_selectors = [
            '.motion-text', '.topic-text', '.resolution-text',  # Specific motion classes
            '.debate-motion', '.debate-topic',                  # Debate-specific classes
            '[data-motion]', '[data-topic]',                    # Data attributes
            '.card-body .motion', '.panel-body .motion'         # Motion in cards/panels
        ]
        
        for selector in motion_selectors:
            elements = soup.select(selector)
            for element in elements:
                text = element.get_text().strip()
                if text and len(text) > 30:  # Longer text for actual motions
                    # Look for motion-like content patterns
                    if any(word in text.lower() for word in ['house believes', 'this house', 'motion', 'resolution', 'topic']):
                        # Try to determine round number from context
                        round_num = self._extract_round_from_html_context(element, text)
                        if round_num:
                            self.debater_data['motions'][round_num] = text
                            self._debug(f"Extracted motion for R{round_num} from HTML content: {text[:100]}...")
                            motions_found = True
        
        # Look for motion data in page content that might not have specific classes
        # Search for text that looks like a motion (long, contains debate terminology)
        page_text = soup.get_text()
        lines = page_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if len(line) > 50 and len(line) < 500:  # Reasonable motion length
                # Look for motion patterns
                if any(word in line.lower() for word in ['house believes', 'this house', 'motion', 'resolution']):
                    # Try to determine round number
                    round_num = self._extract_round_from_text_context(line)
                    if round_num:
                        self.debater_data['motions'][round_num] = line
                        self._debug(f"Extracted motion for R{round_num} from page text: {line[:100]}...")
                        motions_found = True
                        break  # Found one motion, stop searching
        
        # Look for motion data in script tags that might contain JSON
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string:
                script_text = script.string
                # Look for motion-related JSON data
                if 'motion' in script_text.lower() or 'topic' in script_text.lower():
                    # Try to extract JSON-like structures
                    motion_matches = re.findall(r'"motion":\s*"([^"]+)"', script_text)
                    topic_matches = re.findall(r'"topic":\s*"([^"]+)"', script_text)
                    
                    for i, motion_text in enumerate(motion_matches + topic_matches):
                        if len(motion_text) > 20:
                            # Try to determine round from context
                            round_num = i + 1 if i < 5 else None
                            if round_num:
                                self.debater_data['motions'][round_num] = motion_text
                                self._debug(f"Extracted motion for R{round_num} from script: {motion_text[:100]}...")
                                motions_found = True
        
        return motions_found
    
    def _parse_tabbycat_motion_statistics(self, soup: BeautifulSoup) -> bool:
        """Parse motion data from Tabbycat motion statistics page structure."""
        motions_found = False
        
        # Try multiple approaches to find motions
        
        # Approach 1: Look for round badges and their associated h4 elements
        round_badges = soup.find_all('span', class_='badge badge-secondary')
        self._debug(f"Found {len(round_badges)} round badges")
        
        # Also try looking for any span with "Round" text
        if not round_badges:
            round_spans = soup.find_all('span')
            for span in round_spans:
                span_text = span.get_text().strip()
                if 'round' in span_text.lower():
                    self._debug(f"Found potential round span: {span_text}")
                    round_badges.append(span)
        
        # Also try looking for any element with "Round" text
        if not round_badges:
            round_elements = soup.find_all(['span', 'div', 'h4', 'h5', 'h6'])
            for element in round_elements:
                element_text = element.get_text().strip()
                if 'round' in element_text.lower():
                    self._debug(f"Found potential round element: {element_text}")
                    round_badges.append(element)
        
        # Approach 2: Look for list-group structure
        if not round_badges:
            self._debug("Trying list-group approach...")
            list_groups = soup.find_all('div', class_='list-group')
            self._debug(f"Found {len(list_groups)} list groups")
            
            for list_group in list_groups:
                # Look for round badges within this list group
                round_badges_in_group = list_group.find_all('span', class_='badge badge-secondary')
                self._debug(f"Found {len(round_badges_in_group)} round badges in list group")
                
                for badge in round_badges_in_group:
                    badge_text = badge.get_text().strip()
                    round_match = re.search(r'round\s*(\d+)', badge_text.lower())
                    if round_match:
                        round_num = int(round_match.group(1))
                        self._debug(f"Found round {round_num} badge: {badge_text}")
                        
                        # Look for the motion text in the next h4 element
                        # The motion is typically in an h4 that follows the badge
                        next_h4 = badge.find_next('h4')
                        if next_h4:
                            motion_text = next_h4.get_text().strip()
                            if motion_text and len(motion_text) > 10:
                                # Check if this looks like a motion
                                if self._looks_like_motion(motion_text):
                                    self.debater_data['motions'][round_num] = motion_text
                                    self._debug(f"Extracted motion for R{round_num} from Tabbycat statistics: {motion_text[:100]}...")
                                    motions_found = True
                                else:
                                    self._debug(f"Found h4 text but doesn't look like motion: {motion_text[:100]}...")
                            else:
                                self._debug(f"H4 text too short: {motion_text}")
                        else:
                            self._debug(f"No h4 found after round {round_num} badge")
        
        # Approach 3: Process any remaining round badges
        for badge in round_badges:
            badge_text = badge.get_text().strip()
            round_match = re.search(r'round\s*(\d+)', badge_text.lower())
            if round_match:
                round_num = int(round_match.group(1))
                self._debug(f"Found round {round_num} badge: {badge_text}")
                
                # Look for the motion text in the next h4 element
                # The motion is typically in an h4 that follows the badge
                next_h4 = badge.find_next('h4')
                if next_h4:
                    motion_text = next_h4.get_text().strip()
                    if motion_text and len(motion_text) > 10:
                        if self._looks_like_motion(motion_text):
                            self.debater_data['motions'][round_num] = motion_text
                            self._debug(f"Extracted motion for R{round_num} from Tabbycat statistics: {motion_text[:100]}...")
                            motions_found = True
                        else:
                            self._debug(f"Found h4 text but doesn't look like motion: {motion_text[:100]}...")
                    else:
                        self._debug(f"H4 text too short: {motion_text}")
                else:
                    self._debug(f"No h4 found after round {round_num} badge")
        
        # Approach 2: Look for list-group structure
        if not motions_found:
            self._debug("Trying list-group approach...")
            list_groups = soup.find_all('div', class_='list-group')
            self._debug(f"Found {len(list_groups)} list groups")
            
            for list_group in list_groups:
                # Look for round badges within this list group
                round_badges = list_group.find_all('span', class_='badge badge-secondary')
                
                for badge in round_badges:
                    badge_text = badge.get_text().strip()
                    round_match = re.search(r'round\s*(\d+)', badge_text.lower())
                    if round_match:
                        round_num = int(round_match.group(1))
                        self._debug(f"Found round {round_num} badge in list group: {badge_text}")
                        
                        # Look for the motion text in the next list-group-item that contains an h4
                        current_item = badge.find_parent('div', class_='list-group-item')
                        if current_item:
                            next_item = current_item.find_next_sibling('div', class_='list-group-item')
                            if next_item:
                                h4_element = next_item.find('h4')
                                if h4_element:
                                    motion_text = h4_element.get_text().strip()
                                    if motion_text and len(motion_text) > 10:
                                        if self._looks_like_motion(motion_text):
                                            self.debater_data['motions'][round_num] = motion_text
                                            self._debug(f"Extracted motion for R{round_num} from list group: {motion_text[:100]}...")
                                            motions_found = True
                                        else:
                                            self._debug(f"Found h4 text but doesn't look like motion: {motion_text[:100]}...")
                                    else:
                                        self._debug(f"H4 text too short: {motion_text}")
                                else:
                                    self._debug(f"No h4 found in next list-group-item after round {round_num}")
                            else:
                                self._debug(f"No next list-group-item found after round {round_num}")
                        else:
                            self._debug(f"Could not find parent list-group-item for round {round_num} badge")
        
        # Approach 3: Direct text search as fallback
        if not motions_found:
            self._debug("Trying direct text search for motion patterns...")
            page_text = soup.get_text()
            lines = page_text.split('\n')
            
            current_round = None
            for line in lines:
                line = line.strip()
                
                # Look for round headers
                round_match = re.search(r'\bround\s*(\d{1,2})\b', line.lower())
                if round_match:
                    current_round = int(round_match.group(1))
                    self._debug(f"Found round {current_round} in text: {line}")
                    continue
                
                # If we have a current round, look for motion text
                if current_round and len(line) > 10 and len(line) < 500:
                    if self._looks_like_motion(line):
                        self.debater_data['motions'][current_round] = line
                        self._debug(f"Extracted motion for R{current_round} from direct text search: {line[:100]}...")
                        motions_found = True
                        current_round = None  # Reset to avoid duplicate matches
        
        return motions_found
    
    def _extract_motions_from_page_content(self, soup: BeautifulSoup) -> bool:
        """Additional fallback: Look for motion data in the page content."""
        motions_found = False
        
        # Look for motion data in the page title or main content
        page_title = soup.find('title')
        if page_title:
            title_text = page_title.get_text()
            if 'motion' in title_text.lower() or 'statistics' in title_text.lower():
                self._debug(f"Found motion-related page: {title_text}")
                
                # Look for motion text in the main content area
                main_content = soup.find('main') or soup.find('div', class_='container') or soup.find('body')
                if main_content:
                    # Look for text that contains motion patterns
                    text_content = main_content.get_text()
                    lines = text_content.split('\n')
                    
                    for line in lines:
                        line = line.strip()
                        if len(line) > 10 and len(line) < 500:  # Reasonable motion length (allow short motions)
                            if any(word in line.lower() for word in ['this house', 'ths', 'thp', 'thr', 'tho', 'thw']):
                                # Try to extract round number from context
                                round_num = self._extract_round_from_text_context(line)
                                if round_num:
                                    self.debater_data['motions'][round_num] = line
                                    self._debug(f"Extracted motion for R{round_num} from main content: {line[:100]}...")
                                    motions_found = True
                                    break
        
        return motions_found
    
    def _extract_round_from_html_context(self, element, text: str) -> Optional[int]:
        """Extract round number from HTML context."""
        # Look for round indicators in the element or its parents
        parent = element.parent
        while parent and parent.name != 'body':
            parent_text = parent.get_text().lower()
            # Use regex to extract round number dynamically
            round_match = re.search(r'round\s*(\d+)', parent_text)
            if round_match:
                return int(round_match.group(1))
            # Check for abbreviated round mentions (r1, r2, r3, etc.)
            r_match = re.search(r'\br(\d+)\b', parent_text)
            if r_match:
                return int(r_match.group(1))
            parent = parent.parent
        
        # Look for round indicators in the text itself using regex
        text_lower = text.lower()
        round_match = re.search(r'round\s*(\d+)', text_lower)
        if round_match:
            return int(round_match.group(1))
        # Check for abbreviated round mentions (r1, r2, r3, etc.)
        r_match = re.search(r'\br(\d+)\b', text_lower)
        if r_match:
            return int(r_match.group(1))
        
        return None
    
    def _extract_round_from_text_context(self, text: str) -> Optional[int]:
        """Extract round number from text context."""
        # Look for round indicators in the text
        text_lower = text.lower()
        
        # Check for explicit round mentions using regex to handle any number of rounds
        round_match = re.search(r'round\s*(\d+)', text_lower)
        if round_match:
            return int(round_match.group(1))
        
        # Check for abbreviated round mentions (r1, r2, r3, etc.)
        r_match = re.search(r'\br(\d+)\b', text_lower)
        if r_match:
            return int(r_match.group(1))
        
        # If no explicit round found, try to infer from context
        # Look for debate-specific patterns that might indicate round
        if any(word in text_lower for word in ['opening government', 'opening opposition', 'closing government', 'closing opposition']):
            # This is likely a motion, but we need more context to determine round
            # For now, return None to avoid false positives
            return None
        
        return None
    
    def _validate_and_supplement_data(self):
        """Validate that we have essential data and provide fallbacks."""
        team_info = self.debater_data.get('team_info', {})
        
        # Check if we have basic team info
        if not team_info.get('team_name') and not team_info.get('partner'):
            self._debug("Warning: No team info found from any source")
        elif not team_info.get('team_name'):
            self._debug("Warning: Team name missing - may affect team tab matching")
        elif not team_info.get('partner'):
            self._debug("Warning: Partner name missing - may indicate solo debater or extraction issue")
        else:
            self._debug(f"✓ Essential data validated: Team='{team_info.get('team_name')}', Partner='{team_info.get('partner')}'")
        
        # Check if we have any meaningful data
        speaker_stats = self.debater_data.get('speaker_stats', {})
        round_results = self.debater_data.get('round_results', [])
        
        if not speaker_stats and not round_results:
            self._debug("Warning: No speaker stats or round results found")
        else:
            stats_count = len([k for k, v in speaker_stats.items() if v is not None])
            self._debug(f"✓ Data summary: {stats_count} speaker stats, {len(round_results)} round results")
    
    def _search_for_debater_in_page(self, soup: BeautifulSoup, page_url: str) -> bool:
        """Search for the debater in a specific page using Vue.js data extraction."""
        # Extract data from window.vueData JavaScript
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'window.vueData' in script.string:
                self._debug("Found window.vueData script, extracting data...")
                try:
                    # Extract the JSON part from window.vueData = {...}
                    script_text = script.string
                    start_idx = script_text.find('window.vueData = {')
                    if start_idx != -1:
                        # Find the matching closing brace
                        brace_count = 0
                        end_idx = start_idx + len('window.vueData = ')
                        for i in range(end_idx, len(script_text)):
                            if script_text[i] == '{':
                                brace_count += 1
                            elif script_text[i] == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_idx = i + 1
                                    break
                        
                        json_str = script_text[start_idx + len('window.vueData = '):end_idx]
                        
                        # Convert JavaScript object to valid JSON
                        json_str = re.sub(r'(\w+):', r'"\1":', json_str)
                        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
                        json_str = json_str.replace("'", '"')
                        
                        self._debug(f"Converted JSON string: {json_str[:200]}...")
                        try:
                            vue_data = json.loads(json_str)
                        except json.JSONDecodeError as e:
                            self._debug(f"JSON decode error: {e}")
                            # Try a simpler approach
                            vue_data = self._extract_vue_data_simple(script_text)
                            
                            # Search the tables
                            if 'tablesData' in vue_data:
                                self._debug(f"Found tablesData with {len(vue_data['tablesData'])} tables")
                                for i, table_data in enumerate(vue_data['tablesData']):
                                    self._debug(f"Table {i}: {[col.get('key', '') for col in table_data.get('head', [])]}")
                                    if 'data' in table_data:
                                        self._debug(f"Table {i} has {len(table_data['data'])} rows")
                                        if self._search_vue_table_data(table_data, page_url):
                                            return True
                            return False
                        
                        if 'tablesData' in vue_data:
                            self._debug(f"Found tablesData with {len(vue_data['tablesData'])} tables")
                            for i, table_data in enumerate(vue_data['tablesData']):
                                self._debug(f"Table {i}: {[col.get('key', '') for col in table_data.get('head', [])]}")
                                if 'data' in table_data:
                                    self._debug(f"Table {i} has {len(table_data['data'])} rows")
                                    if self._search_vue_table_data(table_data, page_url):
                                        return True
                        
                except Exception as e:
                    self._debug(f"Error parsing window.vueData: {e}")
        
        return False
    
    def _extract_vue_data_simple(self, script_text: str) -> dict:
        """Extract Vue data using simple string parsing when JSON fails."""
        vue_data = {'tablesData': []}
        
        # Look for tablesData array
        tables_data_start = script_text.find('tablesData:')
        if tables_data_start == -1:
            return vue_data
        
        # Find the opening bracket
        bracket_start = script_text.find('[', tables_data_start)
        if bracket_start == -1:
            return vue_data
        
        # Find matching closing bracket
        bracket_count = 0
        bracket_end = bracket_start
        for i in range(bracket_start, len(script_text)):
            if script_text[i] == '[':
                bracket_count += 1
            elif script_text[i] == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    bracket_end = i + 1
                    break
        
        # Extract the tablesData array as a string
        tables_data_str = script_text[bracket_start:bracket_end]
        
        # Simple parsing to extract table data
        head_sections = []
        data_sections = []
        
        # Find all head sections
        head_start = 0
        while True:
            head_start = tables_data_str.find('"head":', head_start)
            if head_start == -1:
                break
            bracket_start = tables_data_str.find('[', head_start)
            if bracket_start == -1:
                break
            bracket_count = 0
            bracket_end = bracket_start
            for i in range(bracket_start, len(tables_data_str)):
                if tables_data_str[i] == '[':
                    bracket_count += 1
                elif tables_data_str[i] == ']':
                    bracket_count -= 1
                    if bracket_count == 0:
                        bracket_end = i + 1
                        break
            head_sections.append(tables_data_str[bracket_start:bracket_end])
            head_start = bracket_end
        
        # Find all data sections
        data_start = 0
        while True:
            data_start = tables_data_str.find('"data":', data_start)
            if data_start == -1:
                break
            bracket_start = tables_data_str.find('[', data_start)
            if bracket_start == -1:
                break
            bracket_count = 0
            bracket_end = bracket_start
            for i in range(bracket_start, len(tables_data_str)):
                if tables_data_str[i] == '[':
                    bracket_count += 1
                elif tables_data_str[i] == ']':
                    bracket_count -= 1
                    if bracket_count == 0:
                        bracket_end = i + 1
                        break
            data_sections.append(tables_data_str[bracket_start:bracket_end])
            data_start = bracket_end
        
        # Create table data structures
        for i in range(min(len(head_sections), len(data_sections))):
            try:
                head_data = json.loads(head_sections[i])
                data_data = json.loads(data_sections[i])
                vue_data['tablesData'].append({
                    'head': head_data,
                    'data': data_data
                })
                self._debug(f"Successfully parsed table {i} with {len(data_data)} rows")
                if len(data_data) > 0:
                    self._debug(f"Table {i} first row structure: {data_data[0]}")
            except Exception as e:
                self._debug(f"Failed to parse table {i}: {e}")
                continue
        
        return vue_data
    
    def _search_vue_table_data(self, table_data: dict, page_url: str) -> bool:
        """Search for debater in Vue.js table data."""
        if 'data' not in table_data or 'head' not in table_data:
            return False
        
        headers = [col.get('key', '') for col in table_data['head']]
        self._debug(f"Vue table headers: {headers}")
        
        for row_index, row_data in enumerate(table_data['data']):
            # Handle different data structures
            if isinstance(row_data, list):
                # If we're on team tab and we already know the team, match the row by team name
                try:
                    is_team_tab = 'team' in page_url.lower()
                    known_team = (self.debater_data.get('team_info') or {}).get('team_name', '')
                    if is_team_tab and known_team:
                        self._debug(f"Team tab processing: looking for team '{known_team}' in headers {headers}")
                        # Find team column index
                        team_index = None
                        for idx, key in enumerate(headers):
                            if key.lower() in ['team', 'name']:
                                team_index = idx
                                break
                        if team_index is not None and team_index < len(row_data):
                            team_cell = row_data[team_index]
                            if isinstance(team_cell, dict):
                                team_text = str(team_cell.get('text', '')).strip().lower()
                                self._debug(f"Team tab row {row_index}: checking '{team_text}' vs '{known_team.lower()}'")
                                if team_text and team_text == known_team.strip().lower():
                                    self._debug(f"Matched team row on team tab for '{known_team}'")
                                    self._extract_speaker_stats_from_row(row_data, headers, page_url, row_index)
                                    return True
                except Exception as e:
                    self._debug(f"Team tab row match failed: {e}")
                
                # Data is a list of dictionaries with 'text' fields
                for i, cell in enumerate(row_data):
                    if isinstance(cell, dict) and 'text' in cell:
                        cell_text = str(cell['text'])
                        if self._is_name_match(cell_text):
                            self._debug(f"Found debater in Vue table list: {cell_text} at {page_url}")
                            
                            # Extract comprehensive statistics from the entire row
                            self._extract_speaker_stats_from_row(row_data, headers, page_url, row_index)
                            
                            # Also extract team name and partner from the row
                            try:
                                team_index = None
                                for idx, key in enumerate(headers):
                                    if key.lower() == 'team':
                                        team_index = idx
                                        break
                                if team_index is not None and team_index < len(row_data):
                                    team_cell = row_data[team_index]
                                    if isinstance(team_cell, dict):
                                        team_name_text = str(team_cell.get('text', '')).strip()
                                        if team_name_text:
                                            self.debater_data['team_info']['team_name'] = team_name_text
                                            self._debug(f"Extracted team name from row: {team_name_text}")
                                        # Popover may contain partners
                                        pop = team_cell.get('popover') or {}
                                        content_list = pop.get('content') or []
                                        for content_item in content_list:
                                            text_val = str(content_item.get('text', ''))
                                            if (',' in text_val) and ('view' not in text_val.lower()):
                                                partner_only = self._choose_partner_only(text_val)
                                                self.debater_data['team_info']['partner'] = partner_only
                                                self._debug(f"Extracted partner from team popover: {partner_only}")
                                                break
                            except Exception as e:
                                self._debug(f"Failed extracting team info from row: {e}")
                            
                            return True
            else:
                # Data is a dictionary with direct key-value pairs
                name_fields = [field for field in headers if any(keyword in field.lower() for keyword in ['name', 'speaker', 'debater'])]
                
                for field in name_fields:
                    if field in row_data:
                        cell_text = str(row_data[field])
                        if self._is_name_match(cell_text):
                            self._debug(f"Found debater in Vue table dict: {cell_text} at {page_url}")
                            
                            # Extract comprehensive statistics from the entire row
                            self._extract_speaker_stats_from_row(row_data, headers, page_url, row_index)
                            
                            # Extract team info if available
                            team_fields = [f for f in headers if 'team' in f.lower()]
                            for team_field in team_fields:
                                if team_field in row_data:
                                    team_name = str(row_data[team_field])
                                    if team_name:
                                        self.debater_data['team_info']['team_name'] = team_name
                            
                            # Extract partner info if available
                            partner_fields = [f for f in headers if 'partner' in f.lower()]
                            for partner_field in partner_fields:
                                if partner_field in row_data:
                                    partner_name = str(row_data[partner_field])
                                    if partner_name:
                                        self.debater_data['team_info']['partner'] = partner_name
                            
                            # Extract rankings if available
                            rank_fields = [f for f in headers if 'rank' in f.lower() or f.lower() == 'rk']
                            for rank_field in rank_fields:
                                if rank_field in row_data:
                                    rank_text = str(row_data[rank_field]).rstrip('=').strip()
                                    if rank_text.isdigit():
                                        self.debater_data['speaker_stats']['rank'] = int(rank_text)
                            
                            return True
        
        return False
    
    def _extract_speaker_stats_from_row(self, row_data, headers: list, page_url: str, row_index: int):
        """Extract comprehensive speaker statistics from a row when debater is found."""
        self._debug(f"Extracting stats from row {row_index} at {page_url}")
        
        # Determine if this is a speaker tab or team tab based on URL
        is_speaker_tab = 'speaker' in page_url.lower()
        is_team_tab = 'team' in page_url.lower()
        
        if isinstance(row_data, list):
            # Handle list format (common in Tabbycat Vue tables)
            for i, cell in enumerate(row_data):
                if isinstance(cell, dict) and 'text' in cell:
                    cell_text = str(cell['text'])
                    
                    # Extract ranking (usually first column)
                    if i == 0:
                        try:
                            # Handle tied ranks like "28=" by extracting just the number
                            rank_text = cell_text.rstrip('=').strip()
                            if rank_text.isdigit():
                                rank = int(rank_text)
                                if is_speaker_tab:
                                    self.debater_data['speaker_stats']['rank'] = rank
                                    self._debug(f"Extracted speaker rank: {rank}")
                                elif is_team_tab:
                                    self.debater_data['rankings']['team_rank'] = rank
                                    self._debug(f"Extracted team rank: {rank}")
                        except:
                            pass
                    
                    # Extract round results - detect round columns dynamically
                    elif self._is_round_column(i, headers, is_speaker_tab, is_team_tab):
                        if is_speaker_tab:
                            self._debug(f"Checking speaker tab column {i} for round score: '{cell_text}'")
                            if cell_text.replace('.', '').isdigit():
                                try:
                                    round_num = self._get_round_number_from_column(i, headers, is_speaker_tab)
                                    if round_num:
                                        score = float(cell_text)
                                        # Check if we already have this round to avoid duplicates
                                        existing_rounds = [r['round'] for r in self.debater_data['round_results'] if r.get('type') == 'speaker']
                                        if round_num not in existing_rounds:
                                            # Add motion topic if available
                                            motion_topic = self.debater_data.get('motions', {}).get(round_num, '')
                                            
                                            self.debater_data['round_results'].append({
                                                'round': round_num,
                                                'score': score,
                                                'type': 'speaker',
                                                'motion': motion_topic
                                            })
                                            self._debug(f"Extracted R{round_num} score: {score}, motion: {motion_topic[:50] if motion_topic else 'N/A'}...")
                                except Exception as e:
                                    self._debug(f"Failed to extract R{round_num} score: {e}")
                        elif is_team_tab:
                            self._debug(f"Checking team tab column {i} for round placement: '{cell_text}'")
                            # Team tab shows placement text (e.g., 1st/2nd) and points summary in popover
                            placement_text = cell_text.strip().lower()
                            placement_points_map = {'1st': 3, '2nd': 2, '3rd': 1, '4th': 0}
                            team_points = placement_points_map.get(placement_text)
                            # Try to extract total speaker score for that debate from popover
                            debate_score = None
                            try:
                                pop = cell.get('popover') or {}
                                for content_item in pop.get('content') or []:
                                    text_val = str(content_item.get('text', ''))
                                    if 'total speaker score' in text_val.lower():
                                        # Extract numeric value
                                        nums = [s for s in text_val.split() if s.replace('.', '').isdigit()]
                                        if nums:
                                            debate_score = float(nums[-1])
                                            break
                            except Exception:
                                pass
                            try:
                                round_num = self._get_round_number_from_column(i, headers, is_team_tab)
                                if round_num:
                                    existing_rounds = [r['round'] for r in self.debater_data['round_results'] if r.get('type') == 'team']
                                    if round_num not in existing_rounds:
                                        # Add motion topic if available
                                        motion_topic = self.debater_data.get('motions', {}).get(round_num, '')
                                        
                                        self.debater_data['round_results'].append({
                                            'round': round_num,
                                            'placement': placement_text,
                                            'team_points': team_points,
                                            'team_debate_score': debate_score,
                                            'type': 'team',
                                            'motion': motion_topic
                                        })
                                        self._debug(f"Extracted team round R{round_num}: placement={placement_text}, points={team_points}, debate_score={debate_score}, motion: {motion_topic[:50] if motion_topic else 'N/A'}...")
                            except Exception as e:
                                self._debug(f"Failed to extract team round R{round_num}: {e}")
                    
                    # Extract total/average scores and team statistics
                    elif i >= 9 and cell_text.replace('.', '').isdigit():
                        try:
                            score = float(cell_text)
                            if i < len(headers):
                                header_key = headers[i].lower()
                                if is_speaker_tab:
                                    if 'total' in header_key:
                                        self.debater_data['speaker_stats']['total_score'] = score
                                        self._debug(f"Extracted total score: {score}")
                                    elif 'avg' in header_key:
                                        self.debater_data['speaker_stats']['average_score'] = score
                                        self._debug(f"Extracted average score: {score}")
                                    elif header_key == 'team' or 'pts' in header_key:
                                        # Column 'Team' holds accumulated team points (e.g., 13)
                                        self.debater_data['team_stats']['total_points'] = score
                                        self._debug(f"Extracted team total points from speaker tab: {score}")
                                elif is_team_tab:
                                    if header_key == 'team' or 'pts' in header_key:
                                        self.debater_data['team_stats']['total_points'] = score
                                        self._debug(f"Extracted team total points: {score}")
                                    elif 'spk' in header_key or 'speaker' in header_key:
                                        self.debater_data['team_stats']['total_speaker_score'] = score
                                        self._debug(f"Extracted total speaker score: {score}")
                                    elif '1sts' in header_key or '1st' in header_key:
                                        self.debater_data['team_stats']['first_places'] = int(score)
                                        self._debug(f"Extracted first places: {int(score)}")
                                    elif '2nds' in header_key or '2nd' in header_key:
                                        self.debater_data['team_stats']['second_places'] = int(score)
                                        self._debug(f"Extracted second places: {int(score)}")
                        except:
                            pass
    
    def _is_name_match(self, text: str) -> bool:
        """Check if text contains a match for our debater's name."""
        text_lower = text.lower().strip()
        first_lower = self.first_name.lower().strip()
        last_lower = self.last_name.lower().strip()
        full_lower = self.full_name.lower().strip()
        
        # Direct matches
        if full_lower in text_lower:
            return True
        
        # First and last name both present
        if first_lower in text_lower and last_lower in text_lower:
            return True
        
        # Check for reversed name order (last, first)
        reversed_name = f"{last_lower}, {first_lower}"
        if reversed_name in text_lower:
            return True
        
        # Check for just first name or just last name
        if text_lower == first_lower or text_lower == last_lower:
            return True
        
        return False
    
    def _is_round_column(self, column_index: int, headers: list, is_speaker_tab: bool, is_team_tab: bool) -> bool:
        """Check if a column index represents a round column."""
        if column_index >= len(headers):
            return False
        
        header_text = headers[column_index].lower()
        
        # Check if header explicitly mentions round
        if 'round' in header_text or re.search(r'r\d+', header_text):
            return True
        
        # For speaker tab: check if it's in the expected range for round scores
        if is_speaker_tab:
            # Skip first few columns (rank, name, team, etc.) and look for round columns
            # This is more flexible than hardcoded ranges
            return column_index >= 4 and self._looks_like_round_header(header_text)
        
        # For team tab: check if it's in the expected range for round results
        if is_team_tab:
            # Skip first few columns (rank, team name, etc.) and look for round columns
            return column_index >= 3 and self._looks_like_round_header(header_text)
        
        return False
    
    def _looks_like_round_header(self, header_text: str) -> bool:
        """Check if header text looks like it could be a round column."""
        # Look for round indicators in header
        if 'round' in header_text or re.search(r'r\d+', header_text):
            return True
        
        # Check if it's a numeric round reference
        if re.search(r'\d+', header_text):
            return True
        
        # Check if it's a placement/result column (1st, 2nd, etc.)
        if any(word in header_text for word in ['1st', '2nd', '3rd', '4th', 'place', 'result']):
            return True
        
        return False
    
    def _get_round_number_from_column(self, column_index: int, headers: list, is_speaker_tab: bool) -> Optional[int]:
        """Extract round number from column index and headers."""
        if column_index >= len(headers):
            return None
        
        header_text = headers[column_index].lower()
        
        # First try to extract round number from header text
        round_match = re.search(r'(?:round|r)?(\d+)', header_text)
        if round_match:
            return int(round_match.group(1))
        
        # Fallback: calculate round number based on column position
        if is_speaker_tab:
            # Speaker tab: column 4 = R1, column 5 = R2, etc.
            return column_index - 3
        else:
            # Team tab: column 3 = R1, column 4 = R2, etc.
            return column_index - 2
    
    def _convert_to_speeches(self) -> List[Dict]:
        """Convert extracted data to speech records for database insertion."""
        speeches = []
        
        # Group round results by round number to combine team and speaker data
        rounds_map = {}
        
        for round_result in self.debater_data['round_results']:
            round_num = round_result.get('round')
            if round_num not in rounds_map:
                rounds_map[round_num] = {
                    'round': round_num,
                    'motion': round_result.get('motion', '') or self.debater_data.get('motions', {}).get(round_num, ''),
                    'speaker_score': None,
                    'team_placement': None,
                    'team_points': None,
                    'team_debate_score': None
                }
            
            # Add data based on type
            if round_result.get('type') == 'speaker':
                rounds_map[round_num]['speaker_score'] = round_result.get('score')
            elif round_result.get('type') == 'team':
                rounds_map[round_num]['team_placement'] = round_result.get('placement')
                rounds_map[round_num]['team_points'] = round_result.get('team_points')
                rounds_map[round_num]['team_debate_score'] = round_result.get('team_debate_score')
        
        # Convert to speech records
        for round_data in rounds_map.values():
            speech = {
                'tournament_name': self.debater_data['personal_info'].get('tournament_name', ''),
                'round': round_data['round'],
                'motion': round_data['motion'],
                'partner': self.debater_data['team_info'].get('partner', ''),
                'speaker_score': round_data['speaker_score'],
                'team_placement': round_data['team_placement'],
                'team_points': round_data['team_points'],
                'team_debate_score': round_data['team_debate_score'],
                'debate_format': 'BP',  # Default, could be detected from tournament
                'speaker_name': self.full_name,
                'team_name': self.debater_data['team_info'].get('team_name', ''),
                'institution': self.debater_data['personal_info'].get('institution', ''),
                'speaker_rank': self.debater_data['rankings'].get('speaker_rank'),
                'team_rank': self.debater_data['rankings'].get('team_rank'),
                'break_status': self.debater_data['break_status']
            }
            speeches.append(speech)
        
        return speeches
    
    def _get_combined_round_data(self) -> List[Dict]:
        """Get combined round data with both speaker and team information."""
        combined_rounds = []
        
        # Group round results by round number
        rounds_map = {}
        
        for round_result in self.debater_data['round_results']:
            round_num = round_result.get('round')
            if round_num not in rounds_map:
                rounds_map[round_num] = {
                    'round': round_num,
                    'motion': round_result.get('motion', '') or self.debater_data.get('motions', {}).get(round_num, ''),
                    'speaker': None,
                    'team': None
                }
            
            # Add data based on type
            if round_result.get('type') == 'speaker':
                rounds_map[round_num]['speaker'] = {
                    'score': round_result.get('score'),
                    'type': round_result.get('type')
                }
            elif round_result.get('type') == 'team':
                rounds_map[round_num]['team'] = {
                    'placement': round_result.get('placement'),
                    'team_points': round_result.get('team_points'),
                    'team_debate_score': round_result.get('team_debate_score'),
                    'type': round_result.get('type')
                }
        
        # Convert to list and sort by round number
        for round_num in sorted(rounds_map.keys()):
            combined_rounds.append(rounds_map[round_num])
        
        return combined_rounds


def scrape_personal_tabbycat_data(url: str, first_name: str, last_name: str, 
                                 institution: str = "") -> Dict[str, Any]:
    """Main function to scrape personalized Tabbycat tournament data."""
    try:
        scraper = PersonalTabbycatScraper(url, first_name, last_name, institution)
        result = scraper.scrape_personal_data()
        return result
            
    except Exception as e:
        return {
            'success': False,
            'error': f"Personal scraper initialization failed: {str(e)}"
        }


def main():
    """Main function for command line usage."""
    if len(sys.argv) < 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python tabbycat_scraper.py <url> <first_name> <last_name> [institution]'
        }))
        sys.exit(1)
    
    url = sys.argv[1]
    first_name = sys.argv[2]
    last_name = sys.argv[3]
    institution = sys.argv[4] if len(sys.argv) > 4 else ""
    
    result = scrape_personal_tabbycat_data(url, first_name, last_name, institution)
    print(json.dumps(result))


if __name__ == "__main__":
    main()