import { z } from "zod";

const nullableString = z.string().nullable();

export const tripSchema = z.object({
  id: z.string(),
  title: z.string(),
  destination: nullableString,
  start_date: nullableString,
  end_date: nullableString,
  created_at: z.string(),
  updated_at: z.string(),
});

export const tripItemSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  raw_content: z.string(),
  normalized_raw_content: z.string(),
  item_type: z.string(),
  status: z.string(),
  source_label: nullableString,
  title: nullableString,
  day_label: nullableString,
  date_note: nullableString,
  price_note: nullableString,
  location_note: nullableString,
  notes: nullableString,
  created_at: z.string(),
  updated_at: z.string(),
});

export const countsSchema = z.object({
  total: z.number(),
  by_status: z.record(z.string(), z.number()),
  by_type: z.record(z.string(), z.number()),
});

export const tripInboxPropsSchema = z.object({
  trip: tripSchema,
  items: z.array(tripItemSchema),
});

export const tripBoardPropsSchema = z.object({
  trip: tripSchema,
  lanes: z.object({
    open_decisions: z.array(tripItemSchema),
    shortlisted: z.array(tripItemSchema),
    booked: z.array(tripItemSchema),
    itinerary_draft: z.array(tripItemSchema),
    missing_pieces: z.array(z.string()),
  }),
  counts: countsSchema,
});

export const tripItineraryPropsSchema = z.object({
  trip: tripSchema,
  days: z.array(
    z.object({
      label: z.string(),
      items: z.array(tripItemSchema.extend({ schedule_label: z.string() })),
    })
  ),
  unscheduled: z.array(tripItemSchema),
  gaps: z.array(z.string()),
  counts: z.object({
    scheduled: z.number(),
    unscheduled: z.number(),
  }),
});

export const tripBudgetPropsSchema = z.object({
  trip: tripSchema,
  target: z.number().nullable(),
  spent: z.number(),
  remaining: z.number().nullable(),
  percent_used: z.number(),
  currency: z.string(),
  rows: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      item_type: z.string(),
      status: z.string(),
      amount: z.number(),
      currency: z.string(),
      note: z.string(),
    })
  ),
  category_totals: z.array(z.object({ category: z.string(), amount: z.number() })),
  counts: z.object({
    priced_items: z.number(),
    tracked_categories: z.number(),
    party_size: z.number(),
    nights: z.number(),
  }),
});

export type TripInboxProps = z.infer<typeof tripInboxPropsSchema>;
export type TripBoardProps = z.infer<typeof tripBoardPropsSchema>;
export type TripItineraryProps = z.infer<typeof tripItineraryPropsSchema>;
export type TripBudgetProps = z.infer<typeof tripBudgetPropsSchema>;
