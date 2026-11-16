import React, { useState, useRef } from "react";

export default function AuthPage({ onAuthSuccess }) {
  // Modes: 'login' | 'mobile_otp' | 'register' | 'forgot'
  const [mode, setMode] = useState("login");

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Mobile OTP fields
  const [mobileNo, setMobileNo] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [smsPopup, setSmsPopup] = useState(null);

  // Forgot Password fields
  const [forgotId, setForgotId] = useState("");
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Feedback state
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef([]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setInfo("");
  };

  // 1. Standard Login (Username / Email / Mobile + Password)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Register New Account
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          mobile: regMobile,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Send OTP to Entered Mobile Number
  const handleSendMobileOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send OTP");
      setOtpSent(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setInfo(`OTP sent to +91 ${data.mobile}. Please enter the 6-digit OTP below.`);
      if (data.smsReceipt) {
        setSmsPopup({
          mobile: data.mobile,
          otp: data.smsReceipt.otpPreview,
          channel: data.smsReceipt.channel,
          text: data.smsReceipt.messageText,
        });
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Mobile OTP & Login to Project
  const verifyOtpCode = async (codeStr) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNo, otp: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      setSmsPopup(null);
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }
    verifyOtpCode(code);
  };

  const handleOtpDigitChange = (idx, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);

    if (digit && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }

    // Auto-login when all 6 digits are typed!
    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d !== "")) {
      verifyOtpCode(fullCode);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // 5. Forgot Password Flow
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset OTP");
      setResetOtpSent(true);
      setInfo(data.message);
      if (data.smsReceipt) {
        setSmsPopup({
          mobile: data.mobile,
          otp: data.smsReceipt.otpPreview,
          channel: data.smsReceipt.channel,
          text: data.smsReceipt.messageText,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotId,
          otp: resetOtp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");
      setSmsPopup(null);
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Simulated Mobile SMS Notification Toast when OTP is dispatched */}
      {smsPopup && (
        <div className="sms-toast">
          <div className="sms-toast-header">
            <span>📱 INCOMING SMS • +91 {smsPopup.mobile}</span>
            <button
              type="button"
              className="sms-close-btn"
              onClick={() => setSmsPopup(null)}
            >
              ✕
            </button>
          </div>
          <div className="sms-toast-body">{smsPopup.text}</div>
          <div className="sms-toast-actions">
            <span className="pill emerald">OTP: {smsPopup.otp}</span>
            {mode === "mobile_otp" && (
              <button
                type="button"
                className="small-btn"
                onClick={() => {
                  const chars = String(smsPopup.otp).split("");
                  setOtpDigits(chars);
                  verifyOtpCode(String(smsPopup.otp));
                }}
              >
                ⚡ Tap to Auto-Fill & Login
              </button>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                className="small-btn"
                onClick={() => setResetOtp(String(smsPopup.otp))}
              >
                ⚡ Fill Reset OTP
              </button>
            )}
          </div>
        </div>
      )}

      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-title" style={{ fontSize: "1.65rem" }}>
            CALOOPS v2.0
          </div>
          <p className="brand-sub">
            Full-Stack MERN Logic & Loops Scientific Calculator Portal
          </p>
        </div>

        {/* Mode Switcher Tabs: Login | Mobile No (OTP) | Register | Forgot Password */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            🔐 Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "mobile_otp" ? "active" : ""}`}
            onClick={() => switchMode("mobile_otp")}
          >
            📱 Mobile No (OTP)
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            📝 Register
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "forgot" ? "active" : ""}`}
            onClick={() => switchMode("forgot")}
          >
            🔑 Forgot Password
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {info && <div className="info-banner">{info}</div>}

        {/* 1. PASSWORD LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label>Username, Email, or Mobile No</label>
              <input
                className="input-control"
                placeholder="e.g. Nikhil, nikhil@caloops.dev, or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-links-row">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  if (/^\+?\d[\d\s-]{7,}$/.test(identifier.trim())) {
                    setMobileNo(identifier.trim());
                  }
                  switchMode("mobile_otp");
                }}
              >
                📱 Login with Mobile No & OTP instead
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode("forgot")}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="run-btn" disabled={loading}>
              {loading ? "Signing In..." : "Login to Project"}
            </button>

            <div className="demo-credentials-box">
              <span>Demo Account:</span> Username <code>Nikhil</code> | Mobile{" "}
              <code>9876543210</code> | Password <code>password123</code>
            </div>
          </form>
        )}

        {/* 2. MOBILE NO + OTP LOGIN FORM */}
        {mode === "mobile_otp" && (
          <div>
            <form onSubmit={handleSendMobileOtp}>
              <div className="form-group">
                <label>Mobile Number (OTP will be sent to this number)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="tel"
                    className="input-control"
                    placeholder="Enter 10-digit Mobile No (e.g. 9876543210)"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="run-btn"
                    style={{ width: "auto", whiteSpace: "nowrap", padding: "0 1.1rem" }}
                    disabled={loading}
                  >
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>
            </form>

            {otpSent && (
              <form onSubmit={handleOtpSubmit} style={{ marginTop: "1.1rem" }}>
                <div className="form-group">
                  <label>
                    Enter 6-Digit OTP sent to <strong>{mobileNo}</strong> (auto-logins on 6th digit)
                  </label>
                  <div className="otp-box-row">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-input"
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className="run-btn" disabled={loading}>
                  {loading ? "Verifying OTP..." : "✓ Verify OTP & Login to Project"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="input-control"
                placeholder="Choose a username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-control"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                className="input-control"
                placeholder="10-digit mobile number (e.g. 9876543210)"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="Create a strong password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="run-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register & Login to Project"}
            </button>
          </form>
        )}

        {/* 4. FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <div>
            <form onSubmit={handleSendResetOtp}>
              <div className="form-group">
                <label>Enter Your Username, Email, or Mobile No</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    className="input-control"
                    placeholder="Username, Email, or Mobile No"
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="run-btn"
                    style={{ width: "auto", whiteSpace: "nowrap", padding: "0 1rem" }}
                    disabled={loading}
                  >
                    Send Reset OTP
                  </button>
                </div>
              </div>
            </form>

            {resetOtpSent && (
              <form onSubmit={handleResetPassword} style={{ marginTop: "1rem" }}>
                <div className="form-group">
                  <label>6-Digit Reset OTP</label>
                  <input
                    className="input-control"
                    placeholder="Enter 6-digit OTP"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="input-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="run-btn" disabled={loading}>
                  {loading ? "Updating Password..." : "Reset Password & Login"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
