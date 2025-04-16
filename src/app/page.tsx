import { Suspense } from "react";
import ExpenseTracker from "@/components/ExpenseTracker";
import { LoadingCard } from "@/components/LoadingCard";

export default function Home() {
  return (
    <Suspense fallback={<LoadingCard message="Loading..." />}>
      <ExpenseTracker />
    </Suspense>
  );
}
