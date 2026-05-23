import { getDb } from "@/lib/d1";
import CalculatorClient from "./CalculatorClient";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const db = getDb();
  
  const { results } = await db.prepare(
    "SELECT chart_id, title, difficulty, const_value FROM charts ORDER BY title ASC, const_value ASC"
  ).all<{
    chart_id: string;
    title: string;
    difficulty: string;
    const_value: number;
  }>();

  return <CalculatorClient charts={results} />;
}
