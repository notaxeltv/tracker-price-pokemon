export interface CardTraderBlueprint {
  id: number;
  name: string;
  image_url?: string | null;
  game_id?: number;
  expansion_id?: number | null;
  tcg_player_id?: string | number | null;
  card_market_ids?: number[];
  category_id?: number;
}
