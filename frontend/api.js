const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://gemini-readme-generator-8m1a.onrender.com";

window.ReadmeAPI = {
    async request(path, options) {
        let response;

        try {
            response = await fetch(`${API_BASE_URL}${path}`, options);
        } catch (error) {
            console.error("README API request failed:", error);
            throw new Error(
                "Could not reach the README backend. Check that the backend is running and allows this frontend origin."
            );
        }

        const contentType = response.headers.get("content-type") || "";
        const responseText = await response.text();
        let result;

        if (contentType.toLowerCase().includes("json")) {
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (error) {
                console.error("Invalid JSON response from README API:", error);
                throw new Error(
                    `The backend returned invalid JSON (HTTP ${response.status}).`
                );
            }
        } else {
            const isHtml = /<(!doctype|html|head|body)\b/i.test(responseText);
            const message = !response.ok && !isHtml
                ? responseText.trim().slice(0, 240)
                : "";

            throw new Error(
                message ||
                `The backend returned a non-JSON response (HTTP ${response.status}). Check the API URL and backend routes.`
            );
        }

        if (!response.ok) {
            throw new Error(
                result.message || `Backend request failed (HTTP ${response.status}).`
            );
        }

        return result;
    }
};
