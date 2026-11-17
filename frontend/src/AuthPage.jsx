import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "./apiClient.js";

export default function AuthPage({ onAuthSuccess }) {
  // Modes: 'login' | 'email_otp' | 'mobile_otp' | 'register' | 'forgot'
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

  // Email OTP fields
  const [emailAddr, setEmailAddr] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpDigits, setEmailOtpDigits] = useState(["", "", "", "", "", ""]);
  const [emailPopup, setEmailPopup] = useState(null);

  // Forgot Password via Registered Email fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmailDispatched, setResetEmailDispatched] = useState(false);
  const [resetEmailLinkClicked, setResetEmailLinkClicked] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Feedback state
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef([]);
  const emailOtpRefs = useRef([]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setInfo("");
  };

  // Handle Magic Links clicked from Registered Email (?action=email_login or ?action=reset_password)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const emailParam = params.get("email");
    const otpParam = params.get("otp");

    if (action === "email_login" && emailParam && otpParam) {
      setMode("email_otp");
      setEmailAddr(emailParam);
      setEmailOtpSent(true);
      setEmailOtpDigits(String(otpParam).slice(0, 6).split(""));
      verifyEmailOtpCode(emailParam, otpParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (action === "reset_password" && emailParam && otpParam) {
      setMode("forgot");
      setForgotEmail(emailParam);
      setResetOtp(otpParam);
      setResetEmailDispatched(true);
      setResetEmailLinkClicked(true);
      setInfo(
        `Email link verified for ${emailParam}! Please create and update your new password below.`
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 1. Standard Login (Username / Email / Mobile + Password)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
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
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          mobile: regMobile,
          password: regPassword,
        }),
      });
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Send OTP to Registered Email ID
  const handleSendEmailOtp = async (e, overrideEmail) => {
    if (e) e.preventDefault();
    const targetEmail = (overrideEmail ?? emailAddr).trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid registered Email ID.");
      return;
    }
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const data = await apiRequest("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, baseUrl }),
      });
      setEmailAddr(data.email);
      setEmailOtpSent(true);
      setEmailOtpDigits(["", "", "", "", "", ""]);
      setInfo(
        `OTP sent to your registered email (${data.email}). Click the OTP inside the email message above or enter it below to login!`
      );
      if (data.emailReceipt) {
        setEmailPopup({
          type: "login",
          to: data.email,
          subject: data.emailReceipt.subject,
          otp: data.emailReceipt.otpPreview,
          magicLink: data.emailReceipt.magicLink,
          body: data.emailReceipt.textBody,
        });
      }
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtpCode = async (targetEmail, codeStr) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail || emailAddr, otp: codeStr }),
      });
      setEmailPopup(null);
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpSubmit = (e) => {
    e.preventDefault();
    const code = emailOtpDigits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the Email OTP.");
      return;
    }
    verifyEmailOtpCode(emailAddr, code);
  };

  const handleEmailOtpDigitChange = (idx, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...emailOtpDigits];
    next[idx] = digit;
    setEmailOtpDigits(next);

    if (digit && idx < 5) {
      emailOtpRefs.current[idx + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d !== "")) {
      verifyEmailOtpCode(emailAddr, fullCode);
    }
  };

  const handleEmailOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !emailOtpDigits[idx] && idx > 0) {
      emailOtpRefs.current[idx - 1]?.focus();
    }
  };

  // 4. Send OTP to Entered Mobile Number
  const handleSendMobileOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNo }),
      });
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

  const verifyOtpCode = async (codeStr) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNo, otp: codeStr }),
      });
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

  // 5. Forgot Password via Registered Email Flow
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotEmail, baseUrl }),
      });
      setResetEmailDispatched(true);
      setResetEmailLinkClicked(false);
      setInfo(
        `Password reset message sent to your registered email (${data.email}). Click the email message above to create & update your new password!`
      );
      if (data.emailReceipt) {
        setEmailPopup({
          type: "reset_password",
          to: data.email,
          subject: data.emailReceipt.subject,
          otp: data.emailReceipt.otpPreview,
          magicLink: data.emailReceipt.magicLink,
          body: data.emailReceipt.textBody,
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
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotEmail,
          otp: resetOtp,
          newPassword,
        }),
      });
      setEmailPopup(null);
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
      {/* Interactive Registered Email Inbox Notification Message */}
      {emailPopup && (
        <div className="email-inbox-toast">
          <div className="email-toast-header">
            <span>📧 REGISTERED EMAIL INBOX • {emailPopup.to}</span>
            <button
              type="button"
              className="sms-close-btn"
              onClick={() => setEmailPopup(null)}
            >
              ✕
            </button>
          </div>
          <div className="email-toast-subject">{emailPopup.subject}</div>
          <div className="email-toast-body">{emailPopup.body}</div>

          {emailPopup.type === "login" ? (
            <div className="email-toast-actions">
              <button
                type="button"
                className="run-btn"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.85rem",
                }}
                onClick={() => {
                  const chars = String(emailPopup.otp).split("");
                  setEmailOtpDigits(chars);
                  verifyEmailOtpCode(emailPopup.to, String(emailPopup.otp));
                }}
              >
                ⚡ Click Email OTP ({emailPopup.otp}) to Login Now
              </button>
            </div>
          ) : (
            <div className="email-toast-actions">
              <button
                type="button"
                className="run-btn"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.85rem",
                }}
                onClick={() => {
                  setMode("forgot");
                  setResetOtp(String(emailPopup.otp));
                  setResetEmailLinkClicked(true);
                  setEmailPopup(null);
                  setInfo(
                    `Email message verified for ${emailPopup.to}! Create and update your new password below.`
                  );
                }}
              >
                🔑 Click Email Message to Create & Update New Password
              </button>
            </div>
          )}
        </div>
      )}

      {/* Simulated Mobile SMS Notification Toast when Mobile OTP is dispatched */}
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
          </div>
        </div>
      )}

      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-title" style={{ fontSize: "1.65rem" }}>
            CALOOPS v2.0
          </div>
          <p className="brand-sub">
            Daily Mobile Calculator & Loop Lab • Secure Email & Mobile OTP Login
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            🔐 Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "email_otp" ? "active" : ""}`}
            onClick={() => switchMode("email_otp")}
          >
            📧 Email OTP
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "mobile_otp" ? "active" : ""}`}
            onClick={() => switchMode("mobile_otp")}
          >
            📱 Mobile OTP
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
            style={{ gridColumn: "span 2" }}
            onClick={() => switchMode("forgot")}
          >
            🔑 Forgot / Update Password
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {info && <div className="info-banner">{info}</div>}

        {/* 1. PASSWORD LOGIN FORM (with instant Email OTP & Mobile OTP shortcuts) */}
        {mode === "login" && (
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label>Email ID, Username, or Mobile No</label>
              <input
                className="input-control"
                placeholder="e.g. nikhil@caloops.dev, Nikhil, or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {identifier.includes("@") && (
              <div style={{ marginBottom: "0.85rem" }}>
                <button
                  type="button"
                  className="small-btn"
                  style={{
                    width: "100%",
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                    padding: "0.5rem",
                    fontWeight: 700,
                  }}
                  onClick={() => {
                    const target = identifier.trim();
                    setEmailAddr(target);
                    switchMode("email_otp");
                    handleSendEmailOtp(null, target);
                  }}
                >
                  📧 Send Login OTP to Registered Email ({identifier.trim()})
                </button>
              </div>
            )}

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
                  if (identifier.includes("@")) setEmailAddr(identifier.trim());
                  switchMode("email_otp");
                }}
              >
                📧 Login with Email OTP
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  if (identifier.includes("@")) setForgotEmail(identifier.trim());
                  switchMode("forgot");
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="run-btn" disabled={loading}>
              {loading ? "Signing In..." : "Login to Project"}
            </button>

            <div className="demo-credentials-box">
              <span>Demo Account:</span> Email <code>nikhil@caloops.dev</code> | Username{" "}
              <code>Nikhil</code> | Password <code>password123</code>
            </div>
          </form>
        )}

        {/* 2. REGISTERED EMAIL ID + OTP LOGIN FORM */}
        {mode === "email_otp" && (
          <div>
            <form onSubmit={(e) => handleSendEmailOtp(e)}>
              <div className="form-group">
                <label>Registered Email ID (OTP will be sent to this Email)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="Enter Email ID (e.g. nikhil@caloops.dev)"
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="run-btn"
                    style={{ width: "auto", whiteSpace: "nowrap", padding: "0 1.1rem" }}
                    disabled={loading}
                  >
                    {emailOtpSent ? "Resend OTP" : "Send Email OTP"}
                  </button>
                </div>
              </div>
            </form>

            {emailOtpSent && (
              <form onSubmit={handleEmailOtpSubmit} style={{ marginTop: "1.1rem" }}>
                <div className="form-group">
                  <label>
                    Click the OTP in your Email above OR type the 6-Digit Email OTP sent to{" "}
                    <strong>{emailAddr}</strong>
                  </label>
                  <div className="otp-box-row">
                    {emailOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (emailOtpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-input"
                        value={digit}
                        onChange={(e) => handleEmailOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className="run-btn" disabled={loading}>
                  {loading ? "Verifying Email OTP..." : "✓ Verify Email OTP & Login"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. MOBILE NO + OTP LOGIN FORM */}
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

        {/* 4. REGISTER FORM */}
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
              <label>Registered Email ID</label>
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

        {/* 5. FORGOT PASSWORD VIA REGISTERED EMAIL MESSAGE */}
        {mode === "forgot" && (
          <div>
            <form onSubmit={handleSendResetEmail}>
              <div className="form-group">
                <label>Enter Your Registered Email ID (to receive Create/Update Password link)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    className="input-control"
                    placeholder="Enter Registered Email ID (e.g. nikhil@caloops.dev)"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="run-btn"
                    style={{ width: "auto", whiteSpace: "nowrap", padding: "0 1rem" }}
                    disabled={loading}
                  >
                    {resetEmailDispatched ? "Resend Email" : "Send Reset Email"}
                  </button>
                </div>
              </div>
            </form>

            {resetEmailDispatched && !resetEmailLinkClicked && (
              <div className="result-box" style={{ marginTop: "0.9rem", fontSize: "0.84rem" }}>
                <p style={{ color: "#cbd5e1", marginBottom: "0.65rem" }}>
                  📩 We sent a password reset message to <strong>{forgotEmail}</strong>. Click{" "}
                  <strong>"🔑 Click Email Message to Create & Update New Password"</strong> in the email banner at the top of the screen!
                </p>
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => setResetEmailLinkClicked(true)}
                >
                  Or Enter Reset Code Manually
                </button>
              </div>
            )}

            {resetEmailLinkClicked && (
              <form onSubmit={handleResetPassword} style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    padding: "0.65rem 0.85rem",
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid var(--accent)",
                    borderRadius: "8px",
                    marginBottom: "0.85rem",
                    fontSize: "0.83rem",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  ✓ Creating & Updating New Password for: {forgotEmail}
                </div>

                <div className="form-group">
                  <label>Create New Password</label>
                  <input
                    type="password"
                    className="input-control"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="input-control"
                    placeholder="Re-enter your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Verification OTP Code (Auto-verified from Email Link)</label>
                  <input
                    className="input-control"
                    placeholder="6-digit Email OTP"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="run-btn" disabled={loading}>
                  {loading
                    ? "Updating Password..."
                    : "✓ Create & Update New Password & Login"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
