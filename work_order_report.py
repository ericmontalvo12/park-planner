#!/usr/bin/env python3
"""
Monday.com Work Order PDF Generator
Pulls updates from the Apartments board and generates a PDF report.
Buildings grouped: Bird Rd umbrella, WD 1077 + WD SEC8 1077 merged.
"""

import requests
import os
import re
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    KeepTogether, Table, TableStyle
)
from reportlab.lib.enums import TA_CENTER

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
MONDAY_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjY0MTkzNzczMiwiYWFpIjoxMSwidWlkIjo3OTk4MzYxMywiaWFkIjoiMjAyNi0wNC0wNlQxMzo1Nzo0MS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzA4NDA2MDUsInJnbiI6InVzZTEifQ.b1a3xC3o1EoS-Tl4cIxr6-jLTzE1Iz-vpwTeKRcr_J4"
BOARD_ID         = "9823375384"
OUTPUT_DIR       = os.path.expanduser("~/Desktop")

# How many days back to pull updates
# Change to 1 for normal daily use
LOOKBACK_DAYS = 2

# Filter to specific buildings — use the DISPLAY names below
# Leave empty [] to include ALL buildings
ONLY_BUILDINGS = []
# Examples:
#   ONLY_BUILDINGS = ["WD 1077"]
#   ONLY_BUILDINGS = ["Bird Rd", "Sunset"]
#   ONLY_BUILDINGS = []  ← prints everything
# ─────────────────────────────────────────────

MONDAY_API_URL = "https://api.monday.com/v2"

BUILDING_RULES = {
    "WD 1077":       {"merge_as": "WD 1077"},
    "WD SEC8 1077":  {"merge_as": "WD 1077"},
}

DISPLAY_ORDER = [
    "1750 Elite View Apartments",
    "WD 1077",
    "10250 Green Lake",
    "Sunset",
]

SECTION_COLORS = [
    colors.HexColor("#0073ea"),
    colors.HexColor("#00c875"),
    colors.HexColor("#e2445c"),
    colors.HexColor("#ff642e"),
    colors.HexColor("#9d50dd"),
    colors.HexColor("#0086c0"),
    colors.HexColor("#cab641"),
    colors.HexColor("#037f4c"),
    colors.HexColor("#bb3354"),
]


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def strip_html(html_text):
    """Strip HTML, preserve bullet lists and line breaks as plain text."""
    text = re.sub(r'<li[^>]*>', '\n• ', html_text, flags=re.IGNORECASE)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|div|ul|ol|h\d)>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('\ufeff', '').replace('\xa0', ' ')
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip() or "(no text)"


def get_display_name(group_title):
    """Get the display name for a group based on building rules."""
    rule = BUILDING_RULES.get(group_title)
    if rule and "merge_as" in rule:
        return rule["merge_as"]
    if rule and "umbrella" in rule:
        return rule["umbrella"]
    return group_title


# ─────────────────────────────────────────────
# MONDAY.COM API
# ─────────────────────────────────────────────

def fetch_checklist_items(checklist_id):
    """Fetch checklist items for a given checklist ID via Monday.com API."""
    query = """
    query ($checklistId: ID!) {
      checklists(ids: [$checklistId]) {
        id
        items {
          id
          name
          is_checked
        }
      }
    }
    """
    headers = {
        "Authorization": MONDAY_API_TOKEN,
        "Content-Type": "application/json",
        "API-Version": "2024-01"
    }
    try:
        response = requests.post(
            MONDAY_API_URL,
            json={"query": query, "variables": {"checklistId": checklist_id}},
            headers=headers
        )
        data = response.json()
        if "errors" in data or not data.get("data", {}).get("checklists"):
            return []
        return data["data"]["checklists"][0]["items"]
    except Exception:
        return []


def resolve_body(body):
    """
    Given an update body, resolve checklist placeholders to real text.
    Returns clean plain text ready for the PDF.
    """
    checklist_ids = re.findall(r"data-checklist-id='(\d+)'", body)

    if checklist_ids:
        lines = []
        for cid in checklist_ids:
            items = fetch_checklist_items(cid)
            for item in items:
                check = "☑" if item.get("is_checked") else "☐"
                lines.append(f"{check} {item['name']}")
        plain = strip_html(re.sub(r"<ul[^>]*data-checklist[^>]*>.*?</ul>", "", body, flags=re.DOTALL))
        if plain and plain != "(no text)":
            lines.insert(0, plain)
        return "\n".join(lines) if lines else "(no text)"

    return strip_html(body)


