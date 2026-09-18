// Deliberately a plain string-literal union rather than a single hardcoded
// value, so adding a second use case later only means adding a new value
// here and a new entry in BUSINESS_USE_CASES below — no other file needs
// to change its shape.
export type BusinessUseCaseValue = "polyclinic_pharmacy";

export type BusinessUseCase = {
  value: BusinessUseCaseValue;
  label: string;
  description: string;
};

export const BUSINESS_USE_CASES: BusinessUseCase[] = [
  {
    value: "polyclinic_pharmacy",
    label: "Polyclinic + Pharmacy",
    description:
      "Assess nearby healthcare facilities and pharmacy presence for a proposed polyclinic with pharmacy.",
  },
];

export const DEFAULT_BUSINESS_USE_CASE: BusinessUseCaseValue = "polyclinic_pharmacy";
