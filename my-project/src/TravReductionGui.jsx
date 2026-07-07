import { useEffect, useMemo, useState } from "react";

const LOCAL_API_BASE_URL = "http://localhost:63093";
const PRODUCTION_API_BASE_URL =
  "https://travanalys-reducering-backend-latest.onrender.com";
const API_BASE_URL =
  import.meta.env.VITE_REDUCTION_API_BASE_URL ||
  import.meta.env.VITE_TRAV_API_BASE_URL ||
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL);
const SUPPORTED_SPELFORMER = ["V3", "V4", "V5", "V64", "V65", "GS75", "V85", "V86"];

const BET_LEGS = {
  V3: 3,
  V4: 4,
  V5: 5,
  V64: 6,
  V65: 6,
  GS75: 7,
  V85: 8,
  V86: 8,
};

const FALLBACK_OPTIONS = {
  spelformer: SUPPORTED_SPELFORMER,
  banor: ["S", "Å", "J", "Ax", "B", "Bo", "Bs", "D", "E", "F", "G", "H", "Hd", "Kr", "L", "Mp", "Ro", "Rä", "Sk", "Sä", "U", "Vi", "Åm", "År", "Ö", "Ös", "Ho", "Vg", "Ti"],
  trackCodes: [
    { code: "05", name: "S" },
    { code: "06", name: "Å" },
    { code: "07", name: "J" },
    { code: "08", name: "Ax" },
    { code: "09", name: "B" },
    { code: "11", name: "Bo" },
    { code: "12", name: "Bs" },
    { code: "13", name: "D" },
    { code: "14", name: "E" },
    { code: "15", name: "F" },
    { code: "16", name: "G" },
    { code: "17", name: "H" },
    { code: "18", name: "Hd" },
    { code: "19", name: "Kr" },
    { code: "21", name: "L" },
    { code: "22", name: "Mp" },
    { code: "23", name: "Ro" },
    { code: "24", name: "Rä" },
    { code: "25", name: "Sk" },
    { code: "26", name: "Sä" },
    { code: "27", name: "U" },
    { code: "28", name: "Vi" },
    { code: "29", name: "Åm" },
    { code: "31", name: "År" },
    { code: "32", name: "Ö" },
    { code: "33", name: "Ös" },
    { code: "37", name: "Ho" },
    { code: "43", name: "Vg" },
    { code: "46", name: "Ti" },
  ],
  defaultFilter: {
    minRank: 0,
    maxRank: 13,
    minTotalStreck: 0,
    maxTotalStreck: 999,
    minStreck: 0,
    maxAverageStreck: 90,
    requireAtLeastTwoFirstRanked: false,
    excludedTextRows: [],
  },
};

const initialSelections = Array.from({ length: 8 }, () => "");

const initialForm = {
  spelform: "GS75",
  startDatum: "",
  banKod: "S",
  trackCode: "05",
  lopp: "1",
  radpris: "1",
  avdelningar: initialSelections,
  filter: FALLBACK_OPTIONS.defaultFilter,
  excludedTextRowsText: "",
};

function parseHorseList(value) {
  return value
    .split(/[\s,;]+/)
    .map((part) => Number.parseInt(part, 10))
    .filter((number) => Number.isInteger(number) && number > 0);
}

function parseTextRows(value) {
  return value
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
} 

function formatDecimal(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "";
  }

  return Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

async function readApiError(response) {
  const text = await response.text();
  if (!text) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.error || parsed.detail || parsed.title || text;
  } catch {
    return text;
  }
}

