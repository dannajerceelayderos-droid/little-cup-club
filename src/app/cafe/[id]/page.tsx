import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CafeDetail } from "@/components/CafeDetail";
import { EmptyState } from "@/components/cafe-bits";
import { getSampleCafe } from "@/lib/cafes/sample";
import { getSanPabloCafe } from "@/lib/cafes/sanpablo";
import { osmCafeById } from "@/lib/cafes/osm";
import type { Cafe } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

async function load(id: string): Promise<{ cafe: Cafe | null; error?: boolean }> {
  if (id.startsWith("sample-")) return { cafe: getSampleCafe(id) ?? null };
  if (id.startsWith("sp-")) return { cafe: getSanPabloCafe(id) ?? null };
  if (id.startsWith("osm-")) {
    try {
      return { cafe: await osmCafeById(id) };
    } catch {
      return { cafe: null, error: true };
    }
  }
  return { cafe: null };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (id.startsWith("sample-")) {
    const c = getSampleCafe(id);
    return c ? { title: `${c.name} (sample)`, description: c.description } : {};
  }
  if (id.startsWith("sp-")) {
    const c = getSanPabloCafe(id);
    return c ? { title: `${c.name} · San Pablo City`, description: c.description ?? `${c.name}, a café in San Pablo City, Laguna.` } : {};
  }
  return { title: "Café" };
}

export default async function CafePage({ params }: Params) {
  const { id } = await params;
  const { cafe, error } = await load(decodeURIComponent(id));
  if (error)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          title="We couldn't reach the café data service"
          body="OpenStreetMap's servers are busy. Please try again in a moment."
          action={<Link href={`/cafe/${id}`} className="btn-primary text-sm">Try again</Link>}
        />
      </div>
    );
  if (!cafe) notFound();
  return <CafeDetail cafe={cafe} />;
}
