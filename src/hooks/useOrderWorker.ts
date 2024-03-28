import { useCallback, useEffect, useRef, useState } from "react";
import { DetailedOrder, OrderBookActionType, Pair, SocketType } from "../types";
import { SOCKET_URL } from "../config";

// eslint-disable-next-line
import Worker from "worker-loader!../worker/orderbook/orders.worker.ts";

interface UseOrderWorkerReturn {
  asks: DetailedOrder[];
  bids: DetailedOrder[];
  openSocket: Function;
  toggleSocket: Function;
  subscribeToPair: Function;
}

export const useOrderWorker = (pair: Pair): UseOrderWorkerReturn => {
  let worker = useRef<Worker | null>(null);
  const [asks, setAsks] = useState<DetailedOrder[]>([]);
  const [bids, setBids] = useState<DetailedOrder[]>([]);

  const openSocket = useCallback(() => {
    if (!worker.current) {
      worker.current = new Worker();

      worker.current.postMessage({ action: "open", url: SOCKET_URL });
      worker.current.addEventListener("message", handleMessageFromWorker);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
  }, []);

  const closeSocket = useCallback(() => {
    if (worker.current) {
      worker.current?.postMessage({ action: "close" });
      worker.current?.removeEventListener("message", handleMessageFromWorker);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      worker.current = null;
    }
  }, []);

  const toggleSocket = useCallback(() => {
    if (worker.current) {
      closeSocket();
    } else {
      openSocket();
    }
  }, []);

  const subscribeToPair = useCallback((pair: Pair) => {
    if (worker.current) {
      worker.current.postMessage({ action: "subscribe", pair });
    }
  }, []);

  const handleMessageFromWorker = (event: MessageEvent) => {
    switch (event.data.type) {
      case SocketType.SOCKET_OPENED:
        subscribeToPair(pair);
        break;
      case OrderBookActionType.UPDATE: 
        setAsks(event.data.detailedOrderBook?.asks);
        setBids(event.data.detailedOrderBook?.bids);
        break;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      closeSocket();
    } else {
      openSocket();
      subscribeToPair(pair);
    }
  };

  useEffect(() => {
    openSocket();

    return () => closeSocket();
  }, []);

  return { asks, bids, openSocket, toggleSocket, subscribeToPair };
};
