import { useEffect, useMemo, useState } from "react";

const LOCAL_API_BASE_URL = "http://localhost:63093";
const PRODUCTION_API_BASE_URL =
  "https://travanalys-reducering-backend-latest.onrender.com";
const API_BASE_URL =
  import.meta.env.VITE_REDUCTION_API_BASE_URL ||
  import.meta.env.VITE_TRAV_API_BASE_URL ||
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL);
const SUPPORTED_SPELFORMER = ["Trio", "V3", "V4", "V5", "V64", "V65", "GS75", "V85", "V86"];

const BET_LEGS = {
  Trio: 3,
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


function getTodayCompactDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

const initialSelections = Array.from({ length: 8 }, () => "");

const initialForm = {
  spelform: "GS75",
  startDatum: getTodayCompactDate(),
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

function toDateInputValue(value) {
  if (!/^\d{8}$/.test(value)) {
    return "";
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function fromDateInputValue(value) {
  return value.replaceAll("-", "");
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

function createXmlStats(result) {
  return {
    generatedRows: result.generatedRows,
    couponCount: result.couponCount,
    missingStreckHits: result.missingStreckHits,
    filename: result.fileName,
    url: result.url,
    expiresAt: result.expiresAt,
  };
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
function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "spelfil.xml";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function downloadFileFromUrl(url, filename) {
  if (!url) {
    throw new Error("Saknar XML länk från backend.");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerDownload(url, filename);
  }
}

export default function TravReductionGui() {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [xmlStats, setXmlStats] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const legCount = BET_LEGS[form.spelform] || 0;
  const isTrio = form.spelform === "Trio";
  const selectionLabel = isTrio ? "Placering" : "Avd";
  const activeSelections = useMemo(
    () => form.avdelningar.slice(0, legCount),
    [form.avdelningar, legCount],
  );
  const previewRowsList = preview?.rows || [];

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
      radpris: form.spelform === "Trio" ? 2 : 1,
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
    setStatus({ type: "loading", message: "Reducering körs" });
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
    setStatus({ type: "success", message: "Reducering redo" });
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

    setXmlStats(createXmlStats(result));
    setStatus({ type: "success", message: "XML länk kopierad" });
  }

  async function downloadXmlFile() {
    setStatus({ type: "loading", message: "Skapar XML fil" });
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
    const nextXmlStats = createXmlStats(result);
    setXmlStats(nextXmlStats);
    await downloadFileFromUrl(nextXmlStats.url, nextXmlStats.filename);
    setStatus({ type: "success", message: "XML fil laddas ner" });
  }

  async function runAction(action) {
    try {
      await action();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Request failed" });
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
        <header className="border-b border-zinc-200 pb-4 text-center sm:text-left">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-zinc-950 sm:text-2xl">Travanalys.se Reducering</h1>
            <p className="mx-auto mt-2 flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 sm:mx-0 sm:text-sm">{form.spelform} / {form.banKod || "Bana"} / {form.startDatum || "Datum"}</p>
          </div>
        </header>

        <main className="grid min-w-0 gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
          <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Spelform
                <select
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
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
                  type="date"
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
                  value={toDateInputValue(form.startDatum)}
                  onChange={(event) => updateField("startDatum", fromDateInputValue(event.target.value))}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Bana
                <select
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
                  value={form.trackCode}
                  onChange={(event) => handleTrackChange(event.target.value)}
                >
                  {options.trackCodes.map((track) => (
                    <option key={track.code} value={track.code}>{track.code} - {track.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                Lopp
                <input
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
                  inputMode="numeric"
                  value={form.lopp}
                  onChange={(event) => updateField("lopp", event.target.value)}
                />
              </label>

            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{isTrio ? "Placeringar" : "Rankade val"}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {activeSelections.map((value, index) => (
                  <label key={index} className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                    {`${selectionLabel} ${index + 1}`}
                    <input
                      className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
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
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <NumberField label="Min rank" value={form.filter.minRank} onChange={(value) => updateFilter("minRank", value)} />
                <NumberField label="Max rank" value={form.filter.maxRank} onChange={(value) => updateFilter("maxRank", value)} />
                <NumberField label="Min streck" value={form.filter.minStreck} onChange={(value) => updateFilter("minStreck", value)} />
                <NumberField label="Min total" value={form.filter.minTotalStreck} onChange={(value) => updateFilter("minTotalStreck", value)} />
                <NumberField label="Max total" value={form.filter.maxTotalStreck} onChange={(value) => updateFilter("maxTotalStreck", value)} />
                <NumberField label="Max avg" value={form.filter.maxAverageStreck} onChange={(value) => updateFilter("maxAverageStreck", value)} />
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
                  Exkludera textrad
                  <textarea
                    className="min-h-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:min-h-20 sm:text-sm"
                    value={form.excludedTextRowsText}
                    onChange={(event) => updateField("excludedTextRowsText", event.target.value)}
                  />
                </label>

                <label className="flex min-h-11 items-center gap-2 self-stretch rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 lg:self-end">
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

            <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 md:flex-row md:items-center md:justify-between">
              <div className={[
                "min-h-10 w-full rounded-md px-3 py-2 text-sm md:w-auto",
                status.type === "error" ? "bg-red-50 text-red-800" : "bg-zinc-100 text-zinc-700",
                status.type === "success" ? "bg-emerald-50 text-emerald-800" : "",
                status.type === "loading" ? "bg-sky-50 text-sky-800" : "",
              ].join(" ")}
              >
                {status.message || "Redo"}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 md:flex md:shrink-0">
                <button
                  type="button"
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-60 sm:h-10 md:w-auto"
                  disabled={status.type === "loading"}
                  onClick={() => runAction(previewRows)}
                >
                  Reducera
                </button>
                <button
                  type="button"
                  className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:h-10 md:w-auto"
                  disabled={status.type === "loading"}
                  onClick={() => runAction(downloadXmlFile)}
                >
                  Ladda ner spelfil
                </button>
                <button
                  type="button"
                  className="h-11 w-full rounded-md border border-emerald-700 bg-white px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60 sm:h-10 md:w-auto"
                  disabled={status.type === "loading"}
                  onClick={() => runAction(copyXmlUrl)}
                >
                  Kopiera länk till spelfil
                </button>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
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

            <div className="mt-4 space-y-3 md:hidden">
              {previewRowsList.map((row, index) => (
                <div
                  key={`${row.textRad}-${index}-mobile`}
                  className="rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Textrad</div>
                      <div className="mt-1 font-mono text-sm font-semibold text-zinc-900">{row.textRad}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sum rank</div>
                      <div className="mt-1 font-semibold text-zinc-900">{row.sumRank}</div>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-zinc-700">
                    <div className="col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hästar</dt>
                      <dd className="mt-0.5 break-words">{row.numbers.join(", ")}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rank</dt>
                      <dd className="mt-0.5 break-words">{row.rankPositions.join(", ")}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sum streck</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">{formatDecimal(row.sumStreck)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Min</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">{formatDecimal(row.minStreck)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Avg</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">{formatDecimal(row.averageStreck)}</dd>
                    </div>
                  </dl>
                </div>
              ))}
              {!previewRowsList.length && (
                <div className="rounded-md border border-zinc-200 bg-white px-3 py-8 text-center text-sm text-zinc-500">
                  Ingen reducering
                </div>
              )}
            </div>
            <div className="mt-4 hidden overflow-hidden rounded-md border border-zinc-200 md:block">
              <table className="w-full table-fixed divide-y divide-zinc-200 text-xs lg:text-sm">
                <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="w-[22%] px-2 py-2">Textrad</th>
                    <th className="w-[19%] px-2 py-2">Hästar</th>
                    <th className="w-[19%] px-2 py-2">Rank</th>
                    <th className="w-[10%] px-2 py-2 text-right">Sum rank</th>
                    <th className="w-[12%] px-2 py-2 text-right">Sum streck</th>
                    <th className="w-[9%] px-2 py-2 text-right">Min</th>
                    <th className="w-[9%] px-2 py-2 text-right">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {previewRowsList.map((row, index) => (
                    <tr key={`${row.textRad}-${index}`} className="hover:bg-zinc-50">
                      <td className="break-all px-2 py-2 font-mono text-[11px] leading-4 text-zinc-800 lg:text-xs">{row.textRad}</td>
                      <td className="break-words px-2 py-2 leading-5">{row.numbers.join(", ")}</td>
                      <td className="break-words px-2 py-2 leading-5">{row.rankPositions.join(", ")}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.sumRank}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{formatDecimal(row.sumStreck)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{formatDecimal(row.minStreck)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{formatDecimal(row.averageStreck)}</td>
                    </tr>
                  ))}
                  {!previewRowsList.length && (
                    <tr>
                      <td className="px-3 py-8 text-center text-sm text-zinc-500" colSpan={7}>Ingen reducering</td>
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
        className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-center sm:text-left">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-950 sm:text-2xl">{value}</div>
    </div>
  );
}
