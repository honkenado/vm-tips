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

  const ofc = new Set([
    "nya zeeland",
    "new zealand",
    "fiji",
    "solomon islands",
  ]);

  if (concacaf.has(name)) return "CONCACAF";
  if (conmebol.has(name)) return "CONMEBOL";
  if (uefa.has(name)) return "UEFA";
  if (caf.has(name)) return "CAF";
  if (afc.has(name)) return "AFC";
  if (ofc.has(name)) return "OFC";

  return null;
}

async function getCountryDescription(teamName: string) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
    teamName
  )}?fullText=true`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const country = Array.isArray(data) ? data[0] : null;
  if (!country) return null;

  const commonName = country?.name?.common ?? teamName;
  const officialName = country?.name?.official ?? null;
  const capital = Array.isArray(country?.capital) ? country.capital[0] : null;
  const region = country?.region ?? null;
  const subregion = country?.subregion ?? null;

  const parts = [
    `${commonName} är ett landslag från ${
      subregion || region || "sin region"
    }.`,
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

  const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(
    teamName
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

export async function autofillTeamInfo(
  team: TeamAutofillInput
): Promise<TeamAutofillResult> {
  const [countryDescription, sportsDbDescription] = await Promise.all([
    getCountryDescription(team.name),
    getSportsDbDescription(team.name),
  ]);

  const confederation = team.confederation || guessConfederation(team.name);

  const short_description =
    team.short_description ||
    sportsDbDescription ||
    countryDescription ||
    null;

  const sourceParts = [
    "Autofyllt",
    countryDescription ? "RestCountries" : null,
    sportsDbDescription ? "TheSportsDB" : null,
  ].filter(Boolean);

  return {
    confederation,
    short_description,
    source: sourceParts.join(" + "),
  };
}