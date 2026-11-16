import React, { useState, useEffect } from "react";

const CATEGORIES = [
  {
    id: "expression",
    label: "1. Expression & RPN",
    ops: [
      { id: "expression_rpn", name: "Shunting-Yard RPN Evaluator" },
      { id: "basic_arithmetic", name: "Basic Branch Arithmetic" },
    ],
  },
  {
    id: "loop_math",
    label: "2. Loop Arithmetic",
    ops: [
      { id: "multiply_loop", name: "Multiply via For-Loop" },
      { id: "divide_loop", name: "Divide via While-Loop (Q & R)" },
      { id: "power_loop", name: "Power via For-Loop" },
      { id: "progression", name: "AP / GP Series Loop" },
    ],
  },
  {
    id: "primes",
    label: "3. Primes & Number Theory",
    ops: [
      { id: "is_prime", name: "Early-Exit √n Prime Check" },
      { id: "sieve", name: "Sieve of Eratosthenes" },
      { id: "prime_factors", name: "Prime Factorization Loop" },
      { id: "classify_number", name: "Perfect / Abundant / Harshad" },
      { id: "gcd_lcm", name: "Euclidean GCD & LCM Loop" },
      { id: "analyze_digits", name: "Digit Extraction (Armstrong/Palindrome)" },
    ],
  },
  {
    id: "combinatorics",
    label: "4. Combinatorics & Pascal",
    ops: [
      { id: "factorial", name: "Factorial (n!) Loop" },
      { id: "fibonacci", name: "Fibonacci State-Swap Loop" },
      { id: "ncr_npr", name: "nCr & nPr Combinatorics" },
      { id: "pascals_triangle", name: "Pascal's Triangle 2D Loop" },
    ],
  },
  {
    id: "bitwise",
    label: "5. Logic, Bitwise & Bases",
    ops: [
      { id: "truth_table", name: "Nested-Loop Truth Table" },
      { id: "bitwise", name: "Bitwise Logic (&, |, ^, ~, <<, >>)" },
      { id: "popcount", name: "Brian Kernighan 1-Bit Popcount" },
      { id: "base_convert", name: "Horner Base 2..36 Converter" },
    ],
  },
  {
    id: "calculus",
    label: "6. Calculus & Convergence",
    ops: [
      { id: "collatz", name: "Collatz 3n+1 Hailstone Loop" },
      { id: "newton_sqrt", name: "Newton-Raphson √x Loop" },
      { id: "taylor_series", name: "Taylor Series (sin / cos / exp)" },
      { id: "numerical_integral", name: "Trapezoidal Definite Integral" },
    ],
  },
  {
    id: "matrix",
    label: "7. Matrix 3D Loops",
    ops: [{ id: "matrix", name: "Matrix Add / 3D Multiply / Transpose / Det" }],
  },
  {
    id: "algorithms",
    label: "8. Sorting, Search & Stats",
    ops: [{ id: "algorithms", name: "Bubble/Insertion Sort, Binary Search & Stats" }],
  },
  {
    id: "quiz",
    label: "9. Mastery Quiz & DB Leaderboard",
    ops: [{ id: "quiz_mode", name: "Interactive Loop & Logic Quiz" }],
  },
];

const DEFAULT_INPUTS = {
  expr: "3 + 4 * 2 / (1 - 5) ^ 2 + ans",
  a: 29,
  b: 5,
  op: "+",
  base: 2,
  exp: 8,
  n: 153,
  r: 3,
  count: 10,
  rows: 6,
  limit: 100,
  numStr: "FF",
  fromBase: 16,
  toBase: 2,
  funcName: "sin",
  x: 0.5235987756,
  terms: 8,
  coeffs: "0 0 1",
  intervals: 100,
  matrixA: "1 2; 3 4",
  matrixB: "5 6; 7 8",
  matrixMode: "multiply",
  list: "12 4 19 1 8 15 7",
  algoMode: "bubble",
  target: 12,
  firstTerm: 2,
  diffOrRatio: 3,
  kind: "AP",
};

