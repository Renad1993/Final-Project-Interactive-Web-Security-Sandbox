
"use strict";

// Lab 2: Weak Random Token Generation
// The code shown on the page is the code that runs:
// it is read with fn.toString().
// A trailing "//!" marks the highlighted line
// (the marker is hidden on the page).

// ========================================
// 1. Vulnerable and Fixed Generators
// ========================================

// Vulnerable: Linear Congruential Generator (LCG)
// The token directly reveals the internal state.

var weakState = 123456789;

function generateVulnerableToken() {
  weakState = (
    Math.imul(weakState, 1664525) + 1013904223
  ) >>> 0; //!

  return weakState.toString(16).padStart(8, "0");
}

// Fixed: Cryptographically Secure PRNG (CSPRNG)

function generateFixedToken() {
  var bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes); //!

  return Array.from(bytes, function (byte) {
    return byte.toString(16).padStart(2, "0");
  }).join("");
}

// ========================================
// 2. Page Logic
// ========================================

var mode = "vulnerable";
var outEl = document.getElementById("out");

var attackerToken = null;
var victimToken = null;
var predictedToken = null;
var currentStep = 0;

// Escape text before displaying code.

function esc(s) {
  return s.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;");
}

// Show the actual function source code.
// Highlight the line marked with "//!".

function showCode(el, fn) {
  el.innerHTML = fn.toString().split("\n").map(function (line) {
    var hl = line.indexOf("//!") > -1;

    return "<div" + (hl ? ' class="hl"' : "") + ">" +
      esc(line.replace(/\s*\/\/!/, "")) + "</div>";
  }).join("");
}

// Reset the result area.

function resetOutput() {
  outEl.className = "out";
  outEl.innerHTML =
    "<p>Press Get my token to start the simulation.</p>";
}

// Reset all simulation values.

function resetSimulation() {
  weakState = 123456789;

  attackerToken = null;
  victimToken = null;
  predictedToken = null;

  currentStep = 0;

  resetOutput();
}

// ========================================
// 3. Switch Between Vulnerable and Fixed
// ========================================

function setMode(m) {
  mode = m;

  document.querySelectorAll(".switch button.v")
    .forEach(function (b) {
      b.classList.toggle("on", m === "vulnerable");
    });

  document.querySelectorAll(".switch button.f")
    .forEach(function (b) {
      b.classList.toggle("on", m === "fixed");
    });

  resetSimulation();
}

// ========================================
// 4. Predict the Next Weak Token
// ========================================

// The attacker recovers the state from
// the observed token and applies the
// known LCG formula.

function predictNextToken(token) {
  var recoveredState = parseInt(token, 16);

  var nextState = (
    Math.imul(recoveredState, 1664525) + 1013904223
  ) >>> 0;

  return nextState.toString(16).padStart(8, "0");
}

// ========================================
// 5. Display Results
// ========================================

// Use textContent for dynamic token values
// to avoid interpreting them as HTML.

function showResult(status, message, tokens) {
  outEl.className = "out " +
    (status === "EXPLOITED" ? "bad" : "ok");

  outEl.innerHTML = "";

  var statusEl = document.createElement("span");
  statusEl.className = "status";
  statusEl.textContent = status;

  var messageEl = document.createElement("p");
  messageEl.textContent = message;

  outEl.appendChild(statusEl);
  outEl.appendChild(messageEl);

  tokens.forEach(function (item) {
    var p = document.createElement("p");
    var label = document.createElement("strong");
    var code = document.createElement("code");

    label.textContent = item.label + ": ";
    code.textContent = item.value;

    p.appendChild(label);
    p.appendChild(code);

    outEl.appendChild(p);
  });
}

// ========================================
// 6. Step 1: Get My Token
// ========================================

function getMyToken() {
  resetSimulation();

  var generate = mode === "vulnerable"
    ? generateVulnerableToken
    : generateFixedToken;

  // The attacker receives their own token.
  attackerToken = generate();

  // The victim's token is generated next,
  // but remains hidden from the attacker.
  victimToken = generate();

  currentStep = 1;

  showResult(
    "TOKEN GENERATED",
    "The attacker received their own reset token. " +
    "The victim's token was generated next but is hidden.",
    [
      { label: "Attacker Token", value: attackerToken },
      { label: "Victim Token", value: "HIDDEN" }
    ]
  );
}

// ========================================
// 7. Step 2: Predict Victim's Token
// ========================================

function predictVictimToken() {
  if (currentStep !== 1) {
    showResult(
      "NOT READY",
      "Complete Step 1 first.",
      []
    );
    return;
  }

  if (mode === "vulnerable") {

    // The weak token exposes the state.
    // The attacker calculates the next token.
    predictedToken = predictNextToken(attackerToken);

  } else {

    // Try the same old LCG prediction method
    // against the first 32 bits of the secure
    // token. This is only a demonstration:
    // it cannot predict the secure 128-bit token.

    var sample = attackerToken.slice(0, 8);
    predictedToken = predictNextToken(sample);
  }

  currentStep = 2;

  showResult(
    "PREDICTION READY",
    "The attacker used the known LCG formula " +
    "to predict the victim's reset token.",
    [
      { label: "Attacker Token", value: attackerToken },
      { label: "Predicted Token", value: predictedToken },
      { label: "Victim Token", value: "HIDDEN" }
    ]
  );
}

// ========================================
// 8. Step 3: Use the Prediction
// ========================================

function usePrediction() {
  if (currentStep !== 2) {
    showResult(
      "NOT READY",
      "Complete Steps 1 and 2 first.",
      []
    );
    return;
  }

  var success = predictedToken === victimToken;

  currentStep = 3;

  if (success) {
    showResult(
      "EXPLOITED",
      "The predicted token matches the victim's token. " +
      "The simulated password reset is accepted.",
      [
        { label: "Predicted Token", value: predictedToken },
        { label: "Actual Victim Token", value: victimToken },
        { label: "Password Reset", value: "ACCEPTED" }
      ]
    );

  } else {
    showResult(
      "BLOCKED",
      "The predicted token does not match the victim's token. " +
      "The simulated password reset is rejected.",
      [
        { label: "Predicted Token", value: predictedToken },
        { label: "Actual Victim Token", value: victimToken },
        { label: "Password Reset", value: "REJECTED" }
      ]
    );
  }
}

// ========================================
// 9. Button Events
// ========================================

// Vulnerable / Fixed switches

document.querySelectorAll(".switch button.v")
  .forEach(function (b) {
    b.onclick = function () {
      setMode("vulnerable");
    };
  });

document.querySelectorAll(".switch button.f")
  .forEach(function (b) {
    b.onclick = function () {
      setMode("fixed");
    };
  });

// Simulation buttons

document.getElementById("get-token").onclick =
  getMyToken;

document.getElementById("predict-token").onclick =
  predictVictimToken;

document.getElementById("use-token").onclick =
  usePrediction;

document.getElementById("reset-lab").onclick =
  resetSimulation;

// ========================================
// 10. Display the Real Generator Code
// ========================================

showCode(
  document.getElementById("code-vuln"),
  generateVulnerableToken
);

showCode(
  document.getElementById("code-fix"),
  generateFixedToken
);

// Initial state

setMode("vulnerable");
