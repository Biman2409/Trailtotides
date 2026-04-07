import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "Plan your next adventure across India. Build a personalised itinerary, browse by season, and organise your trips all in one place.",
};

export default function PlannerPage() {
  return <PlannerClient />;
}
