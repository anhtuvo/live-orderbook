export type Price = number;
export type Size = number;
export type Total = number;

export type Order = [Price, Size];
export type OrderBook = [Order[], Order[]] | null;

export type OrderWithTotal = [Price, Size, Total];

export interface DetailedOrder {
  price: Price;
  size: Size;
  total: Total;
};

export interface DetailedOrderBook {
  asks: DetailedOrder[];
  bids: DetailedOrder[];
};

export type OrderBookAction = "initial" | "update" | "clear";
export enum OrderBookActionType {
  INITIAL = "initial",
  UPDATE = "update",
  CLEAR = "clear",
};

export type OrderType = "ask" | "bid";
export type Pair = "PI_XBTUSD" | "PI_ETHUSD" | null;