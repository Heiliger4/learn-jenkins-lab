const container = document.getElementById("commits");
const statusEl = document.getElementById("status");
let currentCommits = [];
let firstLoad = true;
let lastStatusText = "";
let lastStatusError = false;
const MAX_COMMITS = 30;

function userIsNearBottom() {
    return container.scrollHeight - container.scrollTop - container.clientHeight < 120;
}

function appendCommitItem(commit) {
    const item = document.createElement("div");
    item.className = "commit";
    item.innerHTML = `
        <h3>${commit.message}</h3>
        <p>${commit.time}</p>
    `;
    container.appendChild(item);
}

function renderCommits(commits) {
    const visibleCommits = commits.slice(-MAX_COMMITS);
    const scrollToBottom = firstLoad || userIsNearBottom();

    if (visibleCommits.length === 0) {
        if (currentCommits.length !== 0) {
            container.innerHTML = "<p class='empty'>No commit history available.</p>";
        }
        currentCommits = [];
    } else if (visibleCommits.length === currentCommits.length) {
        const same = visibleCommits.every((commit, index) =>
            commit.message === currentCommits[index]?.message && commit.time === currentCommits[index]?.time
        );
        if (!same) {
            container.innerHTML = "";
            visibleCommits.forEach(appendCommitItem);
            currentCommits = visibleCommits;
        }
    } else if (visibleCommits.length > currentCommits.length) {
        if (currentCommits.length === 0) {
            container.innerHTML = "";
            visibleCommits.forEach(appendCommitItem);
        } else {
            const newCommits = visibleCommits.slice(currentCommits.length);
            newCommits.forEach(appendCommitItem);
        }
        currentCommits = visibleCommits;
    } else {
        container.innerHTML = "";
        visibleCommits.forEach(appendCommitItem);
        currentCommits = visibleCommits;
    }

    if (scrollToBottom) {
        container.scrollTop = container.scrollHeight;
    }

    firstLoad = false;
}

function setStatus(message, isError = false) {
    if (!statusEl) return;
    if (message === lastStatusText && isError === lastStatusError) return;
    statusEl.innerHTML = message;
    statusEl.classList.toggle("status-error", isError);
    lastStatusText = message;
    lastStatusError = isError;
}

async function loadCommits() {
    if (!statusEl || !container) return;

    const isFileProtocol = window.location.protocol === "file:";
    const jsonUrl = isFileProtocol
        ? "data/commits.json?t=" + Date.now()
        : `${window.location.origin}/data/commits.json?t=${Date.now()}`;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`Failed to load commits: ${response.status} ${response.statusText}`);
        }

        const commits = await response.json();
        renderCommits(commits);
        setStatus(`Loaded ${commits.length} commits · updated ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        if (currentCommits.length > 0) {
            setStatus(`Offline: showing last loaded history. <span class="error-details">${error.message}</span>`, true);
        } else if (isFileProtocol) {
            container.innerHTML = "<p class='empty'>No commit history available.</p>";
            setStatus(`Local file view. To auto-refresh commits, open via a local HTTP server. <span class='error-details'>${error.message}</span>`, true);
        } else {
            container.innerHTML = "<p class='error'>Unable to load commits.</p>";
            setStatus(`<span class="error-details">${error.message}</span>`, true);
        }
        console.error(error);
    }
}

loadCommits();
setInterval(loadCommits, 5000);
