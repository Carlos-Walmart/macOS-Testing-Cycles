import React, { useMemo, useState } from "react"; 

/* ===============================================================
   Walmart macOS Compatibility Testing Tool (Office Health Check)
   ---------------------------------------------------------------
   This code represents a visual testing dashboard built in React.
   It allows Walmart engineers and testers to automatically verify
   that Microsoft Office applications (Word, Excel, PowerPoint,
   Outlook, Teams) function correctly after a macOS upgrade.
================================================================ */

const Check = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.715 11.35a1 1 0 1 1 1.414-1.414l4.03 4.03 8.485-8.485a1 1 0 0 1 1.414 0z"></path>
  </svg>
);

const Cross = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M18.3 5.71a1 1 0 0 1 0 1.42L13.42 12l4.88 4.88a1 1 0 0 1-1.42 1.42L12 13.42l-4.88 4.88a1 1 0 1 1-1.42-1.42L10.58 12 5.7 7.12A1 1 0 0 1 7.12 5.7L12 10.58l4.88-4.88a1 1 0 0 1 1.42 0z"></path>
  </svg>
);

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={"animate-spin "+className} aria-hidden>
    <circle cx="12" cy="12" r="10" strokeWidth="4" fill="none" stroke="currentColor" opacity="0.25"/>
    <path d="M22 12a10 10 0 0 1-10 10" strokeWidth="4" fill="none" stroke="currentColor"/>
  </svg>
);

const testsByTab = {
  Word: ["Launch", "Sign In", "Create & Type", "Save (Local)", "Save (OneDrive)", "Export PDF", "Print Dialog"],
  Excel: ["Launch", "Open Sample", "Recalc", "Filter/Pivot", "Save & Reopen", "CSV Import"],
  PowerPoint: ["Launch", "Insert Image", "Slide Show", "Export PDF", "Save (OneDrive)"],
  Outlook: ["Account Connected", "Send Test Mail", "Receive Loopback", "Search", "Calendar Event"],
  Teams: ["Sign In", "Device Check", "Join Meeting", "Share Screen"],
};

export default function OfficeHealthCheckMock() {
  const [activeTab, setActiveTab] = useState("Word");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({});
  const [lastRun, setLastRun] = useState(null);

  const [useYellowChecks, setUseYellowChecks] = useState(true);
  const [permanentChecks, setPermanentChecks] = useState(false);

  const systemInfo = useMemo(() => ({ macOS: "15.0 (Tahoe)", office: "16.86 (Current Channel)" }), []);
  const allTabs = Object.keys(testsByTab);

  const totalTests = useMemo(() => allTabs.reduce((sum, tab) => sum + testsByTab[tab].length, 0), [allTabs]);
  const passCount = useMemo(() => Object.values(results).flatMap(o => Object.values(o || {})).filter(v => v === "pass").length, [results]);
  const failCount = useMemo(() => Object.values(results).flatMap(o => Object.values(o || {})).filter(v => v === "fail").length, [results]);
  const doneCount = passCount + failCount;
  const successPct = doneCount ? Math.round((passCount / doneCount) * 100) : 0;
  const isComplete = doneCount === totalTests && totalTests > 0 && !isRunning;

  const resetAll = () => {
    setIsRunning(false);
    setProgress(0);
    setResults({});
    setLastRun(null);
  };

  const runAll = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    const newResults = {};

    const testsFlat = allTabs.flatMap(tab => testsByTab[tab].map(t => ({ tab, t })));
    for (let i = 0; i < testsFlat.length; i++) {
      const { tab, t } = testsFlat[i];
      newResults[tab] = newResults[tab] || {};
      newResults[tab][t] = "running";
      setResults({ ...newResults });
      await new Promise(r => setTimeout(r, 240));
      const fail = tab === "Outlook" && t === "Receive Loopback";
      newResults[tab][t] = fail ? "fail" : "pass";
      setResults({ ...newResults });
      setProgress(Math.round(((i + 1) / testsFlat.length) * 100));
    }
    setIsRunning(false);
    setLastRun(new Date());
  };

  const overallStatus = useMemo(() => {
    const states = Object.values(results).flatMap(obj => Object.values(obj));
    if (!states.length) return { label: "Not Run", tone: "neutral" };
    if (states.includes("running")) return { label: "Running", tone: "info" };
    if (states.includes("fail")) return { label: "Issues Found", tone: "danger" };
    return { label: "All Passed", tone: "success" };
  }, [results]);

  const passIconClass = (useYellowChecks || permanentChecks) ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Office Health Check</h1>
            <p className="text-sm text-blue-200">Automated compatibility smoke tests for Microsoft Office on macOS.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetAll} className="px-4 py-2 rounded-2xl shadow bg-white text-blue-900 border border-slate-200 hover:bg-slate-50 transition">Reset</button>
            <button onClick={runAll} disabled={isRunning} className="px-4 py-2 rounded-2xl shadow bg-yellow-400 text-blue-900 hover:opacity-95 disabled:opacity-50 transition">
              {isRunning ? <span className="inline-flex items-center gap-2"><Spinner /> Running…</span> : "Run Tests"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="col-span-2 rounded-2xl border border-blue-700 bg-blue-950 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-blue-100">Overview</h2>
              <div className="flex items-center gap-2">
                {overallStatus.tone === 'success' && <Check className={`w-5 h-5 ${passIconClass}`} />}
                {overallStatus.tone === 'danger' && <Cross className="w-5 h-5 text-red-400" />}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{overallStatus.label}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-blue-100">
              <div>macOS: <span className="font-medium text-white">{systemInfo.macOS}</span></div>
              <div>Microsoft Office: <span className="font-medium text-white">{systemInfo.office}</span></div>
              <div>Last run: <span className="font-medium text-white">{lastRun ? lastRun.toLocaleString() : "—"}</span></div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-blue-700 rounded-full overflow-hidden">
                <div className="h-2 bg-yellow-400" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-blue-300 mt-1">{progress}%</div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-700 bg-blue-950 p-4 shadow-sm text-blue-100">
            <h2 className="font-medium mb-3">Quick Actions</h2>
            <ul className="text-sm space-y-2">
              <li>• Reset clears results and progress.</li>
              <li>• Run Tests executes all app checks sequentially.</li>
              <li>• Tabs below display test results per application.</li>
            </ul>
          </div>
        </section>

        <nav className="flex flex-wrap gap-2 mb-4">
          {Object.keys(testsByTab).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-full text-sm border transition ${activeTab === tab ? "bg-yellow-400 text-blue-900 border-yellow-400" : "bg-blue-950 border-blue-700 text-blue-100 hover:bg-blue-900"}`}>{tab}</button>
          ))}
        </nav>

        <div className="rounded-2xl border border-blue-700 bg-blue-950 p-4 shadow-sm text-blue-100">
          <h3 className="font-medium mb-3">{activeTab} Tests</h3>
          <ul className="divide-y divide-blue-800">
            {testsByTab[activeTab].map(name => {
              const state = results[activeTab]?.[name];
              return (
                <li key={name} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-blue-100">{name}</span>
                  <span>
                    {state === "pass" && <Check className={`w-5 h-5 ${passIconClass}`} />}
                    {state === "fail" && <Cross className="w-5 h-5 text-red-400" />}
                    {state === "running" && <Spinner className="w-5 h-5 text-yellow-300" />}
                    {!state && <span className="text-xs text-blue-400">Not run</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="text-xs text-blue-300 mt-6">
          Mock UI for concept preview. In production, "Run Tests" would call the notarized Swift CLI and stream results.
        </footer>
      </div>
    </div>
  );
}
