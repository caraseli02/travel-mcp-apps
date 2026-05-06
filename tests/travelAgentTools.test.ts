import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTripStore } from "@/stores/tripStore";
import {
  addTripItem,
  createTrip,
  getTripBoard,
  getTripBudget,
  getTripItinerary,
  getTripSummary,
  renderTripBoard,
  resetTripStoreForTests,
  updateTripItemStatus,
} from "@/tools/travelAgent";

describe("travel agent tools", () => {
  let store: InMemoryTripStore;

  beforeEach(() => {
    store = new InMemoryTripStore();
    resetTripStoreForTests(store);
  });

  it("creates a trip and returns stable trip id", async () => {
    const result = await createTrip({ title: "Tokyo", destination: "Tokyo", start_date: null, end_date: null });
    expect(result.isError).not.toBe(true);
    const trip = result.structuredContent?.trip as { id: string; title: string };
    expect(trip.id).toBeTruthy();
    expect(trip.title).toBe("Tokyo");
    expect((await store.getTrip(trip.id)).destination).toBe("Tokyo");
  });

  it("adds trip items with inbox shape and duplicate flag", async () => {
    const trip = await store.createTrip("Barcelona");
    const first = await addTripItem({ trip_id: trip.id, raw_content: "Booking.com hotel near Gracia", source_label: "Booking", title: "Gracia hotel" });
    const second = await addTripItem({ trip_id: trip.id, raw_content: "booking.com hotel near gracia" });

    expect(first.isError).not.toBe(true);
    expect(first.structuredContent?.deduped).toBe(false);
    expect((first.structuredContent?.item as { item_type: string }).item_type).toBe("hotel");
    expect((first.structuredContent?.items as Array<{ status: string }>)[0].status).toBe("inbox");
    expect(second.structuredContent?.deduped).toBe(true);
  });

  it("keeps render board payload equivalent to data board", async () => {
    const trip = await store.createTrip("London");
    const added = await addTripItem({ trip_id: trip.id, raw_content: "Hotel near Soho" });
    const item = added.structuredContent?.item as { id: string };
    await updateTripItemStatus({ item_id: item.id, status: "booked", day_label: null, notes: null });

    const dataResult = await getTripBoard({ trip_id: trip.id });
    const renderResult = await renderTripBoard({ trip_id: trip.id });

    expect(dataResult.isError).not.toBe(true);
    expect(renderResult.isError).not.toBe(true);
    expect(renderResult.structuredContent).toEqual(dataResult.structuredContent);
    expect(renderResult.content[0]).toMatchObject({ type: "text", text: "Rendered trip board for London." });
  });

  it("groups itinerary items by day", async () => {
    const trip = await store.createTrip("Rome");
    const activity = (await addTripItem({ trip_id: trip.id, raw_content: "Colosseum tour", day_label: "Day 1 morning", title: "Colosseum Tour" })).structuredContent?.item as { id: string };
    const dinner = (await addTripItem({ trip_id: trip.id, raw_content: "Dinner in Trastevere", day_label: "Day 1 evening", title: "Dinner" })).structuredContent?.item as { id: string };
    await updateTripItemStatus({ item_id: activity.id, status: "shortlisted", day_label: null, notes: null });
    await updateTripItemStatus({ item_id: dinner.id, status: "shortlisted", day_label: null, notes: null });

    const result = await getTripItinerary({ trip_id: trip.id });
    const days = (result.structuredContent?.days ?? []) as Array<{ label: string; items: Array<{ id: string; schedule_label: string }> }>;

    expect(result.isError).not.toBe(true);
    expect(days[0].label).toBe("Day 1");
    expect(days[0].items[0].id).toBe(activity.id);
    expect(days[0].items[0].schedule_label).toBe("Morning");
    expect(days[0].items[1].id).toBe(dinner.id);
  });

  it("tracks budget items and summary missing pieces", async () => {
    const trip = await store.createTrip("Rome");
    const flight = (await addTripItem({ trip_id: trip.id, raw_content: "Ryanair BCN-FCO May 25, EUR 47/person" })).structuredContent?.item as { id: string };
    const hotel = (await addTripItem({ trip_id: trip.id, raw_content: "Hotel Lancelot near Termini, EUR 95/night" })).structuredContent?.item as { id: string };
    await addTripItem({ trip_id: trip.id, raw_content: "Budget target EUR 1500", item_type: "constraint" });
    await updateTripItemStatus({ item_id: flight.id, status: "shortlisted", day_label: null, notes: null });
    await updateTripItemStatus({ item_id: hotel.id, status: "shortlisted", day_label: null, notes: null });

    const budget = await getTripBudget({ trip_id: trip.id });
    const summary = await getTripSummary({ trip_id: trip.id });

    expect(budget.structuredContent?.target).toBe(1500);
    expect(budget.structuredContent?.spent).toBe(142);
    expect(summary.structuredContent?.missing_pieces).toContain("Transport is not booked yet.");
  });

  it("returns clear errors", async () => {
    const result = await createTrip({ title: "  ", destination: null, start_date: null, end_date: null });
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({ error: "trip title is required." });
  });
});
