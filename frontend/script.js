
/* ========================================
   ReadmeAI - AI README Generator
   Features:
   1. Generate README
   2. Save README history to MongoDB
   3. Light/Dark theme toggle
   4. Copy README
   5. Download README
======================================== */

/* ---------- Get HTML Elements ---------- */

const readmeForm = document.getElementById("readmeForm");
const generateBtn = document.getElementById("generateBtn");
const buttonText = document.getElementById("buttonText");

const preview = document.getElementById("preview");
const previewStatus = document.getElementById("previewStatus");
const wordCount = document.getElementById("wordCount");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

/* ---------- Store Generated Markdown ---------- */

let generatedMarkdown = "";

/* ---------- Generate README ---------- */

if (readmeForm) {
    readmeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(readmeForm);

        const projectDetails = {
            projectName: (formData.get("projectName") || "").trim(),
            description: (formData.get("description") || "").trim(),
            technologies: (formData.get("technologies") || "").trim(),
            features: (formData.get("features") || "").trim()
        };

        // Check that all fields are filled
        if (Object.values(projectDetails).some((value) => !value)) {
            showMessage("Please fill in all fields.");
            previewStatus.textContent = "Please complete the form.";
            return;
        }

        setLoading(true);

        previewStatus.textContent = "Generating your README...";

        generatedMarkdown = "";
        copyBtn.disabled = true;
        downloadBtn.disabled = true;

        try {
            /* STEP 1: Generate README using backend */

            const result = await ReadmeAPI.request("/api/readme/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(projectDetails)
            });

            if (!result.success || !result.markdown) {
                throw new Error(
                    result.message || "Unable to generate README."
                );
            }

            generatedMarkdown = result.markdown;

            // Display the generated README
            showMarkdown(generatedMarkdown);

            wordCount.textContent =
                `${generatedMarkdown.trim().split(/\s+/).length} words`;

            copyBtn.disabled = false;
            downloadBtn.disabled = false;

            previewStatus.textContent = "README generated successfully!";

            /* STEP 2: Save generated README to MongoDB */

            try {
                previewStatus.textContent =
                    "README generated. Saving to history...";

                const saveResult = await ReadmeAPI.request("/api/readme/history", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...projectDetails,
                        markdown: generatedMarkdown
                    })
                });

                if (!saveResult.success) {
                    throw new Error(
                        saveResult.message || "Unable to save README history."
                    );
                }

                previewStatus.textContent =
                    "README generated and saved to history successfully!";

            } catch (saveError) {
                console.error("README history save error:", saveError);

                // The generated README remains available even if saving fails.
                previewStatus.textContent =
                    "README generated, but history could not be saved.";
            }

        } catch (error) {
            console.error("README generation error:", error);

            generatedMarkdown = "";

            copyBtn.disabled = true;
            downloadBtn.disabled = true;

            showMessage(
                error.message ||
                "Something went wrong. Please try again."
            );

            previewStatus.textContent = "README generation failed.";

        } finally {
            setLoading(false);
        }
    });
}

/* ---------- Loading Button ---------- */

function setLoading(isLoading) {
    if (generateBtn) {
        generateBtn.disabled = isLoading;
    }

    if (buttonText) {
        buttonText.textContent = isLoading
            ? "Generating README..."
            : "✦ Generate README";
    }
}

/* ---------- Display Markdown Preview ---------- */

function showMarkdown(markdown) {
    if (!preview) return;

    preview.classList.remove("empty-preview");

    // Convert Markdown into HTML
    const html = marked.parse(markdown);

    // Sanitize HTML before displaying it
    preview.innerHTML = DOMPurify.sanitize(html);
}

/* ---------- Display Error Message ---------- */

function showMessage(message) {
    if (!preview) return;

    preview.classList.add("empty-preview");
    preview.replaceChildren();

    const messageElement = document.createElement("p");

    messageElement.textContent = message;
    messageElement.className = "error-message";

    preview.appendChild(messageElement);
}

/* ---------- Copy README ---------- */

if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        if (!generatedMarkdown) return;

        try {
            await navigator.clipboard.writeText(generatedMarkdown);

            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";

            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);

        } catch (error) {
            console.error("Copy error:", error);

            previewStatus.textContent =
                "Copy failed. Please select and copy the Markdown manually.";
        }
    });
}

/* ---------- Download README ---------- */

if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
        if (!generatedMarkdown) return;

        const blob = new Blob(
            [generatedMarkdown],
            { type: "text/markdown;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "README.md";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    });
}
