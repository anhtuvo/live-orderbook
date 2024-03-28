import { useState } from "react";
import { useOrderWorker } from "../../hooks/useOrderWorker";
import { Pair } from "../../types";
import { OrderBookTable } from "../OrderBookTable/OrderBookTable";
import styles from "./OrderBook.module.css";

export const OrderBook = () => {
  const [pair, setPair] = useState<Pair>("PI_XBTUSD");
  const { asks, bids, subscribeToPair, toggleSocket } = useOrderWorker(pair);

  const haveAsks: boolean = Boolean(asks.length > 0);
  const haveBids: boolean = Boolean(bids.length > 0);
  const totalAsks: number = haveAsks ? asks[asks.length - 1].total : 0;
  const totalBids: number = haveBids ? bids[bids.length - 1].total : 0;

  const togglePair = () => {
    let newPair: Pair = pair === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD";
    subscribeToPair(newPair);
    setPair(newPair);
  };

  return (
    <div className={styles.orderbook}>
      <div className={styles.header}>
        <div className={styles.title}>
          Order Book
          <span className={styles.pair}> ({pair})</span>
        </div>
      </div>
      <OrderBookTable orderType="bid" orders={bids} total={totalBids} />
      <OrderBookTable orderType="ask" orders={asks} total={totalAsks} />
      <div className={styles.footer}>
        <button className={`${styles.footerBtn} ${styles.toggleBtn}`} onClick={togglePair}>
          Toggle Feed
        </button>
        <button className={`${styles.footerBtn} ${styles.closeBtn}`} onClick={() => toggleSocket()}>
          Kill Feed
        </button>
      </div>
    </div>
  );
};
