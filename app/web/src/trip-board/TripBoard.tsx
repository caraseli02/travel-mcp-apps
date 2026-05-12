import React from "react";

type TripItem = {
  id: string;
  title?: string | null;
  raw_content?: string;
  item_type?: string | null;
  status?: string;
  price_note?: string | null;
  date_note?: string | null;
  location_note?: string | null;
};

type TripBoardData = {
  trip?: { title?: string; destination?: string | null };
  lanes?: Record<string, TripItem[] | string[]>;
};

const laneLabels: Record<string, string> = {
  inbox: "Inbox",
  shortlisted: "Shortlist",
  booked: "Booked",
  itinerary_draft: "Itinerary draft",
  missing_pieces: "Missing pieces",
};

const itemTitle = (item: TripItem | string): string => {
  if (typeof item === "string") return item;
  return item.title || item.raw_content || "Saved option";
};

const itemMeta = (item: TripItem | string): string[] => {
  if (typeof item === "string") return [];
  return [item.item_type, item.price_note, item.date_note, item.location_note].filter(
    Boolean
  ) as string[];
};

export function TripBoard({ board }: { board: TripBoardData }) {
  const lanes = board.lanes ?? {};
  const laneEntries = Object.entries(lanes).filter(([, items]) => items.length > 0);

  return (
    <section className="travel-trip-board" aria-label="Trip board">
      <header>
        <p>{board.trip?.destination || "Trip workspace"}</p>
        <h1>{board.trip?.title || "Trip board"}</h1>
      </header>

      <div className="travel-trip-board__lanes">
        {laneEntries.map(([lane, items]) => (
          <section className="travel-trip-board__lane" key={lane}>
            <h2>{laneLabels[lane] ?? lane.replaceAll("_", " ")}</h2>
            <ul>
              {items.slice(0, 6).map((item, index) => (
                <li key={typeof item === "string" ? `${lane}-${index}` : item.id}>
                  <strong>{itemTitle(item)}</strong>
                  {itemMeta(item).length > 0 ? (
                    <span>{itemMeta(item).join(" · ")}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

