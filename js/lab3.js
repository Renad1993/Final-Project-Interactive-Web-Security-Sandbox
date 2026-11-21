
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


// Display a message safely
function setMessage(element, title, message) {
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    element.replaceChildren(status, paragraph);
}


// Reset Website Preview
function resetPreview() {
    const title = document.createElement("h3");
    title.textContent = "TechStore";

    const paragraph = document.createElement("p");
    paragraph.textContent = `Official Website: ${TRUSTED_HOST}`;

    domainBanner.replaceChildren(title, paragraph);
    domainBanner.classList.remove("poisoned");

    setMessage(
        resultMessage,
        "WAITING",
        "Run a payload to see the result."
    );
}


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
    const cacheKey = "/home";

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
        const title = document.createElement("h3");
        title.textContent = "Unexpected Website!";

        const hostParagraph = document.createElement("p");
        hostParagraph.textContent = `Host: ${response.host}`;

        const messageParagraph = document.createElement("p");
        messageParagraph.textContent = "Cached content was manipulated.";

        domainBanner.replaceChildren(
            title,
            hostParagraph,
            messageParagraph
        );

        domainBanner.classList.add("poisoned");

        setMessage(
            resultMessage,
            "CACHE POISONED!",
            "The manipulated response was stored in the cache."
        );

    } else {
        resetWebsitePreview();

        if (mode === "fixed") {
            setMessage(
                resultMessage,
                "BLOCKED!",
                "The untrusted host was ignored. The official website is safe."
            );
        } else {
            setMessage(
                resultMessage,
                "SAFE RESPONSE",
                "The official website was returned."
            );
        }
    }
}


// Show Official Website
function resetWebsitePreview() {
    const title = document.createElement("h3");
    title.textContent = "TechStore";

    const paragraph = document.createElement("p");
    paragraph.textContent = `Official Website: ${TRUSTED_HOST}`;

    domainBanner.replaceChildren(title, paragraph);
    domainBanner.classList.remove("poisoned");
}


// Run Selected Payload
function runPayload() {
    cache.clear();

    const response = mode === "vulnerable"
        ? vulnerableRequest(selectedHost)
        : fixedRequest();

    showResult(response);
}


// Test Another Visitor
function simulateVisitor() {
    const cacheKey = "/home";

    if (!cache.has(cacheKey)) {
        setMessage(
            resultMessage,
            "NO CACHE",
            "Run a payload first."
        );

        return;
    }

    const response = cache.get(cacheKey);

    showResult(response);

    if (response.poisoned) {
        setMessage(
            resultMessage,
            "ANOTHER VISITOR AFFECTED!",
            "Another visitor received the manipulated cached response."
        );
    } else {
        setMessage(
            resultMessage,
            "SAFE VISITOR",
            "Another visitor received the official cached website."
        );
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
