
import getGeminiClient from "../config/gemini.js";

const generateReadme = async ({
    projectName,
    description,
    technologies,
    features
}) => {
    const ai = getGeminiClient();

    const prompt = `
You are an expert software developer and technical documentation writer.

Your task is to create a professional, detailed, and accurate README.md file.

Use ONLY the project information provided below.

================ PROJECT DETAILS ================

PROJECT NAME:
${projectName}

PROJECT DESCRIPTION:
${description}

TECHNOLOGIES USED:
${technologies}

KEY FEATURES:
${features}

==================================================

IMPORTANT INSTRUCTIONS:

1. Start with # ${projectName}.
2. Use the exact project name provided above.
3. Use the supplied project description as the source of truth; do not replace it with a generic description.
4. Include every supplied feature in the Features section.
5. Include every supplied technology in the Technologies Used section.
6. Include Installation and Setup instructions.
7. Include Usage instructions.
8. Include Project Structure only when it can be described accurately.
9. Include Contributing and License sections.
10. Use professional Markdown formatting.
11. Make the documentation beginner-friendly.
12. Do not use generic names such as Test-Project or Example Project.
13. Do not invent repository URLs, deployment links, credentials, API endpoints, or project features.
14. Do not assume a particular folder structure or package manager.
15. If an exact command, URL, or configuration value is unknown, clearly use a placeholder or explain that it must be configured.
16. Return ONLY the README Markdown content.
17. Do not include explanations before or after the README.

Generate the README now using the supplied project details.
`;

    let response;

    // Retry temporary Gemini API failures up to 3 attempts.
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
                contents: prompt
            });

            break;

        } catch (error) {
            const status = Number(error.status || error.code);

            const isTemporaryError =
                status === 429 ||
                status === 503 ||
                (status >= 500 && status <= 599);

            console.error(
                `Gemini API attempt ${attempt}/3 failed:`,
                status,
                error.message
            );

            if (!isTemporaryError || attempt === 3) {
                throw error;
            }

            await new Promise((resolve) =>
                setTimeout(resolve, attempt * 1000)
            );
        }
    }

    const markdown = response?.text;

    if (!markdown || !markdown.trim()) {
        throw new Error("Gemini returned an empty README");
    }

    return markdown.trim();
};

export default generateReadme;
