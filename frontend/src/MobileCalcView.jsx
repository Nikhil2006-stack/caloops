import React, { useState } from "react";
import { apiRequest } from "./apiClient.js";

export default function MobileCalcView({ ansMemory, onResultComputed, onOpenTrace }) {
  const [displayExpr, setDisplayExpr] = useState("");
  const [livePreview, setLivePreview] = useState("0");
  const [lastSteps, setLastSteps] = useState([]);
  const [busy, setBusy] = useState(false);

  const appendToken = (tok) => {
    setDisplayExpr((prev) => {
      const next = prev === "0" ? String(tok) : prev + String(tok);
      return next;
    });
  };

  const handleClear = () => {
    setDisplayExpr("");
    setLivePreview("0");
    setLastSteps([]);
  };

  const handleBackspace = () => {
    setDisplayExpr((prev) => prev.slice(0, -1));
  };

  const handleEquals = async () => {
    if (!displayExpr.trim()) return;
    setBusy(true);
    try {
      const normalized = displayExpr
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
      const data = await apiRequest("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "expression",
          operation: "expression_rpn",
          inputs: { expr: normalized, variables: { ans: Number(ansMemory || 0) } },
        }),
      });
      setLivePreview(String(data.result));
      setDisplayExpr(String(data.result));
      setLastSteps(data.steps || []);
      onResultComputed(data);
    } catch (err) {
      setLivePreview("Error");
    } finally {
      setBusy(false);
    }
  };

  const runQuickLoopAction = async (operation, label) => {
    const num = Number(displayExpr || livePreview || 0);
    setBusy(true);
    try {
      let inputs = { n: num };
      if (operation === "base_convert") {
        inputs = { numStr: String(Math.trunc(num)), fromBase: 10, toBase: 2 };
      }
      const data = await apiRequest("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "daily_app",
          operation,
          inputs,
        }),
      });
      const formatted =
        typeof data.result === "boolean"
          ? data.result
            ? `${num} is PRIME`
            : `${num} is NOT Prime`
          : typeof data.result === "object"
          ? data.result.converted || JSON.stringify(data.result)
          : String(data.result);
      setLivePreview(`${label}: ${formatted}`);
      setLastSteps(data.steps || []);
      onResultComputed(data);
    } catch (err) {
      setLivePreview(err.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pocket-calc-card">
      {/* Native Mobile Calculator Display */}
      <div className="pocket-screen">
        <div className="pocket-screen-top">
          <span className="pill">ANS: {ansMemory}</span>
          {lastSteps.length > 0 && (
            <button
              type="button"
              className="small-btn"
              onClick={onOpenTrace}
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              🔍 Inspect {lastSteps.length} Loop Steps
            </button>
          )}
        </div>
        <div className="pocket-expr">{displayExpr || "0"}</div>
        <div className="pocket-result">= {livePreview}</div>
      </div>

      {/* Quick Smart Loop Strip */}
      <div className="pocket-smart-strip">
        <button
          type="button"
          className="smart-chip"
          onClick={() => runQuickLoopAction("newton_sqrt", "√")}
        >
          √x (Newton)
        </button>
        <button
          type="button"
          className="smart-chip"
          onClick={() => runQuickLoopAction("factorial", "n!")}
        >
          n! (Loop)
        </button>
        <button
          type="button"
          className="smart-chip"
          onClick={() => runQuickLoopAction("is_prime", "Prime")}
        >
          Prime?
        </button>
        <button
          type="button"
          className="smart-chip"
          onClick={() => runQuickLoopAction("base_convert", "Bin")}
        >
          → Binary
        </button>
        <button
          type="button"
          className="smart-chip"
          onClick={() => runQuickLoopAction("collatz", "3n+1")}
        >
          Collatz
        </button>
      </div>

      {/* Tactile Daily Mobile Keypad */}
      <div className="pocket-keypad">
        <button type="button" className="p-key fn" onClick={handleClear}>
          AC
        </button>
        <button type="button" className="p-key fn" onClick={() => appendToken("(")}>
          (
        </button>
        <button type="button" className="p-key fn" onClick={() => appendToken(")")}>
          )
        </button>
        <button type="button" className="p-key op" onClick={() => appendToken("÷")}>
          ÷
        </button>

        <button type="button" className="p-key" onClick={() => appendToken("7")}>
          7
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("8")}>
          8
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("9")}>
          9
        </button>
        <button type="button" className="p-key op" onClick={() => appendToken("×")}>
          ×
        </button>

        <button type="button" className="p-key" onClick={() => appendToken("4")}>
          4
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("5")}>
          5
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("6")}>
          6
        </button>
        <button type="button" className="p-key op" onClick={() => appendToken("-")}>
          −
        </button>

        <button type="button" className="p-key" onClick={() => appendToken("1")}>
          1
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("2")}>
          2
        </button>
        <button type="button" className="p-key" onClick={() => appendToken("3")}>
          3
        </button>
        <button type="button" className="p-key op" onClick={() => appendToken("+")}>
          +
        </button>

        <button type="button" className="p-key" onClick={() => appendToken("0")}>
          0
        </button>
        <button type="button" className="p-key" onClick={() => appendToken(".")}>
          .
        </button>
        <button type="button" className="p-key fn" onClick={handleBackspace}>
          ⌫
        </button>
        <button
          type="button"
          className="p-key eq"
          onClick={handleEquals}
          disabled={busy}
        >
          =
        </button>
      </div>
    </div>
  );
}
