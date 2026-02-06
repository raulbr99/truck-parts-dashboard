export interface TruckPart {
  part_num: string;
  ukey: string | null;
  description: string | null;
  price: number | null;
  stocked: boolean | null;
  make: string | null;
  model: string | null;
  category_id: string | null;
  category_name: string | null;
  uom: string | null;
  qty_available: number | null;
  raw_json: Record<string, unknown> | null;
  data_hash: string | null;
  last_seen: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      truck_parts: {
        Row: TruckPart;
        Insert: Omit<TruckPart, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<TruckPart>;
      };
      price_history: {
        Row: {
          id: number;
          part_num: string;
          old_price: number | null;
          new_price: number | null;
          changed_at: string | null;
        };
        Insert: Omit<{ id: number; part_num: string; old_price: number | null; new_price: number | null; changed_at: string | null }, "id"> & { id?: number };
        Update: Partial<{ id: number; part_num: string; old_price: number | null; new_price: number | null; changed_at: string | null }>;
      };
    };
  };
}
