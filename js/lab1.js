// Lab 1: Prototype pollution
// The code shown on the page is the code that runs: it is read with fn.toString().
// A trailing "//!" marks the highlighted line (the marker is hidden on the page).

function mergeVulnerable(target, src) {
  for (const key in src) {
    if (typeof src[key] === "object" && src[key] !== null) {
      mergeVulnerable(target[key] ||= {}, src[key]); //!
    } else {
      target[key] = src[key];
    }
  }
  return target;
}

function mergeFixed(target, src) {
  for (const key in src) {
    if (key === "__proto__" || key === "constructor") continue; //!
    if (typeof src[key] === "object" && src[key] !== null) {
      mergeFixed(target[key] ||= {}, src[key]);
    } else {
      target[key] = src[key];
    }
  }
  return target;
}

// ---------- page logic ----------
var mode = "vulnerable";
var outEl = document.getElementById("out");

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

function showCode(el, fn) {
  el.innerHTML = fn.toString().split("\n").map(function (line) {
    var hl = line.indexOf("//!") > -1;
    return "<div" + (hl ? ' class="hl"' : "") + ">" + esc(line.replace(/\s*\/\/!/, "")) + "</div>";
  }).join("");
}

function resetOutput() {
  outEl.className = "out";
  outEl.innerHTML = "<p>Press a payload. The result appears here.</p>";
}

function setMode(m) {
  mode = m;
  document.querySelectorAll(".switch button.v").forEach(function (b) { b.classList.toggle("on", m === "vulnerable"); });
  document.querySelectorAll(".switch button.f").forEach(function (b) { b.classList.toggle("on", m === "fixed"); });
  resetOutput();
}

function run(json) {
  var fn = mode === "vulnerable" ? mergeVulnerable : mergeFixed;
  var safeInput = json.indexOf("theme") > -1;
  var polluted = false;
  try {
    fn({}, JSON.parse(json));
    polluted = ({}).isAdmin === true;     // does a brand-new object now look like an admin?
  } finally {
    delete Object.prototype.isAdmin;      // always clean up so the page itself stays safe
  }

  var status, text;
  if (polluted) {
    status = "EXPLOITED";
    text = "A brand-new guest account now reads <code>isAdmin = true</code>. The admin panel would open for everyone.";
  } else if (safeInput) {
    status = "NORMAL";
    text = "Settings saved. Nothing else changed.";
  } else {
    status = "BLOCKED";
    text = "The dangerous key was skipped. Other users are unaffected.";
  }
  outEl.className = "out " + (polluted ? "bad" : "ok");
  outEl.innerHTML = '<span class="status">' + status + "</span><p>" + text + "</p>" +
    '<p>Check: <code>({name:"guest"}).isAdmin</code> → <code>' + (polluted ? "true" : "undefined") + "</code></p>";
}

document.querySelectorAll(".switch button.v").forEach(function (b) { b.onclick = function () { setMode("vulnerable"); }; });
document.querySelectorAll(".switch button.f").forEach(function (b) { b.onclick = function () { setMode("fixed"); }; });
document.querySelectorAll(".pl").forEach(function (b) { b.onclick = function () { run(b.dataset.j); }; });

showCode(document.getElementById("code-vuln"), mergeVulnerable);
showCode(document.getElementById("code-fix"), mergeFixed);
resetOutput();