def get_board_items():
    query = """
    query ($boardId: [ID!]!) {
      boards(ids: $boardId) {
        name
        items_page(limit: 500) {
          items {
            id
            name
            group { id title }
            column_values {
              id
              type
              text
              column { title }
            }
            updates(limit: 5) {
              id
              body
              created_at
              creator { name }
            }
          }
        }
      }
    }
    """
    headers = {
        "Authorization": MONDAY_API_TOKEN,
        "Content-Type": "application/json",
        "API-Version": "2024-01"
    }
    response = requests.post(
        MONDAY_API_URL,
        json={"query": query, "variables": {"boardId": [BOARD_ID]}},
        headers=headers
    )
    response.raise_for_status()
    data = response.json()
    if "errors" in data:
        raise Exception(f"Monday.com API error: {data['errors']}")
    return data["data"]["boards"][0]


def get_recent_updates(updates):
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)
    return [
        u for u in updates
        if datetime.fromisoformat(u["created_at"].replace("Z", "+00:00")) >= cutoff
    ]


def update_item_status(item_id, column_id, new_label):
    """Change a status column value on a Monday.com item by label name."""
    mutation = """
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: String!) {
      change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }
    """
    headers = {
        "Authorization": MONDAY_API_TOKEN,
        "Content-Type": "application/json",
        "API-Version": "2024-01"
    }
    response = requests.post(
        MONDAY_API_URL,
        json={
            "query": mutation,
            "variables": {
                "boardId": BOARD_ID,
                "itemId": str(item_id),
                "columnId": column_id,
                "value": new_label,
            }
        },
        headers=headers
    )
    data = response.json()
    if "errors" in data:
        print(f"  ⚠️  Failed to update item {item_id} column {column_id}: {data['errors']}")
        return False
    return True


def mark_needs_work_as_scheduled(board):
    """
    Scan all items on the board. For every status column whose text is
    'Needs work', change it to 'Scheduled' via the Monday.com API.
    """
    updated_count = 0
    for item in board["items_page"]["items"]:
        item_id   = item["id"]
        item_name = item["name"]
        for col in item["column_values"]:
            if col.get("type") != "color":
                continue
            if col.get("text", "").strip().lower() != "needs work":
                continue
            col_id    = col["id"]
            col_title = col.get("column", {}).get("title", col_id)
            print(f"  → Updating '{item_name}' [{col_title}]: Needs work → Scheduled")
            if update_item_status(item_id, col_id, "Scheduled"):
                col["text"] = "Scheduled"  # reflect change locally so PDF shows new value
                updated_count += 1
    return updated_count


# ─────────────────────────────────────────────
# BUILDING ORGANIZATION
# ─────────────────────────────────────────────

def organize_buildings(board):
    merged   = defaultdict(list)
    umbrella = defaultdict(lambda: defaultdict(list))

    for item in board["items_page"]["items"]:
        recent_updates = get_recent_updates(item["updates"])
        if not recent_updates:
            continue

        group_title  = item["group"]["title"]
        display_name = get_display_name(group_title)

        if ONLY_BUILDINGS and display_name not in ONLY_BUILDINGS:
            continue

        rule = BUILDING_RULES.get(group_title)
        if rule and "merge_as" in rule:
            merged[rule["merge_as"]].append((item, recent_updates))
        elif rule and "umbrella" in rule:
            umbrella[rule["umbrella"]][group_title].append((item, recent_updates))
        else:
            merged[group_title].append((item, recent_updates))

    sections = []
    seen = set()

    def add_standalone(name):
        if name in seen or not merged.get(name):
            return
        sections.append({"display_name": name, "type": "standalone", "units": merged[name]})
        seen.add(name)

    def add_umbrella(name):
        if name in seen or not any(umbrella.get(name, {}).values()):
            return
        sections.append({"display_name": name, "type": "umbrella", "units": [], "sub_buildings": dict(umbrella[name])})
        seen.add(name)

    for name in DISPLAY_ORDER:
        if name in umbrella:
            add_umbrella(name)
        else:
            add_standalone(name)

    for name in list(merged.keys()) + list(umbrella.keys()):
        if name not in seen:
            add_umbrella(name) if name in umbrella else add_standalone(name)

    return sections


# ─────────────────────────────────────────────
# PDF GENERATION
# ─────────────────────────────────────────────

