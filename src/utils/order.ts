import { DetailedOrder, DetailedOrderBook, Order, OrderBook, OrderBookAction, OrderType, OrderWithTotal } from "../types";

const getUpdatedOrders = (oldOrders: Order[], newOrders: Order[]): Order[] => {
  const orderPricesSet = new Set<number>();
  const updatedOrders: Order[] = [];

  for (const order of newOrders) {
    updatedOrders.push(order);
    orderPricesSet.add(order[0]);
  }

  for (const order of oldOrders) {
    if (!orderPricesSet.has(order[0])) {
      updatedOrders.push(order);
    }
  }

  return updatedOrders;
};

/**
 * Remove orders with size 0, limit to 25 orders, 
 * and sort orders by price in ascending order for asks and descending order for bids
 */
const cleanOrders = (orders: Order[], type: OrderType): Order[] => {
  return orders
    .filter(order => order[1] !== 0)
    .slice(0, 25)
    .sort((a, b) => {
      if (type === "ask") {
        return a[0] - b[0];
      } else {
        return b[0] - a[0];
      }
    });
};

const prepareDetailedOrders = (orders: Order[]): DetailedOrder[] => {
  let total: number = 0;
  const ordersWithTotal: OrderWithTotal[] = orders.map((order) => {
    total += order[1];
    return [...order, total];
  })

  return ordersWithTotal.map((order) => {
    return {
      price: order[0],
      size: order[1],
      total: order[2]
    };
  });
}

const prepareOrderBook = (orderBook: OrderBook): DetailedOrderBook | null => {
  if (!orderBook) return null;

  const asks: DetailedOrder[] = prepareDetailedOrders(cleanOrders(orderBook[0], "ask"));
  const bids: DetailedOrder[] = prepareDetailedOrders(cleanOrders(orderBook[1], "bid"));

  return { asks, bids };
};

export const getUpdatedOrderBook = (orderBook: OrderBook, asks: Order[], bids: Order[]): OrderBook => {
  if (!orderBook) {
    return [asks, bids] as OrderBook;
  }

  const updatedOrderBook: OrderBook = [
    getUpdatedOrders(orderBook[0], asks),
    getUpdatedOrders(orderBook[1], bids)
  ];

  return updatedOrderBook;
};

export const sendOrderBook = (action: OrderBookAction, orderBook: OrderBook) => {
  if (!orderBook) return;

  const detailedOrderBook: DetailedOrderBook | null = prepareOrderBook(orderBook);

  postMessage({ type: action, detailedOrderBook });
};