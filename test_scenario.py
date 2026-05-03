#!/usr/bin/env python3
"""End-to-end test: Rome family trip with 12 fragments via MCP tools."""

import json, re, sys, requests

BASE = "http://localhost:8000"
MCP = f"{BASE}/mcp/travel-agent/"
_msg_id = 0
def nid():
    global _msg_id; _msg_id += 1; return _msg_id

def mcp(method, params=None):
    payload = {"jsonrpc": "2.0", "id": nid(), "method": method}
    if params: payload["params"] = params
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    r = requests.post(MCP, json=payload, headers=h, timeout=15)
    return _parse(r)

def _parse(resp):
    if resp.status_code != 200:
        return {"_err": f"HTTP {resp.status_code}", "_body": resp.text[:300]}
    ct = resp.headers.get("content-type", "")
    if "text/event-stream" in ct:
        for line in resp.text.split("\n"):
            if line.startswith("data: "):
                try:
                    d = json.loads(line[6:])
                    if "result" in d: return d["result"]
                except: pass
        return {"_err": "no result in SSE"}
    try:
        return resp.json().get("result", resp.json())
    except:
        return {"_err": "parse failed", "_body": resp.text[:200]}

def txt(r):
    if not r or "_err" in r: return None
    for c in (r.get("content") or []):
        if c.get("type") == "text": return c["text"]
    return None

def ok(r): return r and "_err" not in r

