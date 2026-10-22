import Link from "next/link";
import { EmptyState } from "@/components/cafe-bits";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <EmptyState
        title="This page wandered off"
        body="We couldn't find what you were looking for. Maybe it's hiding behind a fern."
        action={<Link href="/explore" className="btn-primary text-sm">Explore cafés</Link>}
      />
    </div>
  );
}
