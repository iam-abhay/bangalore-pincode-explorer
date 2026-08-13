import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const samples = [
  { label: "560001", type: "PIN" },
  { label: "Koramangala", type: "Area" },
  { label: "Whitefield", type: "Area" },
  { label: "Indiranagar", type: "Area" },
  { label: "560078", type: "PIN" },
  { label: "Malleswaram", type: "Area" }
];

export default function App() {
  const [mode, setMode] = useState("pincode");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [sort, setSort] = useState("area");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [copiedPin, setCopiedPin] = useState(null);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bpe-recent") || "[]"); }
    catch { return []; }
  });

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pincodes?limit=9&sort=${sort}&order=${order}`);
      if (!response.ok) throw new Error("Failed to load records");
      const body = await response.json();
      setResults(body.data);
      setMeta(body);
    } catch {
      // Fallback preview data if API is unreachable on initial load
      setResults(dataPreview);
      setMeta({ total: dataPreview.length, page: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [sort, order]);

  useEffect(() => {
    if (!searched) {
      loadInitialData();
    }
  }, [loadInitialData, searched]);

  async function search(value = query, page = 1) {
    const term = value.trim();

    if (!term) {
      setSearched(false);
      setError("");
      loadInitialData();
      return;
    }

    if (mode === "pincode" && !/^\d{6}$/.test(term)) {
      setError("Enter a valid 6-digit PIN code.");
      setResults([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        [mode === "pincode" ? "pincode" : "area"]: term,
        page: String(page),
        limit: "9",
        sort,
        order
      });

      const response = await fetch(`${API_URL}/pincodes?${params}`);
      const body = await response.json();

      if (!response.ok) throw new Error(body.message || "Unable to search.");

      setResults(body.data);
      setMeta(body);
      setSearched(true);

      const item = `${mode}:${term}`;
      setRecent((old) => {
        const next = [item, ...old.filter((x) => x !== item)].slice(0, 5);
        localStorage.setItem("bpe-recent", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setError(err.message || "Could not connect to the API.");
      setResults([]);
      setMeta({ total: 0, page: 1, totalPages: 1 });
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  // Debounced auto-search for area mode
  useEffect(() => {
    if (mode !== "area" || !query.trim()) return;

    const handler = setTimeout(() => {
      search(query, 1);
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode]);

  useEffect(() => {
    if (searched && query.trim()) search(query, 1);
    // Intentionally re-run when sorting changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order]);

  useEffect(() => {
    setQuery("");
    setSearched(false);
    setError("");
  }, [mode]);

  const uniquePins = useMemo(
    () => new Set(results.map((item) => item.pincode)).size,
    [results]
  );

  function useSample(sample) {
    const [sampleMode, sampleValue] = sample.split(":");
    setMode(sampleMode);
    setQuery(sampleValue);
    setTimeout(() => search(sampleValue, 1), 0);
  }

  async function copyPin(pin) {
    try {
      await navigator.clipboard.writeText(pin);
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2500);
    } catch {
      // Clipboard fallback
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2500);
    }
  }

  return (
    <div className="app-shell">
      {copiedPin && (
        <div className="toast">
          ✓ Copied PIN <strong>{copiedPin}</strong> to clipboard!
        </div>
      )}

      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">⌖</div>
            <span>Pincode Explorer</span>
          </div>
          <span className="nav-pill">BENGALURU · KARNATAKA</span>
        </nav>

        <div className="hero-content">
          <div className="eyebrow">FULL-STACK POSTAL DIRECTORY</div>
          <h1>Find the right <em>area</em> for every PIN.</h1>
          <p>
            Search Bangalore PIN codes and localities in seconds.
            Simple, fast, and built as a real full-stack application.
          </p>

          <div className="search-box">
            <div className="search-tabs">
              <button className={mode === "pincode" ? "active" : ""} onClick={() => setMode("pincode")}>PIN code</button>
              <button className={mode === "area" ? "active" : ""} onClick={() => setMode("area")}>Area name</button>
            </div>

            <div className="search-row">
              <span className="search-icon">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={mode === "pincode" ? "Enter 6-digit PIN code" : "Search an area, e.g. Koramangala"}
                inputMode={mode === "pincode" ? "numeric" : "text"}
                maxLength={mode === "pincode" ? 6 : 60}
              />
              <button className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? "Searching…" : "Search"}
              </button>
            </div>

            {error && <div className="error">⚠ {error}</div>}
          </div>

          <div className="quick-searches">
            <span>Try:</span>
            {samples.map((sample) => (
              <button key={sample.label} onClick={() => useSample(`${sample.type === "PIN" ? "pincode" : "area"}:${sample.label}`)}>
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="content">
        <section className="stats">
          <div><strong>{meta.total || "—"}</strong><span>matching areas</span></div>
          <div><strong>{uniquePins || "—"}</strong><span>PINs on this page</span></div>
          <div><strong>6</strong><span>digit PIN format</span></div>
        </section>

        {recent.length > 0 && !searched && (
          <section className="recent">
            <div className="section-title">
              <div>
                <span className="eyebrow">YOUR SEARCHES</span>
                <h2>Recent lookups</h2>
              </div>
            </div>
            <div className="recent-list">
              {recent.map((item) => (
                <button key={item} onClick={() => useSample(item)}>
                  {item.split(":")[1]} <span>↗</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="section-title">
            <div>
              <span className="eyebrow">{searched ? "RESULTS" : "EXPLORE"}</span>
              <h2>{searched ? `${meta.total} matching areas` : "Popular Bangalore areas"}</h2>
            </div>
            <div className="controls">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="area">Sort: Area</option>
                <option value="pincode">Sort: PIN</option>
              </select>
              <button className="order-btn" onClick={() => setOrder((x) => x === "asc" ? "desc" : "asc")}>
                {order === "asc" ? "A–Z ↑" : "Z–A ↓"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="cards-skeleton">
              {[...Array(6)].map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          ) : (
            <div className="cards">
              {results.map((item) => (
                <article className="card" key={`${item.area}-${item.pincode}`}>
                  <div className="card-top">
                    <span className="pin-badge">{item.pincode}</span>
                    <button
                      className={`copy ${copiedPin === item.pincode ? "copied" : ""}`}
                      title="Copy PIN"
                      onClick={() => copyPin(item.pincode)}
                    >
                      {copiedPin === item.pincode ? "✓" : "⧉"}
                    </button>
                  </div>
                  <h3>{item.area}</h3>
                  <p>{item.district}, {item.state}</p>
                  <div className="card-footer">
                    <span>📍 {item.latitude ? item.latitude.toFixed(4) : "12.97"}, {item.longitude ? item.longitude.toFixed(4) : "77.59"}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${item.latitude || 12.97},${item.longitude || 77.59}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Map ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {searched && !loading && results.length === 0 && !error && (
            <div className="empty">
              <div className="empty-icon">⌕</div>
              <h3>No Bangalore locations found</h3>
              <p>Try another PIN code or a different area name.</p>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="pagination">
              <button disabled={meta.page <= 1} onClick={() => search(query, meta.page - 1)}>← Previous</button>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <button disabled={meta.page >= meta.totalPages} onClick={() => search(query, meta.page + 1)}>Next →</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <div>
          <strong>Bangalore Pincode Explorer</strong>
          <span>Built with React + Express</span>
        </div>
        <a href="https://www.indiapost.gov.in/locate-postoffice" target="_blank" rel="noreferrer">
          Verify with India Post ↗
        </a>
      </footer>
    </div>
  );
}

const dataPreview = [
  { area: "Bangalore G.P.O.", pincode: "560001", latitude: 12.972442, longitude: 77.580643, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Koramangala", pincode: "560034", latitude: 12.9317, longitude: 77.6227, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Indiranagar", pincode: "560038", latitude: 12.9719, longitude: 77.6412, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Whitefield", pincode: "560066", latitude: 12.9698, longitude: 77.7499, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "J P Nagar", pincode: "560078", latitude: 12.9105, longitude: 77.5857, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Malleswaram", pincode: "560003", latitude: 13.0081, longitude: 77.5648, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Vijayanagar", pincode: "560040", latitude: 12.9699, longitude: 77.5333, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Mahadevapura", pincode: "560048", latitude: 12.9904, longitude: 77.6842, district: "Bengaluru Urban", state: "Karnataka" },
  { area: "Rajajinagar", pincode: "560010", latitude: 12.9906, longitude: 77.5533, district: "Bengaluru Urban", state: "Karnataka" }
];
