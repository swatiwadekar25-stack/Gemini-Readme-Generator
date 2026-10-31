

/* ========================================
   ReadmeAI - README History
======================================== */

const historyList = document.getElementById("historyList");
const historyStatus = document.getElementById("historyStatus");
const refreshBtn = document.getElementById("refreshBtn");

const historyPreview = document.getElementById("historyPreview");
const previewTitle = document.getElementById("previewTitle");
const previewContent = document.getElementById("previewContent");
const closePreview = document.getElementById("closePreview");
const previewDownload = document.getElementById("previewDownload");

const API_URL = "/api/readme/history";

let currentReadme = null;

/* ---------- API response helper ---------- */

/* ---------- Load Saved README History ---------- */

async function loadHistory() {
    if (!historyList || !historyStatus || !refreshBtn) return;

    historyStatus.textContent = "Loading history...";
    refreshBtn.disabled = true;
    historyList.replaceChildren();

    try {
        const result = await ReadmeAPI.request(API_URL);

        if (!result.success) {
            throw new Error(
                result.message || "Unable to load README history."
            );
        }

        if (!Array.isArray(result.readmes)) {
            throw new Error("The history response did not include a README list.");
        }

        const readmes = result.readmes;

        if (readmes.length === 0) {
            historyStatus.textContent = "No saved READMEs yet.";
            return;
        }

        historyStatus.textContent =
            `${readmes.length} saved README(s)`;

        readmes.forEach((readme) => {
            const card = document.createElement("article");
            card.className = "history-item";

            const info = document.createElement("div");
            info.className = "history-info";

            const title = document.createElement("h3");
            title.textContent = readme.projectName || "Untitled project";

            const tech = document.createElement("p");
            tech.textContent = readme.technologies || "No technologies listed";

            const date = document.createElement("small");
            date.textContent = readme.createdAt
                ? new Date(readme.createdAt).toLocaleString()
                : "Date unavailable";

            info.append(title, tech, date);

            const actions = document.createElement("div");
            actions.className = "history-actions";

            const viewBtn = createButton("View", "secondary-btn");
            const downloadBtn = createButton("Download", "secondary-btn");
            const deleteBtn = createButton("Delete", "secondary-btn");

            viewBtn.addEventListener("click", () => {
                openReadme(readme._id);
            });

            downloadBtn.addEventListener("click", () => {
                downloadReadme(readme._id);
            });

            deleteBtn.addEventListener("click", () => {
                deleteReadme(readme._id);
            });

            actions.append(viewBtn, downloadBtn, deleteBtn);
            card.append(info, actions);
            historyList.appendChild(card);
        });

    } catch (error) {
        console.error("History loading error:", error);

        historyStatus.textContent = error.message;
    } finally {
        refreshBtn.disabled = false;
    }
}

/* ---------- Create Buttons ---------- */

function createButton(text, className) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = text;

    return button;
}

/* ---------- Get One README ---------- */

async function getReadme(id) {
    const result = await ReadmeAPI.request(
        `${API_URL}/${encodeURIComponent(id)}`
    );

    if (!result.success) {
        throw new Error(
            result.message || "Unable to retrieve README."
        );
    }

    return result.readme;
}

/* ---------- View README ---------- */

async function openReadme(id) {
    try {
        const readme = await getReadme(id);

        currentReadme = readme;

        previewTitle.textContent = readme.projectName || "Your README";

        previewContent.innerHTML = DOMPurify.sanitize(
            marked.parse(readme.markdown || "")
        );

        historyPreview.hidden = false;

        historyPreview.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Open README error:", error);
        alert(error.message);
    }
}

/* ---------- Download README ---------- */

async function downloadReadme(id) {
    try {
        const readme = await getReadme(id);
        saveMarkdownFile(readme);

    } catch (error) {
        console.error("Download README error:", error);
        alert(error.message);
    }
}

function saveMarkdownFile(readme) {
    const blob = new Blob(
        [readme.markdown || ""],
        { type: "text/markdown;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeName = (readme.projectName || "README")
        .replace(/[^a-z0-9-_]/gi, "-");

    link.href = url;
    link.download = `${safeName}-README.md`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Delete README ---------- */

async function deleteReadme(id) {
    const confirmed = confirm(
        "Are you sure you want to permanently delete this README?"
    );

    if (!confirmed) return;

    try {
        const result = await ReadmeAPI.request(
            `${API_URL}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        if (!result.success) {
            throw new Error(
                result.message || "Unable to delete README."
            );
        }

        if (currentReadme?._id === id) {
            currentReadme = null;
            historyPreview.hidden = true;
        }

        await loadHistory();

    } catch (error) {
        console.error("Delete README error:", error);
        alert(error.message);
    }
}

/* ---------- Preview Download Button ---------- */

if (previewDownload) {
    previewDownload.addEventListener("click", () => {
        if (currentReadme) {
            saveMarkdownFile(currentReadme);
        }
    });
}

/* ---------- Close Preview Button ---------- */

if (closePreview) {
    closePreview.addEventListener("click", () => {
        historyPreview.hidden = true;
        currentReadme = null;
    });
}

/* ---------- Refresh Button ---------- */

if (refreshBtn) {
    refreshBtn.addEventListener("click", loadHistory);
}

/* ---------- Load History on Page Open ---------- */

loadHistory();
