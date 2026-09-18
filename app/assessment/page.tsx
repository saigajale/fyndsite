import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteLocationPicker from "@/components/assessment/SiteLocationPicker";

export const metadata: Metadata = {
  title: "Select a Site Location | FyndSite",
  description:
    "Search for an address or landmark, place it on the map and confirm the exact site you want FyndSite to assess.",
};

export default function AssessmentPage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-8xl px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-brand-border bg-brand-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-green-deep">
              Location & Business Assessment
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
              Choose the exact site you want to assess
            </h1>
            <p className="mt-4 text-lg text-brand-muted">
              Search for an address or landmark, then fine-tune the pin on
              the map until it sits on the exact site.
            </p>
          </div>

          <div className="mt-12">
            <SiteLocationPicker />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