function buildApiUrl(apiBaseUrl, path) {
  const baseUrl = apiBaseUrl.trim().replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
export default function TravReductionGui() {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [xmlStats, setXmlStats] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const legCount = BET_LEGS[form.spelform] || 0;
  const activeSelections = useMemo(
    () => form.avdelningar.slice(0, legCount),
    [form.avdelningar, legCount],
  );

  useEffect(() => {
    let ignore = false;

    fetch(buildApiUrl(API_BASE_URL, "/api/reducering/options"))
      .then((response) => (response.ok ? response.json() : FALLBACK_OPTIONS))
      .then((data) => {
        if (!ignore) {
          setOptions({
            ...FALLBACK_OPTIONS,
            ...data,
            spelformer: SUPPORTED_SPELFORMER,
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setOptions(FALLBACK_OPTIONS);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateFilter(field, value) {
    setForm((current) => ({
      ...current,
      filter: { ...current.filter, [field]: value },
    }));
  }

  function updateSelection(index, value) {
    setForm((current) => {
      const nextSelections = [...current.avdelningar];
      nextSelections[index] = value;
      return { ...current, avdelningar: nextSelections };
    });
  }

  function handleTrackChange(value) {
    const selectedTrack = options.trackCodes.find((track) => track.code === value);
    setForm((current) => ({
      ...current,
      trackCode: value,
      banKod: selectedTrack?.name || current.banKod,
    }));
  }

  function buildRequest() {
    const avdelningar = activeSelections.map(parseHorseList);

    return {
      spelform: form.spelform,
      startDatum: form.startDatum.trim(),
      banKod: form.banKod.trim(),
      trackCode: form.trackCode.trim(),
      lopp: toNumber(form.lopp, 1),
      radpris: toNumber(form.radpris, 1),
      avdelningar,
      filter: {
        minRank: toNumber(form.filter.minRank, 0),
        maxRank: toNumber(form.filter.maxRank, 999),
        minTotalStreck: toNumber(form.filter.minTotalStreck, 0),
        maxTotalStreck: toNumber(form.filter.maxTotalStreck, 999),
        minStreck: toNumber(form.filter.minStreck, 0),
        maxAverageStreck: toNumber(form.filter.maxAverageStreck, 999),
        requireAtLeastTwoFirstRanked: Boolean(form.filter.requireAtLeastTwoFirstRanked),
        excludedTextRows: parseTextRows(form.excludedTextRowsText),
      },
    };
  }

  async function previewRows() {
    setStatus({ type: "loading", message: "Preview körs" });
    setPreview(null);
    setXmlStats(null);

    const response = await fetch(buildApiUrl(API_BASE_URL, "/api/reducering/preview"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequest()),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const result = await response.json();
    setPreview(result);
    setStatus({ type: "success", message: "Preview redo" });
  }

  async function copyXmlUrl() {
    setStatus({ type: "loading", message: "Skapar XML länk" });
    setXmlStats(null);

    const response = await fetch(buildApiUrl(API_BASE_URL, "/api/reducering/xml/temp"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequest()),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const result = await response.json();
    await copyTextToClipboard(result.url);

    setXmlStats({
      generatedRows: result.generatedRows,
      couponCount: result.couponCount,
      missingStreckHits: result.missingStreckHits,
      filename: result.fileName,
      url: result.url,
      expiresAt: result.expiresAt,
    });
    setStatus({ type: "success", message: "XML länk kopierad" });
  }

  async function runAction(action) {
    try {
      await action();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Request failed" });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">Trav Reducering</h1>
            <p className="mt-1 text-sm text-zinc-600">{form.spelform} / {form.banKod || "Bana"} / {form.startDatum || "Datum"}</p>
          </div>
        </header>

        <main className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Spelform
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  value={form.spelform}
                  onChange={(event) => updateField("spelform", event.target.value)}
                >
                  {options.spelformer.map((spelform) => (
                    <option key={spelform} value={spelform}>{spelform}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Datum
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="yyyyMMdd"
                  value={form.startDatum}
                  onChange={(event) => updateField("startDatum", event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                ATG kod
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  value={form.trackCode}
                  onChange={(event) => handleTrackChange(event.target.value)}
                >
                  {options.trackCodes.map((track) => (
                    <option key={track.code} value={track.code}>{track.code} - {track.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Bankod
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  list="trav-banor"
                  value={form.banKod}
                  onChange={(event) => updateField("banKod", event.target.value)}
                />
                <datalist id="trav-banor">
                  {options.banor.map((bana) => (
                    <option key={bana} value={bana} />
                  ))}
                </datalist>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Lopp
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  inputMode="numeric"
                  value={form.lopp}
                  onChange={(event) => updateField("lopp", event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Radpris
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  inputMode="decimal"
                  value={form.radpris}
                  onChange={(event) => updateField("radpris", event.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Rankade val</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {activeSelections.map((value, index) => (
                  <label key={index} className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                    {`Avd ${index + 1}`}
                    <input
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      placeholder="1, 4, 7"
                      value={value}
                      onChange={(event) => updateSelection(index, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Reduceringsvillkor</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <NumberField label="Min rank" value={form.filter.minRank} onChange={(value) => updateFilter("minRank", value)} />
                <NumberField label="Max rank" value={form.filter.maxRank} onChange={(value) => updateFilter("maxRank", value)} />
                <NumberField label="Min streck" value={form.filter.minStreck} onChange={(value) => updateFilter("minStreck", value)} />
                <NumberField label="Min total" value={form.filter.minTotalStreck} onChange={(value) => updateFilter("minTotalStreck", value)} />
                <NumberField label="Max total" value={form.filter.maxTotalStreck} onChange={(value) => updateFilter("maxTotalStreck", value)} />
                <NumberField label="Max avg" value={form.filter.maxAverageStreck} onChange={(value) => updateFilter("maxAverageStreck", value)} />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                  Exkludera textrad
                  <textarea
                    className="min-h-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    value={form.excludedTextRowsText}
                    onChange={(event) => updateField("excludedTextRowsText", event.target.value)}
                  />
                </label>

                <label className="flex h-10 items-center gap-2 self-end rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    checked={form.filter.requireAtLeastTwoFirstRanked}
                    onChange={(event) => updateFilter("requireAtLeastTwoFirstRanked", event.target.checked)}
                  />
                  Två förstarankade
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className={[
                "min-h-10 rounded-md px-3 py-2 text-sm",
                status.type === "error" ? "bg-red-50 text-red-800" : "bg-zinc-100 text-zinc-700",
                status.type === "success" ? "bg-emerald-50 text-emerald-800" : "",
                status.type === "loading" ? "bg-sky-50 text-sky-800" : "",
              ].join(" ")}
              >
                {status.message || "Redo"}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                  disabled={status.type === "loading"}
                  onClick={() => runAction(previewRows)}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  disabled={status.type === "loading"}
                  onClick={() => runAction(copyXmlUrl)}
                >
                  Copy XML URL
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Genererade" value={preview?.generatedRows ?? xmlStats?.generatedRows ?? "-"} />
              <Metric label="Efter filter" value={preview?.filteredRows ?? xmlStats?.couponCount ?? "-"} />
              <Metric label="Saknar streck" value={preview?.missingStreckHits ?? xmlStats?.missingStreckHits ?? "-"} />
            </div>

            {xmlStats?.url && (
              <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <div className="font-medium">{xmlStats.filename}</div>
                <a
                  className="mt-1 block break-all underline decoration-emerald-700/40 underline-offset-2"
                  href={xmlStats.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {xmlStats.url}
                </a>
                {xmlStats.expiresAt && (
                  <div className="mt-1 text-xs text-emerald-700">
                    Giltig till {new Date(xmlStats.expiresAt).toLocaleString("sv-SE")}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 overflow-auto rounded-md border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Textrad</th>
                    <th className="px-3 py-2">Hästar</th>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2 text-right">Sum rank</th>
                    <th className="px-3 py-2 text-right">Sum streck</th>
                    <th className="px-3 py-2 text-right">Min</th>
                    <th className="px-3 py-2 text-right">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {(preview?.rows || []).map((row, index) => (
                    <tr key={`${row.textRad}-${index}`} className="hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-zinc-800">{row.textRad}</td>
                      <td className="whitespace-nowrap px-3 py-2">{row.numbers.join(", ")}</td>
                      <td className="whitespace-nowrap px-3 py-2">{row.rankPositions.join(", ")}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">{row.sumRank}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">{formatDecimal(row.sumStreck)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">{formatDecimal(row.minStreck)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">{formatDecimal(row.averageStreck)}</td>
                    </tr>
                  ))}
                  {!preview?.rows?.length && (
                    <tr>
                      <td className="px-3 py-8 text-center text-sm text-zinc-500" colSpan={7}>Ingen preview</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-950">{value}</div>
    </div>
  );
}