def build_pdf(sections, output_path):
    now = datetime.now().strftime("%B %d, %Y")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    style_title    = ParagraphStyle("T", fontSize=20, fontName="Helvetica-Bold",
                                    textColor=colors.HexColor("#0073ea"), spaceAfter=4)
    style_subtitle = ParagraphStyle("S", fontSize=10, fontName="Helvetica",
                                    textColor=colors.HexColor("#666666"), spaceAfter=16)
    style_bldg     = ParagraphStyle("B", fontSize=14, fontName="Helvetica-Bold",
                                    textColor=colors.white)
    style_sub      = ParagraphStyle("SB", fontSize=12, fontName="Helvetica-Bold",
                                    textColor=colors.HexColor("#333333"), spaceAfter=4)
    style_meta     = ParagraphStyle("M", fontSize=8, fontName="Helvetica",
                                    textColor=colors.HexColor("#999999"), spaceAfter=3)
    style_body     = ParagraphStyle("BD", fontSize=10, fontName="Helvetica",
                                    textColor=colors.HexColor("#333333"), leading=15, spaceAfter=6)
    style_status   = ParagraphStyle("ST", fontSize=8, fontName="Helvetica",
                                    textColor=colors.HexColor("#555555"), spaceAfter=6)
    style_footer   = ParagraphStyle("F", fontSize=8, fontName="Helvetica",
                                    textColor=colors.HexColor("#bbbbbb"), alignment=TA_CENTER)

    total_units = sum(
        len(s["units"]) + sum(len(v) for v in s.get("sub_buildings", {}).values())
        for s in sections
    )

    story = []

    story.append(Paragraph("Daily Work Order Report", style_title))
    story.append(Paragraph(
        f"{now}  ·  {len(sections)} propert{'y' if len(sections)==1 else 'ies'}  ·  {total_units} unit{'s' if total_units!=1 else ''} with updates",
        style_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#dddddd")))
    story.append(Spacer(1, 12))

    def render_unit(item, updates, accent):
        elems = []
        unit_name = item["name"]

        style_unit = ParagraphStyle("U", fontSize=12, fontName="Helvetica-Bold",
                                     textColor=accent, spaceAfter=2)
        elems.append(Paragraph(f"Unit {unit_name}", style_unit))

        status_parts = []
        for col in item["column_values"]:
            col_title = col.get("column", {}).get("title")
            if col["text"] and col["text"].strip() and col_title not in ["Name", None]:
                status_parts.append(f"{col_title}: {col['text']}")
        if status_parts:
            elems.append(Paragraph("  |  ".join(status_parts[:6]), style_status))

        for update in updates:
            created = datetime.fromisoformat(update["created_at"].replace("Z", "+00:00"))
            created_str = created.strftime("%b %d, %Y at %I:%M %p")
            creator = update["creator"]["name"] if update["creator"] else "Unknown"
            body = resolve_body(update["body"]).replace('\n', '<br/>')

            elems.append(Paragraph(f"{creator}  ·  {created_str}", style_meta))
            elems.append(Paragraph(body, style_body))

        elems.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#eeeeee")))
        elems.append(Spacer(1, 6))
        return elems

    for idx, section in enumerate(sections):
        color = SECTION_COLORS[idx % len(SECTION_COLORS)]
        name  = section["display_name"]

        banner = Table(
            [[Paragraph(f"  {name}", style_bldg)]],
            colWidths=[7 * inch]
        )
        banner.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), color),
            ("TOPPADDING",   (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 9),
            ("LEFTPADDING",  (0, 0), (-1, -1), 12),
        ]))
        story.append(KeepTogether([banner, Spacer(1, 10)]))

        if section["type"] == "standalone":
            for item, updates in section["units"]:
                story.extend(render_unit(item, updates, color))

        elif section["type"] == "umbrella":
            for sub_name, units in section["sub_buildings"].items():
                if not units:
                    continue
                story.append(Paragraph(f"  {sub_name}", style_sub))
                story.append(HRFlowable(width="100%", thickness=0.5, color=color))
                story.append(Spacer(1, 6))
                for item, updates in units:
                    story.extend(render_unit(item, updates, color))
                story.append(Spacer(1, 8))

        story.append(Spacer(1, 16))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#dddddd")))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Generated automatically — {now}", style_footer))

    doc.build(story)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print("🔄 Fetching board data from Monday.com...")
    board = get_board_items()
    print(f"✅ Board loaded: {board['name']}")

    print("🔁 Checking for 'Needs work' items to mark as 'Scheduled'...")
    updated = mark_needs_work_as_scheduled(board)
    if updated:
        print(f"✅ Updated {updated} status field(s) to 'Scheduled'")
    else:
        print("ℹ️  No 'Needs work' items found")

    print("📝 Organizing units...")
    sections = organize_buildings(board)

    if not sections:
        print("ℹ️  No updates found. No PDF generated.")
        return

    total_units = sum(
        len(s["units"]) + sum(len(v) for v in s.get("sub_buildings", {}).values())
        for s in sections
    )

    now_str  = datetime.now().strftime("%Y-%m-%d")
    suffix   = f"_{ONLY_BUILDINGS[0].replace(' ', '_')}" if len(ONLY_BUILDINGS) == 1 else ""
    filename = f"Work_Orders{suffix}_{now_str}.pdf"
    output_path = os.path.join(OUTPUT_DIR, filename)

    print(f"📄 Generating PDF — {total_units} unit(s) across {len(sections)} building(s)...")
    build_pdf(sections, output_path)
    print(f"✅ Done! PDF saved to: {output_path}")


if __name__ == "__main__":
    main()
