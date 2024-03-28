import { OrderBook, OrderBookActionType, Pair, SocketType } from "../../types";
import { getUpdatedOrderBook, sendOrderBook } from "../../utils/order";

(function OrderWorker() {
  let socket: WebSocket | null;
  let isSubscribed: boolean = false;

  let orderBook: OrderBook = null;
  let pair: Pair;
  let timer: ReturnType<typeof setInterval>;

  onmessage = (event) => {
    const message = event.data;
    switch (message.action) {
      case "open": 
        openSocket(message.url)
        break;
      case "subscribe":
        if (isSubscribed) unsubscribe(pair);
        subscribe(message.pair);
        break;
      case "close":
        closeSocket();
        break;
    }
  };

  function openSocket(url: string) {
    socket = new WebSocket(url);

    socket.onopen = () => {
      postMessage({ type: SocketType.SOCKET_OPENED });
    };

    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data?.event) {
        switch (data.event) {
          case "subscribed":
            postMessage({ type: SocketType.SOCKET_SUBSCRIBED, pair: data.product_ids });
            isSubscribed = true;
            pair = data.product_ids[0];

            timer = setInterval(() => sendOrderBook(OrderBookActionType.UPDATE, orderBook), 200);
            break;
          case "unsubscribed":
            postMessage({ type: SocketType.SOCKET_UNSUBSCRIBED, pair: data.product_ids });
            isSubscribed = false;
            pair = null;
            break;
          case "error": 
            postMessage({ type: SocketType.SOCKET_ERROR, message: data.message });
            break;
          default:
            postMessage({ type: SocketType.SOCKET_UNKNOWN, message: data.message });
        }
      } else if (data?.bids) {
        orderBook = getUpdatedOrderBook(orderBook, data.asks, data.bids);
      }
    }

    socket.onclose = () => {
      if (timer) clearInterval(timer);
      postMessage({ type: SocketType.SOCKET_CLOSED });
      isSubscribed = false;
      pair = null;
    };
  }

  function subscribe(pair: Pair) {
    if (socket) {
      socket.send(JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [pair],
      }));
    }
  }

  function unsubscribe(pair: Pair) {
    if (timer) clearInterval(timer);
    if (socket) {
      socket.send(JSON.stringify({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [pair],
      }));
    }
  }

  function closeSocket() {
    if (timer) clearInterval(timer);
    if (socket) socket.close();
  }
})();

export default {};