export default function App() {
  const [activeCat, setActiveCat] = useState("expression");
  const [activeOp, setActiveOp] = useState("expression_rpn");
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [ansMemory, setAnsMemory] = useState(10);
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step-by-step trace playback
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Database History & Stats
  const [history, setHistory] = useState([]);
  const [filterFav, setFilterFav] = useState(false);
  const [stats, setStats] = useState(null);

  // Quiz state
  const [quizData, setQuizData] = useState({ questions: [], leaderboard: [] });
  const [quizUsername, setQuizUsername] = useState("Nikhil");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const fetchHistoryAndStats = async () => {
    try {
      const [hRes, sRes] = await Promise.all([
        fetch(`/api/history?favoriteOnly=${filterFav}&limit=40`),
        fetch("/api/stats"),
      ]);
      if (hRes.ok) setHistory(await hRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch {
      // ignore offline during initial boot
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await fetch("/api/quiz");
      if (res.ok) setQuizData(await res.json());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchHistoryAndStats();
    fetchQuiz();
  }, [filterFav]);

  useEffect(() => {
    if (!isPlaying || !currentResult?.steps?.length) return;
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => {
        if (prev + 1 >= currentResult.steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 480);
    return () => clearInterval(timer);
  }, [isPlaying, currentResult]);

  const handleCategoryChange = (catId) => {
    setActiveCat(catId);
    const found = CATEGORIES.find((c) => c.id === catId);
    if (found && found.ops.length) {
      setActiveOp(found.ops[0].id);
    }
    setError("");
  };

  const updateInput = (key, val) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const buildPayloadInputs = () => {
    switch (activeOp) {
      case "expression_rpn":
        return { expr: inputs.expr, variables: { ans: Number(ansMemory) } };
      case "basic_arithmetic":
      case "bitwise":
        return { a: inputs.a, b: inputs.b, op: inputs.op };
      case "multiply_loop":
      case "divide_loop":
      case "gcd_lcm":
        return { a: inputs.a, b: inputs.b };
      case "power_loop":
        return { base: inputs.base, exp: inputs.exp };
      case "factorial":
      case "is_prime":
      case "prime_factors":
      case "classify_number":
      case "analyze_digits":
      case "popcount":
      case "collatz":
      case "newton_sqrt":
        return { n: inputs.n };
      case "fibonacci":
        return { count: inputs.count };
      case "ncr_npr":
        return { n: inputs.n, r: inputs.r };
      case "pascals_triangle":
        return { rows: inputs.rows };
      case "sieve":
        return { limit: inputs.limit };
      case "truth_table":
        return {};
      case "base_convert":
        return {
          numStr: inputs.numStr,
          fromBase: inputs.fromBase,
          toBase: inputs.toBase,
        };
      case "taylor_series":
        return { funcName: inputs.funcName, x: inputs.x, terms: inputs.terms };
      case "numerical_integral":
        return {
          coeffs: inputs.coeffs,
          a: inputs.a,
          b: inputs.b,
          intervals: inputs.intervals,
        };
      case "matrix":
        return {
          matrixA: inputs.matrixA,
          matrixB: inputs.matrixB,
          mode: inputs.matrixMode,
        };
      case "algorithms":
        return {
          list: inputs.list,
          mode: inputs.algoMode,
          target: inputs.target,
        };
      case "progression":
        return {
          firstTerm: inputs.firstTerm,
          diffOrRatio: inputs.diffOrRatio,
          count: inputs.count,
          kind: inputs.kind,
        };
      default:
        return inputs;
    }
  };

  const runCalculation = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    setIsPlaying(false);
    try {
      const payloadInputs = buildPayloadInputs();
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCat,
          operation: activeOp,
          inputs: payloadInputs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Calculation error");
      }
      setCurrentResult(data);
      setActiveStepIdx(data.steps?.length ? data.steps.length - 1 : -1);
      if (typeof data.result === "number") {
        setAnsMemory(data.result);
      }
      fetchHistoryAndStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    await fetch(`/api/history/${id}/favorite`, { method: "PATCH" });
    fetchHistoryAndStats();
  };

  const handleDeleteRecord = async (id) => {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    fetchHistoryAndStats();
  };

  const handleClearHistory = async () => {
    await fetch("/api/history", { method: "DELETE" });
    fetchHistoryAndStats();
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    const answersArr = quizData.questions.map((_, idx) =>
      quizAnswers[idx] !== undefined ? Number(quizAnswers[idx]) : -1
    );
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: quizUsername, answers: answersArr }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuizResult(data);
      setQuizData((prev) => ({ ...prev, leaderboard: data.leaderboard }));
    }
  };

  const renderDynamicInputs = () => {
    switch (activeOp) {
      case "expression_rpn":
        return (
          <>
            <div className="form-group">
              <label>Infix Expression (supports +, -, *, /, //, %, ^, (), pi, e, ans={ansMemory})</label>
              <input
                className="input-control"
                value={inputs.expr}
                onChange={(e) => updateInput("expr", e.target.value)}
              />
            </div>
            <div className="keypad-grid">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", "(", ")", "+", "^", "%", "ans", "pi"].map(
                (tok) => (
                  <button
                    type="button"
                    key={tok}
                    className="key-btn"
                    onClick={() => updateInput("expr", `${inputs.expr} ${tok}`)}
                  >
                    {tok}
                  </button>
                )
              )}
            </div>
          </>
        );

      case "basic_arithmetic":
      case "bitwise":
        return (
          <>
            <div className="form-group">
              <label>First Operand (a)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.a}
                onChange={(e) => updateInput("a", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Operator</label>
              <select
                className="select-control"
                value={inputs.op}
                onChange={(e) => updateInput("op", e.target.value)}
              >
                {(activeOp === "bitwise"
                  ? ["&", "|", "^", "~", "<<", ">>"]
                  : ["+", "-", "*", "/", "//", "%", "**"]
                ).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            {inputs.op !== "~" && (
              <div className="form-group">
                <label>Second Operand (b)</label>
                <input
                  type="number"
                  className="input-control"
                  value={inputs.b}
                  onChange={(e) => updateInput("b", e.target.value)}
                />
              </div>
            )}
          </>
        );

      case "multiply_loop":
      case "divide_loop":
      case "gcd_lcm":
        return (
          <>
            <div className="form-group">
              <label>Integer A</label>
              <input
                type="number"
                className="input-control"
                value={inputs.a}
                onChange={(e) => updateInput("a", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Integer B</label>
              <input
                type="number"
                className="input-control"
                value={inputs.b}
                onChange={(e) => updateInput("b", e.target.value)}
              />
            </div>
          </>
        );

      case "power_loop":
        return (
          <>
            <div className="form-group">
              <label>Base</label>
              <input
                type="number"
                className="input-control"
                value={inputs.base}
                onChange={(e) => updateInput("base", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Integer Exponent</label>
              <input
                type="number"
                className="input-control"
                value={inputs.exp}
                onChange={(e) => updateInput("exp", e.target.value)}
              />
            </div>
          </>
        );

      case "factorial":
      case "is_prime":
      case "prime_factors":
      case "classify_number":
      case "analyze_digits":
      case "popcount":
      case "collatz":
      case "newton_sqrt":
        return (
          <div className="form-group">
            <label>Input Number (n)</label>
            <input
              type="number"
              className="input-control"
              value={inputs.n}
              onChange={(e) => updateInput("n", e.target.value)}
            />
          </div>
        );

      case "fibonacci":
        return (
          <div className="form-group">
            <label>Number of Fibonacci Terms (1..100)</label>
            <input
              type="number"
              className="input-control"
              value={inputs.count}
              onChange={(e) => updateInput("count", e.target.value)}
            />
          </div>
        );

      case "ncr_npr":
        return (
          <>
            <div className="form-group">
              <label>Total Items (n)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.n}
                onChange={(e) => updateInput("n", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Chosen Items (r)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.r}
                onChange={(e) => updateInput("r", e.target.value)}
              />
            </div>
          </>
        );

      case "pascals_triangle":
        return (
          <div className="form-group">
            <label>Number of Rows (1..15)</label>
            <input
              type="number"
              className="input-control"
              value={inputs.rows}
              onChange={(e) => updateInput("rows", e.target.value)}
            />
          </div>
        );

      case "sieve":
        return (
          <div className="form-group">
            <label>Upper Limit N (2..2000)</label>
            <input
              type="number"
              className="input-control"
              value={inputs.limit}
              onChange={(e) => updateInput("limit", e.target.value)}
            />
          </div>
        );

      case "truth_table":
        return (
          <p style={{ color: "var(--text-muted)", marginBottom: "0.9rem", fontSize: "0.85rem" }}>
            Generates the complete 7-gate Boolean Truth Table (AND, OR, XOR, NAND, NOR, XNOR, IMPLIES) via a 2D nested loop.
          </p>
        );

      case "base_convert":
        return (
          <>
            <div className="form-group">
              <label>Number String (e.g. FF, 101101, 255, Z9)</label>
              <input
                className="input-control"
                value={inputs.numStr}
                onChange={(e) => updateInput("numStr", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Source Base (2..36)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.fromBase}
                onChange={(e) => updateInput("fromBase", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Target Base (2..36)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.toBase}
                onChange={(e) => updateInput("toBase", e.target.value)}
              />
            </div>
          </>
        );

      case "taylor_series":
        return (
          <>
            <div className="form-group">
              <label>Function</label>
              <select
                className="select-control"
                value={inputs.funcName}
                onChange={(e) => updateInput("funcName", e.target.value)}
              >
                <option value="sin">sin(x)</option>
                <option value="cos">cos(x)</option>
                <option value="exp">exp(x)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value x (radians for sin/cos)</label>
              <input
                type="number"
                step="any"
                className="input-control"
                value={inputs.x}
                onChange={(e) => updateInput("x", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Taylor Loop Terms (1..40)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.terms}
                onChange={(e) => updateInput("terms", e.target.value)}
              />
            </div>
          </>
        );

      case "numerical_integral":
        return (
          <>
            <div className="form-group">
              <label>Polynomial Coefficients c0 c1 c2 ... (for c0 + c1·x + c2·x²)</label>
              <input
                className="input-control"
                value={inputs.coeffs}
                onChange={(e) => updateInput("coeffs", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Lower Bound (a) & Upper Bound (b)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  step="any"
                  className="input-control"
                  value={inputs.a}
                  onChange={(e) => updateInput("a", e.target.value)}
                />
                <input
                  type="number"
                  step="any"
                  className="input-control"
                  value={inputs.b}
                  onChange={(e) => updateInput("b", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Trapezoidal Subintervals N</label>
              <input
                type="number"
                className="input-control"
                value={inputs.intervals}
                onChange={(e) => updateInput("intervals", e.target.value)}
              />
            </div>
          </>
        );

      case "matrix":
        return (
          <>
            <div className="form-group">
              <label>Matrix Operation</label>
              <select
                className="select-control"
                value={inputs.matrixMode}
                onChange={(e) => updateInput("matrixMode", e.target.value)}
              >
                <option value="multiply">3D Triple-Nested Loop Multiply (A × B)</option>
                <option value="add">2D Nested Loop Addition (A + B)</option>
                <option value="transpose">2D Transpose (Aᵀ)</option>
                <option value="determinant">Cofactor Determinant det(A)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Matrix A (rows separated by ';', values by space)</label>
              <input
                className="input-control"
                value={inputs.matrixA}
                onChange={(e) => updateInput("matrixA", e.target.value)}
              />
            </div>
            {(inputs.matrixMode === "multiply" || inputs.matrixMode === "add") && (
              <div className="form-group">
                <label>Matrix B</label>
                <input
                  className="input-control"
                  value={inputs.matrixB}
                  onChange={(e) => updateInput("matrixB", e.target.value)}
                />
              </div>
            )}
          </>
        );

      case "algorithms":
        return (
          <>
            <div className="form-group">
              <label>Mode</label>
              <select
                className="select-control"
                value={inputs.algoMode}
                onChange={(e) => updateInput("algoMode", e.target.value)}
              >
                <option value="bubble">Bubble Sort Pass Visualizer</option>
                <option value="insertion">Insertion Sort Shift Visualizer</option>
                <option value="binary_search">Binary Search While-Loop</option>
                <option value="stats">Two-Pass Descriptive Statistics</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number List (space or comma separated)</label>
              <input
                className="input-control"
                value={inputs.list}
                onChange={(e) => updateInput("list", e.target.value)}
              />
            </div>
            {inputs.algoMode === "binary_search" && (
              <div className="form-group">
                <label>Search Target Value</label>
                <input
                  type="number"
                  step="any"
                  className="input-control"
                  value={inputs.target}
                  onChange={(e) => updateInput("target", e.target.value)}
                />
              </div>
            )}
          </>
        );

      case "progression":
        return (
          <>
            <div className="form-group">
              <label>Progression Kind</label>
              <select
                className="select-control"
                value={inputs.kind}
                onChange={(e) => updateInput("kind", e.target.value)}
              >
                <option value="AP">Arithmetic Progression (AP)</option>
                <option value="GP">Geometric Progression (GP)</option>
              </select>
            </div>
            <div className="form-group">
              <label>First Term (a) & Common {inputs.kind === "AP" ? "Difference (d)" : "Ratio (r)"}</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  step="any"
                  className="input-control"
                  value={inputs.firstTerm}
                  onChange={(e) => updateInput("firstTerm", e.target.value)}
                />
                <input
                  type="number"
                  step="any"
                  className="input-control"
                  value={inputs.diffOrRatio}
                  onChange={(e) => updateInput("diffOrRatio", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Number of Terms (n)</label>
              <input
                type="number"
                className="input-control"
                value={inputs.count}
                onChange={(e) => updateInput("count", e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderVisualResult = () => {
    if (!currentResult) return null;
    const { operation, result } = currentResult;

    if (operation === "truth_table" && Array.isArray(result)) {
      const cols = ["A", "B", "AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES"];
      return (
        <table className="data-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, idx) => (
              <tr key={idx}>
                {cols.map((c) => (
                  <td key={c}>{row[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (operation === "pascals_triangle" && Array.isArray(result)) {
      return (
        <div className="pascal-pyramid">
          {result.map((row, rIdx) => (
            <div className="pascal-row" key={rIdx}>
              {row.map((val, cIdx) => (
                <span className="pascal-cell" key={cIdx}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (operation === "matrix" && Array.isArray(result)) {
      return (
        <table className="data-table">
          <tbody>
            {result.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((val, cIdx) => (
                  <td key={cIdx}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const formatPrimaryResult = (res) => {
    if (res === null || res === undefined) return "—";
    if (typeof res === "boolean") return res ? "TRUE (Prime)" : "FALSE (Not Prime)";
    if (typeof res === "number" || typeof res === "string") return String(res);
    return JSON.stringify(res);
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCat);

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="topbar">
        <div>
          <div className="brand-title">CALOOPS v2.0 — MERN Logic & Loops Lab</div>
          <div className="brand-sub">
            MongoDB + Express + React + Node.js Scientific Calculator & Step-by-Step Loop Debugger
          </div>
        </div>
        <div className="status-pills">
          <span className="pill emerald">
            DB: {stats?.dbStatus?.dbMode || "Connected"}
          </span>
          <span className="pill">
            Calculations Logged: {stats?.totalCalculations ?? history.length}
          </span>
          <span className="pill amber">
            Loop Steps Traced: {stats?.totalStepsTraced ?? 0}
          </span>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="category-nav">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCat === cat.id ? "active" : ""}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {activeCat === "quiz" ? (
        <div className="main-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Interactive Logic & Loops Mastery Quiz</span>
            </div>
            <form onSubmit={handleSubmitQuiz}>
              <div className="form-group">
                <label>Your Name for Leaderboard</label>
                <input
                  className="input-control"
                  value={quizUsername}
                  onChange={(e) => setQuizUsername(e.target.value)}
                  required
                />
              </div>
              {quizData.questions.map((q, qIdx) => (
                <div key={q.id} className="result-box" style={{ marginBottom: "0.85rem" }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Q{qIdx + 1}. {q.question}
                  </div>
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      style={{
                        display: "block",
                        padding: "0.3rem 0",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={Number(quizAnswers[qIdx]) === oIdx}
                        onChange={() =>
                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                        }
                        style={{ marginRight: "0.5rem" }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ))}
              <button type="submit" className="run-btn">
                Submit Quiz & Save Score to Database
              </button>
            </form>

            {quizResult && (
              <div className="result-box" style={{ marginTop: "1rem" }}>
                <div className="result-label">Quiz Score</div>
                <div className="result-value">
                  {quizResult.entry.score} / {quizResult.entry.total} ({quizResult.entry.percentage}%)
                </div>
                <div style={{ marginTop: "0.75rem", fontSize: "0.83rem" }}>
                  {quizResult.review.map((r) => (
                    <div key={r.id} style={{ marginBottom: "0.45rem" }}>
                      <strong style={{ color: r.isCorrect ? "#10b981" : "#f43f5e" }}>
                        {r.isCorrect ? "✓ Correct:" : "✗ Review:"}
                      </strong>{" "}
                      {r.explanation}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Database Leaderboard</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coder</th>
                  <th>Score</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {quizData.leaderboard.map((entry, idx) => (
                  <tr key={entry._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{entry.username}</td>
                    <td>
                      {entry.score}/{entry.total}
                    </td>
                    <td>{entry.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="main-grid">
          {/* Left Column: Calculator Controls */}
          <section className="panel">
            <div className="panel-header">
              <span className="panel-title">{activeCategoryObj?.label}</span>
              <span className="pill">ANS = {ansMemory}</span>
            </div>

            <div className="op-selector">
              {activeCategoryObj?.ops.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  className={`op-chip ${activeOp === op.id ? "selected" : ""}`}
                  onClick={() => setActiveOp(op.id)}
                >
                  {op.name}
                </button>
              ))}
            </div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={runCalculation}>
              {renderDynamicInputs()}
              <button type="submit" className="run-btn" disabled={loading}>
                {loading ? "Executing Loop..." : "▶ Execute & Trace Loop"}
              </button>
            </form>
          </section>

          {/* Center Column: Result & Live Loop/Logic Debugger */}
          <section className="panel">
            <div className="panel-header">
              <span className="panel-title">Execution Output & Step-by-Step Loop Trace</span>
              {currentResult && (
                <span className="pill emerald">{currentResult.executionTimeMs} ms</span>
              )}
            </div>

            {currentResult ? (
              <>
                <div className="result-box">
                  <div className="result-label">Computed Result</div>
                  <div className="result-value">
                    {formatPrimaryResult(currentResult.result)}
                  </div>
                  {renderVisualResult()}
                  <div className="meta-row">
                    <span className="pill">{currentResult.loopType}</span>
                    <span className="pill amber">
                      Complexity: {currentResult.complexity}
                    </span>
                    <span className="pill emerald">
                      {currentResult.steps?.length || 0} Trace Steps
                    </span>
                  </div>
                </div>

                <div className="trace-controls">
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStepIdx((i) => Math.max(0, i - 1));
                    }}
                  >
                    ◀ Prev Step
                  </button>
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      if (activeStepIdx >= (currentResult.steps?.length || 1) - 1) {
                        setActiveStepIdx(0);
                      }
                      setIsPlaying((p) => !p);
                    }}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Animate Loop"}
                  </button>
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStepIdx((i) =>
                        Math.min((currentResult.steps?.length || 1) - 1, i + 1)
                      );
                    }}
                  >
                    Next Step ▶
                  </button>
                  <button
                    type="button"
                    className="small-btn"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStepIdx((currentResult.steps?.length || 1) - 1);
                    }}
                  >
                    Show All ({ (currentResult.steps?.length || 0) })
                  </button>
                </div>

                <div className="trace-terminal">
                  {currentResult.steps?.slice(0, activeStepIdx + 1).map((line, idx) => (
                    <div
                      key={idx}
                      className={`trace-line ${idx === activeStepIdx ? "active-step" : ""}`}
                    >
                      <span style={{ color: "#64748b", marginRight: "0.5rem" }}>
                        [{String(idx + 1).padStart(2, "0")}]
                      </span>
                      {line}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Select an operation on the left and click <strong>Execute & Trace Loop</strong> to inspect every loop iteration and boolean branch in real time.
              </p>
            )}
          </section>

          {/* Right Column: Persistent Database History */}
          <section className="panel">
            <div className="panel-header">
              <span className="panel-title">Database History</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => setFilterFav((f) => !f)}
                >
                  {filterFav ? "★ Favorites" : "☆ All"}
                </button>
                <button
                  type="button"
                  className="small-btn"
                  onClick={handleClearHistory}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>
                  No calculations stored yet. Run any calculation to persist it to the database.
                </p>
              ) : (
                history.map((item) => (
                  <div className="history-item" key={item._id}>
                    <div className="history-item-top">
                      <span className="history-op">{item.operation}</span>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          type="button"
                          className="small-btn"
                          onClick={() => setCurrentResult(item)}
                          title="Inspect Trace"
                        >
                          Trace
                        </button>
                        <button
                          type="button"
                          className="small-btn"
                          onClick={() => handleToggleFavorite(item._id)}
                        >
                          {item.favorite ? "★" : "☆"}
                        </button>
                        <button
                          type="button"
                          className="small-btn"
                          onClick={() => handleDeleteRecord(item._id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.76rem" }}>
                      Inputs: {JSON.stringify(item.inputs)}
                    </div>
                    <div
                      style={{
                        color: "var(--accent-emerald)",
                        fontWeight: 700,
                        marginTop: "0.2rem",
                        wordBreak: "break-word",
                      }}
                    >
                      Result: {formatPrimaryResult(item.result)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
