import os
import sys
import json
import argparse
from typing import List, Dict, TypedDict
import requests
from bs4 import BeautifulSoup
from googlesearch import search
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END

class AgentState(TypedDict):
    motion: str
    side: str
    queries: List[str]
    raw_research: List[Dict[str, str]]
    final_prep_doc: str
    error: str

def init_llm(model_name="gemini-2.5-flash"):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing.")
    return ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key, max_retries=2)

def planner_node(state: AgentState) -> dict:
    motion = state["motion"]
    side = state.get("side", "proposition")
    side_label = "Proposition" if side == "proposition" else "Opposition"
    llm = init_llm()
    
    prompt = f"""You are an elite competitive debate researcher. Your team is on the {side_label} side, preparing for:
"{motion}"

Generate exactly 5 highly specific Google search queries to find the strongest possible evidence FOR THE {side_label.upper()} SIDE. Each query MUST target a different type of evidence:

1. A specific real-world CASE STUDY or COUNTRY EXAMPLE that supports the {side_label} position (e.g. "Singapore public housing policy outcomes statistics" not "public housing benefits")
2. A specific STATISTIC or DATA POINT with numbers that strengthens the {side_label} case (e.g. "percentage GDP healthcare spending OECD 2023" not "healthcare spending data")
3. A specific EXPERT OPINION or STUDY from a named institution supporting {side_label} (e.g. "World Bank report developing nations resource nationalization" not "resource nationalization research")
4. A specific COUNTEREXAMPLE or FAILURE CASE that weakens the opposing side's arguments (e.g. "Venezuela oil nationalization economic collapse timeline" not "nationalization risks")
5. A RECENT NEWS EVENT or DEVELOPMENT from the last 2 years that the {side_label} can leverage (e.g. "EU fiscal policy reform 2024 proposals" not "EU fiscal policy")

Rules:
- Focus queries on finding evidence that helps the {side_label} WIN
- Never use generic academic terms like "pros and cons" or "benefits and drawbacks"
- Always include a country name, organization name, year, or specific metric in each query
- Prefer queries that would return news articles, policy papers, or data tables

Output ONLY a raw JSON array of exactly 5 strings. No markdown, no backticks.
"""
    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        
        queries = json.loads(content.strip())
        if not isinstance(queries, list):
            queries = [str(queries)]
        return {"queries": queries[:5]}
    except Exception as e:
        return {"error": f"Planner failed: {str(e)}", "queries": []}

def scrape_url(url: str) -> str:
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = soup.get_text(separator=' ')
        # Collapse whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        # return first 4000 characters to keep context windows safe
        return text[:4000]
    except Exception:
        return ""

def researcher_node(state: AgentState) -> dict:
    if state.get("error"):
        return {"raw_research": []}
        
    queries = state["queries"]
    raw_research = []
    llm = init_llm("gemini-2.5-flash")
    
    for idx, query in enumerate(queries):
        sys.stderr.write(json.dumps({"phase": "research", "query_index": idx, "total": len(queries), "query": query}) + "\n")
        sys.stderr.flush()
        
        urls = []
        try:
            for j in search(query, num=2, stop=2, pause=1):
                urls.append(j)
        except Exception:
            continue
            
        for url in urls:
            page_text = scrape_url(url)
            if not page_text or len(page_text) < 200:
                continue
                
            prompt = f"""Extract 2-3 specific, factual bullet points (statistics, studies, or concrete examples) from this text that relate to the search query: "{query}".
Ignore ads and fluff. If nothing relevant is found, output exactly "".
Text: {page_text}"""
            
            try:
                summary = llm.invoke(prompt).content.strip()
                if summary and summary.lower() != 'none.':
                    raw_research.append({"query": query, "url": url, "finding": summary})
            except Exception:
                pass
                
    return {"raw_research": raw_research}

