import { getVisitorGreeting } from "@/lib/visitor-greeting";

function getCountryHeader(request: Request) {
  // Keep the provider explicit. A direct request to the VPS must not be able
  // to choose a spoofable fallback header by sending both values.
  const provider = process.env.GEO_PROVIDER?.trim().toLowerCase();
  const header = provider === "vercel" ? "x-vercel-ip-country" : "cf-ipcountry";
  return request.headers.get(header);
}

export function GET(request: Request) {
  return Response.json(getVisitorGreeting(getCountryHeader(request)), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "CF-IPCountry, X-Vercel-IP-Country",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
