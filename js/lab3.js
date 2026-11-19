
const TRUSTED_HOST = "techstore.example";

const cache = new Map();

let mode = "vulnerable";
let selectedHost = "attacker.example";

// HTML Elements
const vulnerableBtn = document.getElementById("vulnerableBtn");
const fixedBtn = document.getElementById("fixedBtn");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");

const payloadCode = document.getElementById("payloadCode");
const domainBanner = document.getElementById("domainBanner");
const resultMessage = document.getElementById("resultMessage");

const payloadButtons = document.querySelectorAll(".pl[data-host]");

const runBtn = document.getElementById("runBtn");
const visitorBtn = document.getElementById("visitorBtn");
const resetBtn = document.getElementById("resetBtn");


// Update Mode
function updateMode() {

    const isVulnerable = mode === "vulnerable";

    vulnerableBtn.classList.toggle("active", isVulnerable);
    vulnerableBtn.classList.toggle("on", isVulnerable);

    fixedBtn.classList.toggle("active", !isVulnerable);
    fixedBtn.classList.toggle("on", !isVulnerable);

    statusBox.className = isVulnerable
        ? "out mode-status vulnerable-status"
        : "out mode-status fixed-status";

    statusTitle.textContent = isVulnerable
        ? "VULNERABLE MODE"
        : "FIXED MODE";

    statusText.textContent = isVulnerable
        ? "The application trusts an untrusted host value."
        : "The application uses a trusted host and ignores the untrusted value.";

    cache.clear();

    resetPreview();
}


// Reset Preview
function resetPreview() {

    domainBanner.innerHTML = `
        <h3>TechStore</h3>
        <p>Official Website: ${TRUSTED_HOST}</p>
    `;

    domainBanner.classList.remove("poisoned");

    resultMessage.innerHTML = `
        <span class="status">WAITING</span>
        <p>Run a payload to see the result.</p>
    `;
}


// Vulnerable Request
function vulnerableRequest(host) {

    const cacheKey = "/home";

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = {
        host: host,
        poisoned: host !== TRUSTED_HOST
    };

    cache.set(cacheKey, response);

    return response;
}


// Fixed Request
function fixedRequest() {

    const safeHost = TRUSTED_HOST;

    const cacheKey = "/home|" + safeHost;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = {
        host: safeHost,
        poisoned: false
    };

    cache.set(cacheKey, response);

    return response;
}


// Display Result
function showResult(response) {

    if (response.poisoned) {

        domainBanner.innerHTML = `
            <h3>Unexpected Website!</h3>
            <p>Host: ${response.host}</p>
            <p>Cached content was manipulated.</p>
        `;

        domainBanner.classList.add("poisoned");

        resultMessage.innerHTML = `
            <span class="status">CACHE POISONED!</span>
            <p>The manipulated response was stored in the cache.</p>
        `;

    } else {

        domainBanner.innerHTML = `
            <h3>TechStore</h3>
            <p>Official Website: ${TRUSTED_HOST}</p>
        `;

        domainBanner.classList.remove("poisoned");

        resultMessage.innerHTML = mode === "fixed"
            ? `
                <span class="status">BLOCKED!</span>
                <p>The untrusted host was ignored. The official website is safe.</p>
            `
            : `
                <span class="status">SAFE RESPONSE</span>
                <p>The official website was returned.</p>
            `;
    }
}


// Run Selected Payload
function runPayload() {

    // Start a fresh test for every selected payload
    cache.clear();

    const response = mode === "vulnerable"
        ? vulnerableRequest(selectedHost)
        : fixedRequest();

    showResult(response);
}


// Test Another Visitor
function simulateVisitor() {

    const cacheKey = mode === "vulnerable"
        ? "/home"
        : "/home|" + TRUSTED_HOST;

    if (!cache.has(cacheKey)) {

        resultMessage.innerHTML = `
            <span class="status">NO CACHE</span>
            <p>Run a payload first.</p>
        `;

        return;
    }

    const response = cache.get(cacheKey);

    showResult(response);

    if (response.poisoned) {

        resultMessage.innerHTML = `
            <span class="status">ANOTHER VISITOR AFFECTED!</span>
            <p>Another visitor received the manipulated cached response.</p>
        `;

    } else {

        resultMessage.innerHTML = `
            <span class="status">SAFE VISITOR</span>
            <p>Another visitor received the official cached website.</p>
        `;
    }
}


// Vulnerable Button
vulnerableBtn.addEventListener("click", () => {

    mode = "vulnerable";

    updateMode();
});


// Fixed Button
fixedBtn.addEventListener("click", () => {

    mode = "fixed";

    updateMode();
});


// Select Payload
payloadButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedHost = button.dataset.host;

        payloadCode.textContent = selectedHost;

        payloadButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

    });
});


// Run Button
runBtn.addEventListener("click", runPayload);


// Another Visitor Button
visitorBtn.addEventListener("click", simulateVisitor);


// Reset Button
resetBtn.addEventListener("click", () => {

    cache.clear();

    resetPreview();
});


// Initial Setup
payloadCode.textContent = selectedHost;

updateMode();

payloadButtons.forEach(button => {
    button.classList.toggle(
        "selected",
        button.dataset.host === selectedHost
    );
});