def main():
    P, F = 0, 0
    trip_id = None
    item_ids = []

    print("=" * 60)
    print("🧪 ROME FAMILY TRIP — End-to-End MCP Test")
    print("=" * 60)

    # 0: Init
    print("\n📡 0. Initialize MCP")
    r = mcp("initialize", {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}})
    if ok(r):
        print(f"   ✅ {r.get('serverInfo',{}).get('name','?')}")
        P += 1
    else:
        print(f"   ❌ {r}"); F += 1; return 1

    # 1: Create trip
    print("\n📌 1. Create trip")
    r = mcp("tools/call", {"name": "create_trip", "arguments": {
        "title": "Rome Family Trip", "destination": "Rome",
        "start_date": "2026-05-25", "end_date": "2026-06-01"}})
    sc = r.get("structuredContent") if isinstance(r, dict) else None
    if sc:
        t = sc.get("trip", {})
        trip_id = t.get("trip_id") or t.get("id")
        print(f"   Trip data: {json.dumps(t)[:300]}")
    if not trip_id:
        m = re.search(r'"trip_id"\s*:\s*"([^"]+)"', json.dumps(r))
        if m: trip_id = m.group(1)
    if trip_id:
        print(f"   ✅ trip_id={trip_id}"); P += 1
    else:
        print(f"   ❌ No trip_id: {txt(r) or r}"); F += 1

    if not trip_id:
        print("\n⛔ Aborting — no trip_id"); return 1

    # 2: Add 12 fragments
    frags = [
        ("flight","Ryanair BCN→FCO May 25 06:45, €47/person"),
        ("flight","Vueling BCN→FCO May 25 10:15, €62/person"),
        ("hotel","Hotel Lancelot near Termini, €95/night, family room"),
        ("hotel","Airbnb Trastevere apartment, €110/night, family-friendly"),
        ("restaurant","Da Enzo al 29 in Trastevere - must try cacio e pepe"),
        ("note","Vatican museums need booking 2 weeks ahead"),
        ("activity","Colosseum underground tour, €25/adult, kids under 6 free"),
        ("note","Kid needs stroller - are Rome streets OK?"),
        ("transport","Leonardo Express FCO→Termini, €14/person"),
        ("activity","Borghese Gallery - free for kids, book morning slot"),
        ("note","Budget target €1,500 total"),
        ("restaurant","La Casa della Crema gelato near Pantheon"),
    ]

    print(f"\n📥 2. Add {len(frags)} fragments")
    for i, (itype, ftext) in enumerate(frags):
        r = mcp("tools/call", {"name": "add_trip_item", "arguments": {
            "trip_id": trip_id, "raw_content": ftext, "item_type": itype}})
        t = txt(r)
        # extract item_id from structuredContent
        sc = r.get("structuredContent") if isinstance(r, dict) else None
        if sc:
            inbox = sc.get("inbox", [])
            for item in inbox:
                iid = item.get("item_id") or item.get("id")
                if iid and iid not in item_ids:
                    item_ids.append(iid); break
        if t:
            print(f"   [{i+1:2d}] ✅ {itype:12s} → {ftext[:55]}"); P += 1
        else:
            print(f"   [{i+1:2d}] ❌ {itype:12s} → {r}"); F += 1
    print(f"   Item IDs captured: {len(item_ids)}")

    # 3: List inbox
    print("\n📋 3. List inbox")
    r = mcp("tools/call", {"name": "list_trip_inbox", "arguments": {"trip_id": trip_id}})
    t = txt(r)
    if t:
        print(f"   Text: {t[:300]}")
        sc = r.get("structuredContent") if isinstance(r, dict) else None
        items = sc.get("items", []) if isinstance(sc, dict) else (sc if isinstance(sc, list) else [])
        print(f"   ✅ Inbox: {len(items)} items"); P += 1
    else:
        print(f"   ❌ {r}"); F += 1

    # 4: Shortlist items
    print("\n🔄 4. Shortlist items")
    # Get item IDs from inbox if we didn't capture them during add
    if not item_ids:
        r = mcp("tools/call", {"name": "list_trip_inbox", "arguments": {"trip_id": trip_id}})
        sc = r.get("structuredContent") if isinstance(r, dict) else None
        if sc:
            items = sc.get("items", [])
            for item in items:
                iid = item.get("item_id") or item.get("id")
                if iid: item_ids.append(iid)
            print(f"   (fetched {len(item_ids)} IDs from inbox)")
    test_ids = item_ids[:2] if len(item_ids) >= 2 else item_ids
    labels = ["Ryanair flight", "Hotel Lancelot"]
    if not test_ids:
        print("   ❌ No item IDs — skipping shortlist"); F += 2
    else:
        for idx, iid in enumerate(test_ids):
            r = mcp("tools/call", {"name": "update_trip_item_status", "arguments": {
                "trip_id": trip_id, "item_id": iid, "status": "shortlisted"}})
            t = txt(r)
            label = labels[idx] if idx < len(labels) else f"item-{idx}"
            if t:
                print(f"   ✅ {label}: {t[:120]}"); P += 1
            else:
                print(f"   ❌ {label}: {r}"); F += 1

    # 5: Get board
    print("\n📊 5. Get trip board")
    r = mcp("tools/call", {"name": "get_trip_board", "arguments": {"trip_id": trip_id}})
    t = txt(r)
    if t:
        print(f"   Text: {t[:300]}")
        sc = r.get("structuredContent") if isinstance(r, dict) else None
        if sc:
            print(f"   ✅ Board data: {json.dumps(sc)[:400]}")
        else:
            print(f"   ✅ Board returned")
        P += 1
    else:
        print(f"   ❌ {r}"); F += 1

    # 6: Get summary
    print("\n📝 6. Get trip summary")
    r = mcp("tools/call", {"name": "get_trip_summary", "arguments": {"trip_id": trip_id}})
    t = txt(r)
    if t:
        print(f"   {t[:400]}"); P += 1
    else:
        print(f"   ❌ {r}"); F += 1

    # 7: Widget resources
    print("\n🎨 7. UI widget resources")
    for uri in ["ui://trip/inbox-v1.html", "ui://trip/board-v1.html"]:
        r = mcp("resources/read", {"uri": uri})
        if ok(r):
            contents = r.get("contents", [])
            if contents:
                html = contents[0].get("text", "")
                has_post = "postMessage" in html
                print(f"   ✅ {uri}: {len(html)} chars, postMessage={has_post}")
            else:
                print(f"   ⚠️  {uri}: empty")
            P += 1
        else:
            print(f"   ❌ {uri}: {r}"); F += 1

    # 8: Tool listing
    print("\n🔧 8. All 11 tools present")
    r = mcp("tools/list")
    if ok(r):
        names = sorted(t["name"] for t in r.get("tools", []))
        expected = sorted([
            "create_trip", "add_trip_item", "list_trip_inbox",
            "update_trip_item_status", "get_trip_board", "get_trip_summary",
            "get_current_weather", "get_forecast", "get_destination_tips",
            "recommend_activities", "generate_packing_list"])
        missing = [t for t in expected if t not in names]
        print(f"   Tools ({len(names)}): {', '.join(names)}")
        if missing:
            print(f"   ⚠️  Missing: {missing}"); F += 1
        else:
            print(f"   ✅ All 11 present"); P += 1
    else:
        print(f"   ❌ {r}"); F += 1

    # Results
    print("\n" + "=" * 60)
    print(f"📊 {P} passed, {F} failed")
    if F == 0: print("🎉 All clear — ready for ChatGPT!")
    else: print("⚠️  Fix failures before real testing")
    print("=" * 60)
    return 0 if F == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
