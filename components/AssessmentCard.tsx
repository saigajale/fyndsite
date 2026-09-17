"use client";

import { useState } from "react";
import { MapPinIcon } from "./icons";

const BUSINESS_TYPES = [
  "Grocery Store",
  "Pharmacy",
  "Restaurant",
  "Café",
  "Clothing Store",
  "Salon",
  "Electronics Store",
  "Other Business",
];

export default function AssessmentCard() {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(
    null,
  );
  const [location, setLocation] = useState("Vasai West, Maharashtra");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="assessment" className="mx-auto max-w-8xl px-6 lg:px-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-card sm:p-10"
      >
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-brand-text sm:text-3xl">
            What are you planning to open?
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Select a business type and confirm the location you want to
            assess.
          </p>
        </div>

        <fieldset>
          <legend className="sr-only">Business type</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BUSINESS_TYPES.map((business) => {
              const isSelected = selectedBusiness === business;
              return (
                <button
                  key={business}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedBusiness(business)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-brand-green bg-brand-green/10 text-brand-green-deep"
                      : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-green"
                  }`}
                >
                  {business}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8">
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-semibold text-brand-text"
          >
            Location
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-bg px-4 py-3">
            <MapPinIcon className="h-5 w-5 flex-shrink-0 text-brand-green" />
            <input
              id="location"
              name="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full bg-transparent text-sm font-medium text-brand-text outline-none"
              placeholder="Enter a location"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-full bg-brand-green px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-green-deep sm:w-auto"
        >
          Check Location Suitability
        </button>

        {submitted && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-brand-orange/10 px-4 py-3 text-sm font-medium text-brand-green-deep"
          >
            Thanks! The assessment workflow will be connected next — this is
            a preview of the Fyndsol experience, coming soon.
          </p>
        )}
      </form>
    </section>
  );
}
