import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable";
import AnalysChart from "./AnalysChart";
import SharedHorseLegend from "./SharedHorseLegend";
import RoiTable from "./RoiTable";

const FALLBACK_BANNER = {
  mening: "Kolla in skrällen enligt analysen",
  url: "https://travanalys.se",
};

const normalizeStarter = (v) => String(v ?? "").trim() || "0"; //Changed!

const ToggleComponent = ({ syncWithRoute = false }) => {
  const { view: viewParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const routeToView = {
    analys: "spider",
    tabell: "table",
    speltips: "skrallar",
  };
  const viewToRoute = {
    spider: "analys",
    table: "tabell",
    skrallar: "speltips",
    bar: "analys",
  };

  const initialSelectedView = syncWithRoute
    ? routeToView[viewParam] || "spider"
    : "spider";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState(initialSelectedView);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [startsCount, setStartsCount] = useState("0"); //Changed!
  const [visibleHorseIdxes, setVisibleHorseIdxes] = useState([]);
  const [horseLegendItems, setHorseLegendItems] = useState([]);
  const [top5Idxes, setTop5Idxes] = useState([]);
  const [top3Idxes, setTop3Idxes] = useState([]);
  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://travanalyserver-latest.onrender.com";

  const pendingLapRef = useRef(null);
  const setPendingLapId = (lapId) => {
    pendingLapRef.current = lapId;
  };

  const [legendMode, setLegendMode] = useState("all");

  const initialQuery = useRef({
    date: searchParams.get("date") || "",
    track: searchParams.get("track") || "",
    competition: searchParams.get("competition") || "",
    lap: searchParams.get("lap") || "",
  });

  // Synk-flaggor
  const hadInitialQuery = useRef(
    Boolean(
      initialQuery.current.date ||
        initialQuery.current.track ||
        initialQuery.current.competition ||
        initialQuery.current.lap
    )
  );
  const shouldSyncQueryRef = useRef(hadInitialQuery.current);
  const lastWrittenQueryRef = useRef("");

  const markUserInteraction = () => {
    shouldSyncQueryRef.current = true;
  };
  const withUserSync = (setter) => (v) => {
    markUserInteraction();
    setter(v);
  };

  const setSelectedDateUser = withUserSync(setSelectedDate);
  const setSelectedTrackUser = withUserSync(setSelectedTrack);
  const setSelectedCompetitionUser = withUserSync(setSelectedCompetition);
  const setSelectedLapUser = withUserSync(setSelectedLap);
  const setStartsCountUser = withUserSync(setStartsCount);

  const appliedFromQuery = useRef({
    track: false,
    competition: false,
    lap: false,
  });

  const fold = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const normalize = (s) => fold(s).trim().toLowerCase();
  const compact = (s) => normalize(s).replace(/[^a-z0-9]/g, "");

  const lastTrackForCompetitionApplyRef = useRef(null);
  const lastCompetitionForLapApplyRef = useRef(null);

  // Banner: hämta + fallback + auto-rotate
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/banner`);

        if (!res.ok) {
          setBanners([FALLBACK_BANNER]);
          setCurrentIndex(0);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else {
          setBanners([FALLBACK_BANNER]);
        }
        setCurrentIndex(0);
      } catch (error) {
        console.error("Kunde inte hämta banner", error);
        setBanners([FALLBACK_BANNER]);
        setCurrentIndex(0);
      }
    };

    fetchBanner();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(intervalId);
  }, [banners]);

  const banner = banners[currentIndex];

  // Lyssna på externa URL-förändringar (t.ex. man ändrar i adressfältet)
  useEffect(() => {
    const curr = searchParams.toString();
    if (curr === lastWrittenQueryRef.current) return;

    // Läs in ny query och tillåt omappning i effekterna
    initialQuery.current = {
      date: searchParams.get("date") || "",
      track: searchParams.get("track") || "",
      competition: searchParams.get("competition") || "",
      lap: searchParams.get("lap") || "",
    };
    appliedFromQuery.current = { track: false, competition: false, lap: false };

    // Nollställ “senast applicerad förälder” så vi får försöka igen
    lastTrackForCompetitionApplyRef.current = null;
    lastCompetitionForLapApplyRef.current = null;

    // Sätt datum direkt om det finns
    const qDate = initialQuery.current.date;
    if (qDate && qDate !== selectedDate) setSelectedDate(qDate);

    // Börja synka till URL (nu använder man URL aktivt)
    shouldSyncQueryRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!syncWithRoute) return;
    const nextView = routeToView[viewParam] || "spider";
    setSelectedView(nextView);
    if (nextView !== "spider") setSelectedHorse(null);
  }, [syncWithRoute, viewParam]);

  const setViewAndMaybeNavigate = (viewKey) => {
    setSelectedView(viewKey);
    if (viewKey !== "spider") setSelectedHorse(null);
    if (syncWithRoute) {
      const target = `/chart/${viewToRoute[viewKey]}`;
      if (location.pathname !== target) {
        navigate({
          pathname: target,
          search: shouldSyncQueryRef.current
            ? `?${searchParams.toString()}`
            : "",
        });
      }
    }
  };
  const switchView = (viewKey) => setViewAndMaybeNavigate(viewKey);

  const pickClosestDate = (arr) => {
    if (!arr?.length) return "";
    const today = new Date();
    let best = arr[0],
      bestDiff = Infinity;
    for (const d of arr) {
      const diff = Math.abs(new Date(d.date) - today);
      if (diff < bestDiff || (diff === bestDiff && new Date(d.date) >= today)) {
        best = d;
        bestDiff = diff;
      }
    }
    return best.date;
  };

  // DATUM
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/track/dates`, {
          signal: ac.signal,
        });
        const all = await r.json();
        const uniqueSorted = Array.from(
          new Map(all.map((d) => [d.date, d])).values()
        ).sort((a, b) => a.date.localeCompare(b.date));
        setDates(uniqueSorted);

        if (!selectedDate) {
          if (initialQuery.current.date) {
            setSelectedDate(initialQuery.current.date);
          } else {
            const todayStr = new Date().toISOString().split("T")[0];
            const hasToday = uniqueSorted.find((x) => x.date === todayStr);
            setSelectedDate(
              hasToday ? todayStr : pickClosestDate(uniqueSorted)
            );
          }
        }
      } catch (e) {
        console.error("dates:", e);
      }
    })();
    return () => ac.abort();
  }, []);

  // BANOR
  useEffect(() => {
    if (!selectedDate) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setTracks(d);
        if (!d?.length) {
          setSelectedTrack("");
          return;
        }

        // Försök applicera query
        if (!appliedFromQuery.current.track && initialQuery.current.track) {
          const q = initialQuery.current.track;
          const byId = d.find((t) => String(t.id) === q);
          const byName = d.find(
            (t) => normalize(t.nameOfTrack) === normalize(q)
          );
          const target = byId || byName;
          appliedFromQuery.current.track = true;
          if (target) {
            setSelectedTrack(target.id);
            return;
          }
        }

        const ok = d.some((t) => t.id === +selectedTrack);
        if (!ok) setSelectedTrack(d[0].id);
      } catch (e) {
        console.error("tracks:", e);
        setTracks([]);
      }
    })();
    return () => ac.abort();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedTrack) return;

    if (
      initialQuery.current.competition &&
      lastTrackForCompetitionApplyRef.current !== selectedTrack
    ) {
      appliedFromQuery.current.competition = false;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setCompetitions(d);

        if (
          !appliedFromQuery.current.competition &&
          initialQuery.current.competition
        ) {
          const q = initialQuery.current.competition;
          const items = Array.isArray(d) ? d : [];
          const byId = items.find((c) => String(c.id) === q);
          const byExact = items.find(
            (c) => normalize(c.nameOfCompetition) === normalize(q)
          );
          const byCompact = items.find(
            (c) => compact(c.nameOfCompetition) === compact(q)
          );
          const target = byId || byExact || byCompact;

          appliedFromQuery.current.competition = true;
          lastTrackForCompetitionApplyRef.current = selectedTrack;

          if (target) {
            setSelectedCompetition(target.id);
            return;
          }
        }

        const ok = d?.some((c) => c.id === +selectedCompetition);
        if (!ok && d?.length && !initialQuery.current.competition) {
          setSelectedCompetition(d[0].id);
        }
      } catch (e) {
        console.error("competitions:", e);
        setCompetitions([]);
      }
    })();
    return () => ac.abort();
  }, [selectedTrack]);

  // LOPP
  useEffect(() => {
    if (!selectedCompetition) return;

    if (
      initialQuery.current.lap &&
      lastCompetitionForLapApplyRef.current !== selectedCompetition
    ) {
      appliedFromQuery.current.lap = false;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setLaps(d || []);

        const desired = pendingLapRef.current;
        if (desired && d?.some((l) => l.id === +desired)) {
          setSelectedLap(desired);
          pendingLapRef.current = null;
          return;
        }

        if (!appliedFromQuery.current.lap && initialQuery.current.lap) {
          const qRaw = initialQuery.current.lap;
          const onlyDigits = /^\d+$/.test(qRaw);
          const firstNumber = (s) => {
            const m = String(s).match(/\d+/);
            return m ? parseInt(m[0], 10) : null;
          };
          const items = Array.isArray(d) ? d : [];
          const qNum = onlyDigits ? parseInt(qRaw, 10) : null;

          const byId =
            !onlyDigits || qRaw.length >= 4
              ? items.find((l) => String(l.id) === qRaw)
              : null;

          const byExactName = items.find(
            (l) => normalize(l.nameOfLap) === normalize(qRaw)
          );

          const byNumberToken =
            qNum != null
              ? items.find((l) => firstNumber(l.nameOfLap) === qNum)
              : null;

          let byOrdinal = null;
          if (qNum != null && qNum >= 1 && qNum <= items.length) {
            const sorted = [...items].sort((a, b) => {
              const na = firstNumber(a.nameOfLap) ?? Number.POSITIVE_INFINITY;
              const nb = firstNumber(b.nameOfLap) ?? Number.POSITIVE_INFINITY;
              return na - nb;
            });
            byOrdinal =
              sorted.find((l) => firstNumber(l.nameOfLap) === qNum) ||
              sorted[qNum - 1] ||
              null;
          }

          const target = byExactName || byNumberToken || byId || byOrdinal;

          appliedFromQuery.current.lap = true;
          lastCompetitionForLapApplyRef.current = selectedCompetition;

          if (target) {
            setSelectedLap(target.id);
            return;
          }
        }

        const ok = d?.some((l) => l.id === +selectedLap);
        if (!ok && d?.length && !initialQuery.current.lap) {
          setSelectedLap(d[0].id);
        }
      } catch (e) {
        console.error("laps:", e);
        setLaps([]);
      }
    })();
    return () => ac.abort();
  }, [selectedCompetition]);

  useEffect(() => {
    setSelectedHorse(null);
    setVisibleHorseIdxes([]);
  }, [selectedLap]);

  // Skriv tillbaka searchParams (URL) – först när vi är klara med ev. query-applicering
  useEffect(() => {
    if (!shouldSyncQueryRef.current) return;

    const isApplyingQuery =
      (!!initialQuery.current.track && !appliedFromQuery.current.track) ||
      (!!initialQuery.current.competition &&
        !appliedFromQuery.current.competition) ||
      (!!initialQuery.current.lap && !appliedFromQuery.current.lap);
    if (isApplyingQuery) return;

    const params = new URLSearchParams(searchParams);

    if (selectedDate) params.set("date", selectedDate);
    else params.delete("date");

    if (selectedTrack) {
      const t = tracks.find((x) => x.id === +selectedTrack);
      params.set("track", t?.nameOfTrack ?? String(selectedTrack));
    } else params.delete("track");

    if (selectedCompetition) {
      const c = competitions.find((x) => x.id === +selectedCompetition);
      params.set(
        "competition",
        c?.nameOfCompetition ?? String(selectedCompetition)
      );
    } else params.delete("competition");

    if (selectedLap) {
      const l = laps.find((x) => x.id === +selectedLap);
      params.set("lap", l?.nameOfLap ?? String(selectedLap));
    } else params.delete("lap");

    const next = params.toString();
    if (next !== searchParams.toString()) {
      lastWrittenQueryRef.current = next;
      setSearchParams(params, { replace: true });
    }
  }, [
    selectedDate,
    selectedTrack,
    selectedCompetition,
    selectedLap,
    tracks,
    competitions,
    laps,
  ]);

  const handleMetaChange = ({
    items,
    suggestedVisibleIdxes,
    top5Idx,
    top3Idx,
  }) => {
    setHorseLegendItems(items || []);
    setVisibleHorseIdxes((prev) =>
      legendMode === "top3" && Array.isArray(top3Idx)
        ? top3Idx
        : legendMode === "top5" && Array.isArray(top5Idx)
        ? top5Idx
        : prev?.length
        ? prev
        : suggestedVisibleIdxes || []
    );
    if (Array.isArray(top5Idx)) setTop5Idxes(top5Idx);
    if (Array.isArray(top3Idx)) setTop3Idxes(top3Idx);
  };

  const toggleLegendIdx = (idx) =>
    setVisibleHorseIdxes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  const showAllLegend = () => {
    setLegendMode("all");
    setVisibleHorseIdxes(horseLegendItems.map((x) => x.idx));
  };
  const showTop5Legend = () => {
    setLegendMode("top5");
    setVisibleHorseIdxes(top5Idxes);
  };
  const showTop3Legend = () => {
    setLegendMode("top3");
    setVisibleHorseIdxes(top3Idxes);
  };

  const callouts = [
    {
      id: 2,
      name: "Analys",
      bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600",
      view: "spider",
    },
    {
      id: 3,
      name: "Ranking",
      bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600",
      view: "table",
    },
    {
      id: 4,
      name: "Spel & ROI",
      bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600",
      view: "skrallar",
    },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14 bg-slate-100">
      {banner && (
        <div className="flex justify-center">
          <a
            href={banner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-x-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 pl-5 pr-3 py-1 mb-4 text-xs font-semibold text-white shadow-lg ring-1 ring-black/5 hover:scale-[1.02] hover:shadow-xl hover:ring-black/10 transition"
          >
            <span className="flex min-w-0 text-left">
              <span
                className="block truncate text-xs sm:text-base max-w-[80vw] sm:max-w-[26rem] md:max-w-[32rem]"
                title={banner.mening}
              >
                {banner.mening}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="ml-0 mr-0 text-2xl flex-shrink-0 sm:mb-1"
            >
              →
            </span>
          </a>
        </div>
      )}

      <div className="flex justify-center gap-x-4 sm:gap-x-10 flex-nowrap overflow-auto mb-4 sm:mb-8 pt-2 pb-3">
        {callouts.map((c) => (
          <div
            key={c.id}
            className="group relative cursor-pointer"
            onClick={() => switchView(c.view)}
          >
            <div
              className={`${
                c.bgColor
              } relative h-14 w-24 lg:w-72 lg:h-18 md:w-52 md:h-18 mb-1 sm:mb-0 overflow-hidden rounded-md flex items-center justify-center transition-all duration-300 ${
                selectedView === c.view
                  ? "ring-2 ring-slate-800 scale-110 opacity-100 cursor-default"
                  : "hover:opacity-70"
              }`}
            >
              <h3 className="sm:text-2xl font-semibold text-white text-center">
                {c.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="sm:max-w-5xl sm:mx-auto bg-white ml-3 mr-3 sm:pl-8 sm:pr-8 sm:pb-2 rounded-xl shadow-lg min-h-[70vh]">
        {(selectedView === "bar" || selectedView === "spider") && (
          <div className="grid grid-cols-1 gap-4">
            <div className="min-h-[400px]">
              <BarChart
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDateUser}
                selectedTrack={selectedTrack}
                setSelectedTrack={setSelectedTrackUser}
                selectedCompetition={selectedCompetition}
                setSelectedCompetition={setSelectedCompetitionUser}
                selectedLap={selectedLap}
                setSelectedLap={setSelectedLapUser}
                dates={dates}
                tracks={tracks}
                competitions={competitions}
                laps={laps}
                setSelectedView={setViewAndMaybeNavigate}
                setSelectedHorse={setSelectedHorse}
                setVisibleHorseIdxes={setVisibleHorseIdxes}
                startsCount={startsCount}
                setStartsCount={setStartsCountUser}
                setLegendMode={setLegendMode}
              />
            </div>

            <div className="min-h-[400px] sm:grid sm:grid-cols-[minmax(0,1fr)_16rem] sm:gap-6">
              <div className="min-w-0">
                <SpiderChart
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDateUser}
                  selectedTrack={selectedTrack}
                  setSelectedTrack={setSelectedTrackUser}
                  selectedCompetition={selectedCompetition}
                  setSelectedCompetition={setSelectedCompetitionUser}
                  selectedLap={selectedLap}
                  setSelectedLap={setSelectedLapUser}
                  selectedHorse={selectedHorse}
                  visibleHorseIdxes={visibleHorseIdxes}
                  onMetaChange={handleMetaChange}
                  startsCount={startsCount}
                />
              </div>

              <div className="mt-0 ml-4 sm:mt-28 sm:justify-self-end sm:w-64 shrink-0">
                <SharedHorseLegend
                  items={horseLegendItems}
                  visibleIdxes={visibleHorseIdxes}
                  onToggle={(i) => {
                    markUserInteraction();
                    toggleLegendIdx(i);
                  }}
                  onShowAll={() => {
                    markUserInteraction();
                    showAllLegend();
                  }}
                  onShowTop5={() => {
                    markUserInteraction();
                    showTop5Legend();
                  }}
                  onShowTop3={() => {
                    markUserInteraction();
                    showTop3Legend();
                  }}
                  active={legendMode}
                />
              </div>
            </div>

            {normalizeStarter(startsCount) !== "0" && ( //Changed!
              <div className="min-h-[200px]">
                <AnalysChart
                  selectedLap={selectedLap}
                  selectedHorse={selectedHorse}
                  visibleHorseIdxes={visibleHorseIdxes}
                  startsCount={startsCount}
                />
              </div>
            )}
          </div>
        )}

        <div
          className={`${
            selectedView === "table" ? "" : "hidden"
          } min-h-[600px]`}
        >
          <PaginatedLapTable
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDateUser}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrackUser}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetitionUser}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLapUser}
            dates={dates}
            tracks={tracks}
            competitions={competitions}
            laps={laps}
            startsCount={startsCount}
            setStartsCount={setStartsCountUser}
          />
        </div>

        <div
          className={`${
            selectedView === "skrallar" ? "" : "hidden"
          } min-h-[600px]`}
        >
          <RoiTable
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDateUser}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrackUser}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetitionUser}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLapUser}
            dates={dates}
            tracks={tracks}
            competitions={competitions}
            laps={laps}
            startsCount={startsCount}
            setStartsCount={setStartsCountUser}
            setSelectedView={setViewAndMaybeNavigate}
            setSelectedHorse={setSelectedHorse}
            setPendingLapId={setPendingLapId}
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
