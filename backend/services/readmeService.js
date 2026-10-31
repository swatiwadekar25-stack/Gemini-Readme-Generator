import getGeminiClient from "../config/gemini.js";

const generateReadme = async ({
  projectName,
  description,
  technologies,
  features
}) => {
  const ai = getGeminiClient();

  const prompt = `
You are a professional software developer and technical writer.

Generate a complete, professional README.md file for the following project.

PROJECT NAME:
${projectName}

PROJECT DESCRIPTION:
${description}

TECHNOLOGIES:
${technologies}

KEY FEATURES:
${features}

Requirements:
1. Return only Markdown content.
2. Start with the project name as an H1 heading.
3. Include a project description.
4. Include a Features section with a bullet list.
5. Include a Technologies Used section.
6. Include Installation and Setup instructions.
7. Include Usage instructions.
8. Include a Project Structure section when appropriate.
9. Include Contributing and License sections.
10. Use clear, beginner-friendly language.
11. Do not invent actual URLs, credentials, or features not provided.
12. Use placeholders for missing configuration values.
13. Format all commands and code examples correctly.
`;

  // Retry temporary Gemini API failures up to 3 attempts.
  let response;

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

      // Wait 1 second, then 2 seconds before retrying.
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