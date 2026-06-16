import {
  getGiveawayGoalPurchases,
  getGiveawayPaidPurchaseCount,
} from "@/lib/db";
import { GiveawayPromoSection } from "@/components/landing/GiveawayPromoSection";

export const metadata = {
  title: "Sorteo | Buxxep",
  description: "Participa en el sorteo de Buxxep y gana la moto Vengala 250.",
};

export const dynamic = "force-dynamic";

export default async function SorteoPage() {
  const [paidPurchaseCount, goalPurchases] = await Promise.all([
    getGiveawayPaidPurchaseCount(),
    Promise.resolve(getGiveawayGoalPurchases()),
  ]);

  return (
    <div className="w-full">
      <GiveawayPromoSection
        paidPurchaseCount={paidPurchaseCount}
        goalPurchases={goalPurchases}
      />
    </div>
  );
}
