import { NextResponse } from "next/server";

const GITHUB_USERNAME = "royengg";
const CACHE_SECONDS = 15 * 60;

type ContributionDay = {
  date: string;
  count: number;
  weekday: number;
};

type ContributionPayload = {
  total: number;
  days: ContributionDay[];
  source: "github-calendar" | "github-graphql";
  updatedAt: string;
};

type GraphQLPayload = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
              weekday: number;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

function sortDays(days: ContributionDay[]) {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

function createPayload(
  days: ContributionDay[],
  total: number,
  source: ContributionPayload["source"],
): ContributionPayload {
  const sortedDays = sortDays(days);
  if (sortedDays.length < 300) {
    throw new Error("GitHub returned an incomplete contribution calendar");
  }

  return {
    total,
    days: sortedDays,
    source,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchWithToken(token: string): Promise<ContributionPayload> {
  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      query: `
        query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        login: GITHUB_USERNAME,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed (${response.status})`);
  }

  const payload = (await response.json()) as GraphQLPayload;
  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (payload.errors?.length || !calendar) {
    throw new Error(payload.errors?.[0]?.message || "GitHub returned no contribution calendar");
  }

  return createPayload(
    calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        weekday: day.weekday,
      })),
    ),
    calendar.totalContributions,
    "github-graphql",
  );
}

async function fetchPublicCalendar(): Promise<ContributionPayload> {
  const response = await fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
    headers: {
      Accept: "text/html",
      "User-Agent": "roy-portfolio-contribution-graph",
    },
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GitHub contribution calendar failed (${response.status})`);
  }

  const html = await response.text();
  const dayPattern = /<td\b(?=[^>]*\bdata-date="([^"]+)")(?=[^>]*\bdata-level="(\d+)")[^>]*><\/td>\s*<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/g;
  const days: ContributionDay[] = [];
  let match: RegExpExecArray | null;

  while ((match = dayPattern.exec(html)) !== null) {
    const countMatch = match[3].match(/([\d,]+)\s+contribution/i);
    days.push({
      date: match[1],
      count: countMatch ? Number(countMatch[1].replaceAll(",", "")) : 0,
      weekday: new Date(`${match[1]}T00:00:00Z`).getUTCDay(),
    });
  }

  return createPayload(
    days,
    days.reduce((total, day) => total + day.count, 0),
    "github-calendar",
  );
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN?.trim();
    const payload = token
      ? await fetchWithToken(token).catch(() => fetchPublicCalendar())
      : await fetchPublicCalendar();

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
