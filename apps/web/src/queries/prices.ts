import { db } from "@/db";
import { prices } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";
import Stripe from "stripe";

const PRICES_KEYS = ["prices"];

export function usePricesQuery() {
  return useQuery({
    queryKey: PRICES_KEYS,
    queryFn: async () => {
      const data = await db.select().from(prices);

      type DataItemType = (typeof data)[0] & { price: Stripe.Price };

      return data as DataItemType[];
    },
  });
}
