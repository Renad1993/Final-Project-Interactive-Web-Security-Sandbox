
const TRUSTED_HOST = "techstore.example";

const cache = new Map();

let mode = "vulnerable";
let selectedHost = "attacker.example";


// Get HTML elements

const vulnerableBtn = document.getElementById("vulnerableBtn");
const fixedBtn = document.getElementById("fixedBtn");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");

const payloadCode = document.getElementById("payloadCode");
const domainBanner = document.getElementById("domainBanner");
const resultMessage = document.getElementById("resultMessage");

const payloadButtons = document.querySelectorAll(".payload-btn");


// Update Vulnerable / Fixed mode

function updateMode() {

    const isVulnerable = mode === "vulnerable";

    vulnerableBtn.classList.toggle("active", isVulnerable);
    fixedBtn.classList.toggle("active", !isVulnerable);

    statusBox.className = isVulnerable
        ? "status vulnerable-status"
        : "status fixed-status";

    statusTitle.textContent = isVulnerable
        ? "VULNERABLE MODE"
        : "FIXED MODE";

    statusText.textContent = isVulnerable
        ? "The application trusts an untrusted host value."
        : "The application uses a trusted host and ignores the untrusted value.";

    cache.clear();

    resetPreview();
}


// Reset website preview

function resetPreview() {

    domainBanner.textContent =
        "Official Website: " + TRUSTED_HOST;

    domainBanner.classList.remove("poisoned");

    resultMessage.textContent = "Waiting for payload...";
}


// Vulnerable version

function vulnerableRequest(host) {

    // The cache uses the same key for every host.
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


// Fixed version

function fixedRequest() {

    // The application uses its trusted host.
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


// Run selected payload

function runPayload() {

    let response;

    if (mode === "vulnerable") {

        response = vulnerableRequest(selectedHost);

    } else {

        response = fixedRequest();

    }


    if (response.poisoned) {

        domainBanner.textContent =
            "Unexpected Website Host: " + response.host;

        domainBanner.classList.add("poisoned");

        resultMessage.textContent =
            "Cache Poisoned! The manipulated response was stored.";

    } else {

        domainBanner.textContent =
            "Official Website: " + TRUSTED_HOST;

        domainBanner.classList.remove("poisoned");

        resultMessage.textContent =
            mode === "fixed"
                ? "Blocked! The untrusted host was ignored."
                : "The official response was returned.";

    }

}


// Simulate another visitor

function simulateVisitor() {

    const cacheKey = mode === "vulnerable"
        ? "/home"
        : "/home|" + TRUSTED_HOST;


    if (!cache.has(cacheKey)) {

        resultMessage.textContent =
            "No cached response yet. Run a payload first.";

        return;
    }


    const response = cache.get(cacheKey);


    if (response.poisoned) {

        domainBanner.textContent =
            "Unexpected Website Host: " + response.host;

        domainBanner.classList.add("poisoned");

        resultMessage.textContent =
            "Another visitor received the manipulated cached response!";

    } else {

        domainBanner.textContent =
            "Official Website: " + TRUSTED_HOST;

        domainBanner.classList.remove("poisoned");

        resultMessage.textContent =
            "Another visitor received the safe cached response.";

    }

}


// Switch to Vulnerable mode

vulnerableBtn.addEventListener("click", () => {

    mode = "vulnerable";

    updateMode();

});


// Switch to Fixed mode

fixedBtn.addEventListener("click", () => {

    mode = "fixed";

    updateMode();

});


// Select payload

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


// Run payload button

document.getElementById("runBtn").addEventListener(
    "click",
    runPayload
);


// Another visitor button

document.getElementById("visitorBtn").addEventListener(
    "click",
    simulateVisitor
);


// Reset cache button

document.getElementById("resetBtn").addEventListener("click", () => {

    cache.clear();

    resetPreview();

});


// Initial page setup

updateMode();

payloadButtons[0].classList.add("selected");
