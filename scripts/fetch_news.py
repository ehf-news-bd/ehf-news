#!/usr/bin/env python3
"""Fetch public RSS/Atom headlines and publish a small JSON index for EHF News.
Only headlines, short feed descriptions, source names and links are stored.
"""
import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "news.json"
FEEDS = [
    # Bangladesh
    ("The Daily Star", "Bangladesh", "https://www.thedailystar.net/frontpage/rss.xml"),
    ("bdnews24.com", "Bangladesh", "https://bdnews24.com/?widgetName=rssfeed&widgetId=1150&getXmlFeed=true"),
    ("Bangla News 24", "Bangladesh", "https://www.banglanews24.com/rss/rss.xml"),
    ("Jugantor", "Bangladesh", "https://www.jugantor.com/feed/rss.xml"),
    ("Jago News 24", "Bangladesh", "https://www.jagonews24.com/rss/rss.xml"),
    ("Kaler Kantho", "Bangladesh", "https://www.kalerkantho.com/rss.xml"),
    ("Prothom Alo", "Bangladesh", "https://www.prothomalo.com/feed/"),
    # International
    ("BBC News", "World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("Al Jazeera", "World", "https://www.aljazeera.com/xml/rss/all.xml"),
    ("DW", "World", "https://rss.dw.com/xml/rss-en-all"),
    ("France 24", "World", "https://www.france24.com/en/rss"),
]
NS = {"atom": "http://www.w3.org/2005/Atom"}

def clean(value):
    value = unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()[:360]

def child_text(node, names):
    for name in names:
        el = node.find(name)
        if el is not None and el.text:
            return el.text.strip()
    return ""

def parse_date(raw):
    if not raw:
        return ""
    try:
        dt = parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        except Exception:
            return ""

def parse_feed(xml_bytes, source, category):
    root = ET.fromstring(xml_bytes)
    found = []
    # RSS 2.0 / RDF items
    for item in root.findall(".//item"):
        title = child_text(item, ["title"])
        link = child_text(item, ["link"])
        desc = child_text(item, ["description", "{http://purl.org/rss/1.0/modules/content/}encoded"])
        pub = child_text(item, ["pubDate", "{http://purl.org/dc/elements/1.1/}date"])
        if title and link.startswith("http"):
            found.append({"title": clean(title), "link": link, "summary": clean(desc), "source": source, "category": category, "published": parse_date(pub)})
    # Atom
    for entry in root.findall(".//atom:entry", NS):
        title = child_text(entry, ["atom:title".replace("atom:", "{http://www.w3.org/2005/Atom}")])
        link = ""
        for a in entry.findall("atom:link", NS):
            if a.attrib.get("rel", "alternate") == "alternate" and a.attrib.get("href"):
                link = a.attrib["href"]
                break
        summary = child_text(entry, ["{http://www.w3.org/2005/Atom}summary", "{http://www.w3.org/2005/Atom}content"])
        pub = child_text(entry, ["{http://www.w3.org/2005/Atom}published", "{http://www.w3.org/2005/Atom}updated"])
        if title and link.startswith("http"):
            found.append({"title": clean(title), "link": link, "summary": clean(summary), "source": source, "category": category, "published": parse_date(pub)})
    return found

def main():
    all_items, errors = [], []
    for source, category, url in FEEDS:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "EHF-News-RSS-Aggregator/1.0 (public RSS reader)"})
            with urllib.request.urlopen(req, timeout=18) as response:
                data = response.read(2_500_000)
            items = parse_feed(data, source, category)
            if not items:
                errors.append(source + ": no items parsed")
            all_items.extend(items[:30])
        except Exception as exc:
            errors.append(source + ": " + str(exc)[:140])
        time.sleep(0.4)

    unique = {}
    for item in all_items:
        key = item["link"].split("#", 1)[0]
        if key and key not in unique:
            unique[key] = item
    items = list(unique.values())
    items.sort(key=lambda x: x.get("published") or "", reverse=True)
    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "count": min(len(items), 100),
        "sourcesChecked": len(FEEDS),
        "items": items[:100],
        "sourceErrors": errors,
        "notice": "Headlines and short summaries are from publisher feeds. Open the publisher link for the full article."
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {payload['count']} news items; {len(errors)} feed issues")
    if not items:
        raise SystemExit("No feed items were retrieved; keeping workflow failed for visibility.")

if __name__ == "__main__":
    main()
