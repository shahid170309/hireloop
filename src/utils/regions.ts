import { JobRegionCode } from "../types/hireloop";

export interface RegionConfig {
  code: JobRegionCode;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  defaultLocation: string;
  defaultSalaryRange: string;
  salaryPlaceholder: string;
}

export const JOB_REGIONS: RegionConfig[] = [
  {
    code: "US",
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    defaultLocation: "San Francisco, CA",
    defaultSalaryRange: "$180k – $215k",
    salaryPlaceholder: "$180k – $220k",
  },
  {
    code: "IN",
    name: "India",
    currencyCode: "INR",
    currencySymbol: "₹",
    defaultLocation: "Bengaluru, India",
    defaultSalaryRange: "₹24L – ₹36L",
    salaryPlaceholder: "₹22L – ₹35L",
  },
  {
    code: "UK",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    defaultLocation: "London, UK",
    defaultSalaryRange: "£85k – £115k",
    salaryPlaceholder: "£80k – £110k",
  },
  {
    code: "EU",
    name: "European Union",
    currencyCode: "EUR",
    currencySymbol: "€",
    defaultLocation: "Berlin, Germany",
    defaultSalaryRange: "€80k – €110k",
    salaryPlaceholder: "€75k – €105k",
  },
  {
    code: "CA",
    name: "Canada",
    currencyCode: "CAD",
    currencySymbol: "C$",
    defaultLocation: "Toronto, ON",
    defaultSalaryRange: "C$140k – C$175k",
    salaryPlaceholder: "C$135k – C$170k",
  },
  {
    code: "AU",
    name: "Australia",
    currencyCode: "AUD",
    currencySymbol: "A$",
    defaultLocation: "Sydney, NSW",
    defaultSalaryRange: "A$150k – A$190k",
    salaryPlaceholder: "A$140k – A$180k",
  },
  {
    code: "SG",
    name: "Singapore",
    currencyCode: "SGD",
    currencySymbol: "S$",
    defaultLocation: "Singapore",
    defaultSalaryRange: "S$120k – S$160k",
    salaryPlaceholder: "S$110k – S$150k",
  },
  {
    code: "AE",
    name: "UAE",
    currencyCode: "AED",
    currencySymbol: "AED ",
    defaultLocation: "Dubai, UAE",
    defaultSalaryRange: "AED 25k – AED 35k/mo",
    salaryPlaceholder: "AED 22k – AED 32k/mo",
  },
  {
    code: "JP",
    name: "Japan",
    currencyCode: "JPY",
    currencySymbol: "¥",
    defaultLocation: "Tokyo, Japan",
    defaultSalaryRange: "¥10M – ¥14M",
    salaryPlaceholder: "¥9M – ¥13M",
  },
];

export function getRegionConfig(code?: JobRegionCode): RegionConfig {
  return JOB_REGIONS.find((r) => r.code === code) || JOB_REGIONS[0];
}

export function inferRegionFromLocation(
  location?: string,
  salaryRange?: string
): JobRegionCode {
  const sal = salaryRange || "";
  if (sal.includes("₹") || /\bINR\b/i.test(sal)) return "IN";
  if (sal.includes("£") || /\bGBP\b/i.test(sal)) return "UK";
  if (sal.includes("€") || /\bEUR\b/i.test(sal)) return "EU";
  if (sal.includes("C$") || /\bCAD\b/i.test(sal)) return "CA";
  if (sal.includes("A$") || /\bAUD\b/i.test(sal)) return "AU";
  if (sal.includes("S$") || /\bSGD\b/i.test(sal)) return "SG";
  if (/\bAED\b/i.test(sal)) return "AE";
  if (sal.includes("¥") || /\bJPY\b/i.test(sal)) return "JP";

  const loc = (location || "").toLowerCase();
  if (/india|bengaluru|bangalore|hyderabad|mumbai|pune|delhi|noida|gurgaon|chennai/.test(loc)) {
    return "IN";
  }
  if (/london|uk|united kingdom|manchester|edinburgh/.test(loc)) return "UK";
  if (/berlin|munich|paris|amsterdam|dublin|europe|germany|france|spain|netherlands/.test(loc)) {
    return "EU";
  }
  if (/toronto|vancouver|montreal|canada|ottawa/.test(loc)) return "CA";
  if (/sydney|melbourne|australia|brisbane/.test(loc)) return "AU";
  if (/singapore/.test(loc)) return "SG";
  if (/dubai|abu dhabi|uae/.test(loc)) return "AE";
  if (/tokyo|japan|osaka/.test(loc)) return "JP";
  return "US";
}

export function formatSalaryInRegionCurrency(
  rawSalary: string,
  regionCode: JobRegionCode
): string {
  const trimmed = rawSalary.trim();
  const region = getRegionConfig(regionCode);
  if (!trimmed) return region.defaultSalaryRange;

  // Strip known currency symbols/prefixes so we apply the active region currency cleanly
  const knownPrefixes = ["AED ", "C$", "A$", "S$", "$", "₹", "£", "€", "¥"];
  const hasAnyCurrency = knownPrefixes.some(
    (sym) => trimmed.includes(sym) || new RegExp(`\\b${region.currencyCode}\\b`, "i").test(trimmed)
  );

  if (!hasAnyCurrency) {
    // Prefix each range bound if separated by - or –
    const parts = trimmed.split(/\s*[–-]\s*/);
    if (parts.length === 2 && parts[0] && parts[1]) {
      return `${region.currencySymbol}${parts[0]} – ${region.currencySymbol}${parts[1]}`;
    }
    return `${region.currencySymbol}${trimmed}`;
  }

  return trimmed;
}
