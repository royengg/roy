import { NextResponse } from "next/server";

const GITHUB_USERNAME = "royengg";
const CONTRIBUTIONS_API_URL = "https://github-contributions-api.jogruber.de/v4";
const CACHE_SECONDS = 15 * 60;
const UPSTREAM_TIMEOUT_MS = 8_000;

type ContributionDay = {
  date: string;
  count: number;
  weekday: number;
};

type ContributionPayload = {
  total: number;
  days: ContributionDay[];
  source: "github-contributions-api";
  updatedAt: string;
};

type ContributionsApiPayload = {
  total?: Record<string, unknown>;
  contributions?: unknown;
};

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseContributionDay(value: unknown): ContributionDay {
  if (!value || typeof value !== "object") {
    throw new Error("Contribution API returned an invalid calendar day");
  }

  const day = value as { date?: unknown; count?: unknown };
  if (
    !isCalendarDate(day.date) ||
    typeof day.count !== "number" ||
    !Number.isInteger(day.count) ||
    day.count < 0
  ) {
    throw new Error("Contribution API returned an invalid calendar day");
  }

  return {
    date: day.date,
    count: day.count,
    weekday: new Date(`${day.date}T00:00:00Z`).getUTCDay(),
  };
}

function getUpstreamUpdatedAt(response: Response) {
  const age = Number(response.headers.get("age"));
  const ageInMilliseconds = Number.isFinite(age) && age >= 0 ? age * 1_000 : 0;
  return new Date(Date.now() - ageInMilliseconds).toISOString();
}

function createPayload(
  apiPayload: ContributionsApiPayload,
  response: Response,
): ContributionPayload {
  if (!Array.isArray(apiPayload.contributions)) {
    throw new Error("Contribution API returned no calendar");
  }

  const days = apiPayload.contributions.map(parseContributionDay).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const total = apiPayload.total?.lastYear;

  if (days.length < 300 || new Set(days.map((day) => day.date)).size !== days.length) {
    throw new Error("Contribution API returned an incomplete calendar");
  }

  if (typeof total !== "number" || !Number.isInteger(total) || total < 0) {
    throw new Error("Contribution API returned an invalid total");
  }

  return {
    total,
    days,
    source: "github-contributions-api",
    updatedAt: getUpstreamUpdatedAt(response),
  };
}

async function fetchContributionCalendar(): Promise<ContributionPayload> {
  const response = await fetch(
    `${CONTRIBUTIONS_API_URL}/${GITHUB_USERNAME}?y=last`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "roy-portfolio-contribution-graph",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`Contribution API request failed (${response.status})`);
  }

  const apiPayload = (await response.json()) as ContributionsApiPayload;
  return createPayload(apiPayload, response);
}

export async function GET() {
  try {
    const payload = await fetchContributionCalendar();

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("Unable to load GitHub contributions", error);
    return NextResponse.json(
      { error: "Unable to load GitHub contributions right now" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
