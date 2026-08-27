export const GREETING_KEYS = ["namaste", "hiya", "gday", "hey"] as const;

export type GreetingKey = (typeof GREETING_KEYS)[number];

export type VisitorGreeting = {
  key: GreetingKey;
  greeting: string;
  message: string;
};

const GREETING_TEXT: Record<GreetingKey, string> = {
  namaste: "Namaste",
  hiya: "Hiya",
  gday: "G’day",
  hey: "Hey",
};

const SOUTH_ASIA = new Set(["IN", "NP"]);
const UK_AND_IRELAND = new Set(["GB", "IE"]);
const AUSTRALIA = new Set(["AU"]);
const NORTH_AMERICA = new Set(["US", "CA"]);

function greeting(key: GreetingKey, message: string): VisitorGreeting {
  return { key, greeting: GREETING_TEXT[key], message };
}

function normalizeCountryCode(countryCode: string | null | undefined) {
  const normalized = countryCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function getVisitorGreeting(countryCode: string | null | undefined): VisitorGreeting {
  const country = normalizeCountryCode(countryCode);

  if (country && SOUTH_ASIA.has(country)) {
    return greeting(
      "namaste",
      "Your network hinted at India or Nepal—give or take a VPN. Namaste felt right.",
    );
  }

  if (country && UK_AND_IRELAND.has(country)) {
    return greeting(
      "hiya",
      "Your network hinted at the UK or Ireland—give or take a VPN. ‘Hiya’ won the coin toss.",
    );
  }

  if (country && AUSTRALIA.has(country)) {
    return greeting(
      "gday",
      "Your network hinted at Australia—give or take a VPN. I wasn’t wasting a perfectly good ‘G’day’.",
    );
  }

  if (country && NORTH_AMERICA.has(country)) {
    return greeting(
      "hey",
      "Your network hinted at North America—give or take a VPN. ‘Hey’ felt right.",
    );
  }

  return greeting(
    "hey",
    "Your network escaped my tiny greeting map, so ‘hey’ keeps the peace.",
  );
}

export function isVisitorGreeting(value: unknown): value is VisitorGreeting {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<VisitorGreeting>;
  return (
    typeof candidate.key === "string" &&
    GREETING_KEYS.includes(candidate.key as GreetingKey) &&
    candidate.greeting === GREETING_TEXT[candidate.key as GreetingKey] &&
    typeof candidate.message === "string" &&
    candidate.message.length > 0 &&
    candidate.message.length <= 240
  );
}
