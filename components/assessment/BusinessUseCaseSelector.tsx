"use client";

import { BUSINESS_USE_CASES } from "@/lib/assessment/types";
import type { BusinessUseCaseValue } from "@/lib/assessment/types";

type BusinessUseCaseSelectorProps = {
  value: BusinessUseCaseValue;
  onChange: (value: BusinessUseCaseValue) => void;
};

export default function BusinessUseCaseSelector({
  value,
  onChange,
}: BusinessUseCaseSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-brand-text">
        What are you planning to open at this site?
      </legend>
      <div role="radiogroup" aria-label="Business or use case" className="space-y-3">
        {BUSINESS_USE_CASES.map((useCase) => {
          const isSelected = value === useCase.value;
          return (
            <label
              key={useCase.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                isSelected
                  ? "border-brand-green bg-brand-green/5"
                  : "border-brand-border bg-brand-bg hover:border-brand-green"
              }`}
            >
              <input
                type="radio"
                name="business-use-case"
                value={useCase.value}
                checked={isSelected}
                onChange={() => onChange(useCase.value)}
                className="mt-1 h-4 w-4 accent-brand-green"
              />
              <span>
                <span className="block text-sm font-semibold text-brand-text">
                  {useCase.label}
                </span>
                <span className="mt-0.5 block text-xs text-brand-muted">
                  {useCase.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
