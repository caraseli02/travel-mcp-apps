export interface Trip {
  id?: string;
  title?: string;
  destination?: string | null;
}

export interface TripInboxItem {
  item_type?: string;
  source_label?: string;
  title?: string;
  raw_content?: string;
  notes?: string;
}

export interface TripInboxData {
  trip?: Trip;
  items?: TripInboxItem[];
}

export interface TripBoardItem {
  id?: string;
  item_type?: string | null;
  status?: string;
  title?: string | null;
  raw_content?: string;
  notes?: string;
  day_label?: string;
  price_note?: string | null;
  date_note?: string | null;
  location_note?: string | null;
}

export interface TripBoardData {
  trip?: Trip;
  counts?: { total?: number };
  lanes?: Record<string, TripBoardItem[] | string[]>;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface BudgetRow {
  title: string;
  item_type?: string;
  status?: string;
  amount: number;
}

export interface TripBudgetData {
  trip?: Trip;
  currency?: string;
  spent?: number;
  target?: number;
  remaining?: number;
  percent_used?: number;
  category_totals?: CategoryTotal[];
  rows?: BudgetRow[];
}

export interface ItineraryItem {
  title?: string;
  schedule_label?: string;
  location_note?: string;
  notes?: string;
  price_note?: string;
}

export interface ItineraryDay {
  label?: string;
  items?: ItineraryItem[];
}

export interface TripItineraryData {
  trip?: Trip;
  counts?: { scheduled?: number };
  days?: ItineraryDay[];
  gaps?: string[];
}

export interface ClarificationOption {
  id: string;
  label: string;
  value: string;
}

export interface ClarificationQuestion {
  id: string;
  prompt: string;
  reason?: string;
  required: boolean;
  answer_type: "single_choice" | "multi_choice" | "free_text";
  options: ClarificationOption[];
  allow_free_text: boolean;
  allow_skip: boolean;
}

export interface TripClarificationData {
  session_id?: string;
  intent?: "plan_trip" | "book_hotel" | "book_flight";
  destination?: string | null;
  current_index?: number;
  total_questions?: number;
  known_fields?: Record<string, unknown>;
  questions?: ClarificationQuestion[];
  answers?: Record<string, unknown>;
}

export type TravelOptionCategory =
  | "lodging"
  | "food"
  | "activity"
  | "transit"
  | "neighborhood"
  | "flight";

export type TravelOptionStatus =
  | "inbox"
  | "shortlisted"
  | "recommended"
  | "selected"
  | "booked"
  | "open";

export interface TravelCoordinates {
  x: number;
  y: number;
  lat?: number;
  lon?: number;
}

export interface TravelOption {
  id: string;
  category: TravelOptionCategory;
  status: TravelOptionStatus;
  title: string;
  subtitle: string;
  description?: string;
  neighborhood?: string;
  schedule_label?: string;
  price?: number;
  currency?: string;
  price_note?: string;
  distance_note?: string;
  source?: string;
  score?: number;
  recommended?: boolean;
  image_url?: string;
  coordinates?: TravelCoordinates;
  pros?: string[];
  cons?: string[];
}

export interface TravelMediaItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  image_url: string;
  gradient: string;
}

export interface TravelOptionsData {
  trip?: Trip;
  options?: TravelOption[];
  media?: TravelMediaItem[];
  mapbox_access_token?: string;
}

export interface TravelCartItem {
  id: string;
  category: TravelOptionCategory;
  title: string;
  subtitle: string;
  image_url?: string;
  price: number;
  quantity: number;
  ready: boolean;
  warning?: string;
}

export interface TravelCartData {
  trip?: Trip;
  currency?: string;
  items?: TravelCartItem[];
  readiness?: string[];
  warnings?: string[];
}

export interface ErrorOutput {
  error?: string;
}
