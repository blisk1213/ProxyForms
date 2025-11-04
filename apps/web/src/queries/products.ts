import { db } from "@/db";
import { products } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";
import Stripe from "stripe";

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await db.select().from(products);

      type DataItemType = (typeof data)[0] & { product: Stripe.Product };

      return data as DataItemType[];
    },
  });
}