def drafter_node(state: AgentState) -> dict:
    sys.stderr.write(json.dumps({"phase": "drafting"}) + "\n")
    sys.stderr.flush()
    
    if state.get("error"):
        return {"final_prep_doc": f"**Error occurred during prep:** {state['error']}"}
        
    motion = state["motion"]
    side = state.get("side", "proposition")
    side_label = "Proposition" if side == "proposition" else "Opposition"
    raw_research = state["raw_research"]
    llm = init_llm("gemini-2.5-flash")
    
    research_text = ""
    for idx, r in enumerate(raw_research):
        research_text += f"\n[{idx+1}] Query: {r['query']}\nURL: {r['url']}\nFindings:\n{r['finding']}\n"
    
    prompt = f"""You are a master debate coach. Your team is on the {side_label} side, debating:
"{motion}"

You have conducted the following web research:
{research_text}

Write a comprehensive, professional Debate Prep Document in Markdown specifically for the {side_label} side.
Structure it carefully using these headers:
## Context & Characterizations
## Your Case ({side_label})
Provide 2-3 strong, structured arguments for the {side_label} side. Each argument should have a clear label, mechanism, impact, and supporting evidence from the research.
## Anticipated Opposition Arguments
Predict the strongest 2 arguments the other side will make, and provide specific rebuttals and pre-emptions for each.
## Key Clashes
Identify what this debate will come down to and explain how the {side_label} wins each clash.
## Evidence Bank
Organize the most useful statistics, examples, and citations from the research above into quick-reference bullet points.

Do NOT include a top-level title heading. Start directly with the first ## section.
Use standard markdown: - for lists, **bold** for emphasis. Do not use * for list items.
"""
    try:
        doc = llm.invoke(prompt).content.strip()
        return {"final_prep_doc": doc}
    except Exception as e:
        return {"final_prep_doc": f"Failed to draft document: {str(e)}"}

def build_plan_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("planner", planner_node)
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", END)
    return workflow.compile()

def build_research_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("drafter", drafter_node)
    workflow.add_edge(START, "researcher")
    workflow.add_edge("researcher", "drafter")
    workflow.add_edge("drafter", END)
    return workflow.compile()

def build_full_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("planner", planner_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("drafter", drafter_node)
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "researcher")
    workflow.add_edge("researcher", "drafter")
    workflow.add_edge("drafter", END)
    return workflow.compile()

def main():
    parser = argparse.ArgumentParser(description="AI Debate Prep Strategist")
    parser.add_argument("motion", type=str, help="The debate motion to prepare for.")
    parser.add_argument("--mode", type=str, choices=["full", "plan", "research"], default="full",
                        help="Mode: 'plan' returns queries only, 'research' takes queries and returns document, 'full' does both.")
    parser.add_argument("--queries", type=str, default=None,
                        help="JSON array of search queries (required for 'research' mode).")
    parser.add_argument("--side", type=str, choices=["proposition", "opposition"], default="proposition",
                        help="Which side the team is on: proposition or opposition.")
    args = parser.parse_args()
    
    try:
        if args.mode == "plan":
            graph = build_plan_graph()
            initial_state = {
                "motion": args.motion,
                "side": args.side,
                "queries": [],
                "raw_research": [],
                "final_prep_doc": "",
                "error": ""
            }
            final_state = graph.invoke(initial_state)
            if final_state.get("error"):
                output = {"success": False, "error": final_state["error"]}
            else:
                output = {
                    "success": True,
                    "queries": final_state.get("queries", [])
                }
            
        elif args.mode == "research":
            if not args.queries:
                print(json.dumps({"success": False, "error": "--queries is required for research mode."}))
                return
            queries = json.loads(args.queries)
            graph = build_research_graph()
            initial_state = {
                "motion": args.motion,
                "side": args.side,
                "queries": queries,
                "raw_research": [],
                "final_prep_doc": "",
                "error": ""
            }
            final_state = graph.invoke(initial_state)
            if final_state.get("error"):
                output = {"success": False, "error": final_state["error"]}
            else:
                output = {
                    "success": True,
                    "document": final_state.get("final_prep_doc", "")
                }
            
        else:  # full
            graph = build_full_graph()
            initial_state = {
                "motion": args.motion,
                "side": args.side,
                "queries": [],
                "raw_research": [],
                "final_prep_doc": "",
                "error": ""
            }
            final_state = graph.invoke(initial_state)
            if final_state.get("error"):
                output = {"success": False, "error": final_state["error"]}
            else:
                output = {
                    "success": True,
                    "queries": final_state.get("queries", []),
                    "document": final_state.get("final_prep_doc", "")
                }
        
        print(json.dumps(output))
    except Exception as e:
        error_output = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_output))

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except (AttributeError, OSError):
        pass
    main()
