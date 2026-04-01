type TeamAutofillInput = {
  name: string;
  slug: string;
  short_description?: string | null;
  confederation?: string | null;
  source?: string | null;
};

type TeamAutofillResult = {
  confederation?: string | null;
  short_description?: string | null;
  source?: string | null;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

const COUNTRY_NAME_MAP: Record<string, string> = {
  "mexiko": "Mexico",
  "sydafrika": "South Africa",
  "sydkorea": "South Korea",
  "tjeckien": "Czech Republic",
  "bosnien och hercegovina": "Bosnia and Herzegovina",
  "kanada": "Canada",
  "qatar": "Qatar",
  "schweiz": "Switzerland",
  "brasilien": "Brazil",
  "haiti": "Haiti",
  "sverige": "Sweden",
  "england": "England",
  "frankrike": "France",
  "spanien": "Spain",
  "tyskland": "Germany",
  "italien": "Italy",
  "nederländerna": "Netherlands",
  "portugal": "Portugal",
  "belgien": "Belgium",
  "kroatien": "Croatia",
  "serbien": "Serbia",
  "danmark": "Denmark",
  "norge": "Norway",
  "polen": "Poland",
  "ukraina": "Ukraine",
  "skottland": "Scotland",
  "turkiet": "Turkey",
  "japan": "Japan",
  "iran": "Iran",
  "saudiarabien": "Saudi Arabia",
  "australien": "Australia",
  "argentina": "Argentina",
  "uruguay": "Uruguay",
  "paraguay": "Paraguay",
  "ecuador": "Ecuador",
  "colombia": "Colombia",
  "chile": "Chile",
  "peru": "Peru",
  "bolivia": "Bolivia",
  "venezuela": "Venezuela",
  "marocko": "Morocco",
  "egypten": "Egypt",
  "nigeria": "Nigeria",
  "ghana": "Ghana",
  "kamerun": "Cameroon",
  "senegal": "Senegal",
  "algeriet": "Algeria",
  "tunisien": "Tunisia",
  "usa": "United States",
};

function toEnglishCountryName(teamName: string) {
  const normalized = normalizeName(teamName);
  return COUNTRY_NAME_MAP[normalized] ?? teamName;
}

function guessConfederation(teamName: string) {
  const name = normalizeName(teamName);

  const concacaf = new Set([
    "mexiko",
    "mexico",
    "usa",
    "united states",
    "kanada",
    "canada",
    "jamaica",
    "costa rica",
    "panama",
    "honduras",
    "el salvador",
    "guatemala",
    "qatar",
  ]);

  const conmebol = new Set([
    "brasilien",
    "brazil",
    "argentina",
    "uruguay",
    "paraguay",
    "ecuador",
    "colombia",
    "chile",
    "peru",
    "bolivia",
    "venezuela",
  ]);

  const uefa = new Set([
    "sverige",
    "sweden",
    "england",
    "frankrike",
    "france",
    "spanien",
    "spain",
    "tyskland",
    "germany",
    "italien",
    "italy",
    "nederländerna",
    "netherlands",
    "portugal",
    "belgien",
    "belgium",
    "schweiz",
    "switzerland",
    "tjeckien",
    "czech republic",
    "bosnien och hercegovina",
    "bosnia and herzegovina",
    "kroatien",
    "croatia",
    "serbien",
    "serbia",
    "danmark",
    "denmark",
    "norge",
    "norway",
    "polen",
    "poland",
    "ukraina",
    "ukraine",
    "skottland",
    "scotland",
    "wales",
    "turkiet",
    "turkey",
  ]);

  const caf = new Set([
    "sydafrika",
    "south africa",
    "marocko",
    "morocco",
    "egypten",
    "egypt",
    "nigeria",
    "ghana",
    "kamerun",
    "cameroon",
    "senegal",
    "algeriet",
    "algeria",
    "tunisien",
    "tunisia",
    "haiti",
  ]);

  const afc = new Set([
    "sydkorea",
    "south korea",
    "japan",
    "iran",
    "irak",
    "iraq",
    "saudiarabien",
    "saudi arabia",
    "australien",
    "australia",
    "uzbekistan",
    "förenade arabemiraten",
    "united arab emirates",
  ]);

  const ofc = new Set(["nya zeeland", "new zealand", "fiji", "solomon islands"]);

  if (concacaf.has(name)) return "CONCACAF";
  if (conmebol.has(name)) return "CONMEBOL";
  if (uefa.has(name)) return "UEFA";
  if (caf.has(name)) return "CAF";
  if (afc.has(name)) return "AFC";
  if (ofc.has(name)) return "OFC";

  return null;
}

async function getCountryDescription(teamName: string) {
  const englishName = toEnglishCountryName(teamName);

  const exactUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(
    englishName
  )}?fullText=true`;

  let res = await fetch(exactUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    const fallbackUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(
      englishName
    )}`;
    res = await fetch(fallbackUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
    });
  }

  if (!res.ok) return null;

  const data = await res.json();
  const country = Array.isArray(data) ? data[0] : null;
  if (!country) return null;

  const commonName = country?.name?.common ?? englishName;
  const officialName = country?.name?.official ?? null;
  const capital = Array.isArray(country?.capital) ? country.capital[0] : null;
  const region = country?.region ?? null;
  const subregion = country?.subregion ?? null;

  const parts = [
    `${teamName} är ett landslag från ${subregion || region || "sin region"}.`,
    capital ? `Landets huvudstad är ${capital}.` : null,
    officialName && officialName !== commonName
      ? `Officiellt landsnamn: ${officialName}.`
      : null,
  ].filter(Boolean);

  return parts.join(" ");
}

async function getSportsDbDescription(teamName: string) {
  const apiKey = process.env.THESPORTSDB_API_KEY;
  if (!apiKey) return null;

  const englishName = toEnglishCountryName(teamName);

  const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(
    englishName
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const team = Array.isArray(data?.teams) ? data.teams[0] : null;
  if (!team) return null;

  return (
    team.strDescriptionEN ||
    team.strDescriptionDE ||
    team.strDescriptionFR ||
    null
  );
}

function buildFallbackDescription(teamName: string, confederation: string | null) {
  if (!confederation) return `${teamName} är ett landslag som deltar i VM-kval och internationella turneringar.`;
  return `${teamName} är ett landslag som tillhör ${confederation} och deltar i internationella mästerskap och kvalspel.`;
}

export async function autofillTeamInfo(
  team: TeamAutofillInput
): Promise<TeamAutofillResult> {
  const confederation = team.confederation || guessConfederation(team.name);

  const [countryDescription, sportsDbDescription] = await Promise.all([
    getCountryDescription(team.name),
    getSportsDbDescription(team.name),
  ]);

  const short_description =
    team.short_description ||
    sportsDbDescription ||
    countryDescription ||
    buildFallbackDescription(team.name, confederation);

  const sourceParts = [
    "Autofyllt",
    countryDescription ? "RestCountries" : null,
    sportsDbDescription ? "TheSportsDB" : null,
    !countryDescription && !sportsDbDescription ? "lokal fallback" : null,
  ].filter(Boolean);

  return {
    confederation,
    short_description,
    source: sourceParts.join(" + "),
  };
}