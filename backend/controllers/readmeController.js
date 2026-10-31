import generateReadme from "../services/readmeService.js";

export const createReadme = async (req, res, next) => {
  try {
    const {
      projectName,
      description,
      technologies,
      features
    } = req.body;

    if (
      typeof projectName !== "string" ||
      typeof description !== "string" ||
      typeof technologies !== "string" ||
      typeof features !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required project details."
      });
    }

    if (
      !projectName.trim() ||
      !description.trim() ||
      !technologies.trim() ||
      !features.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    if (
      projectName.length > 150 ||
      description.length > 3000 ||
      technologies.length > 1000 ||
      features.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length."
      });
    }

    const markdown = await generateReadme({
      projectName: projectName.trim(),
      description: description.trim(),
      technologies: technologies.trim(),
      features: features.trim()
    });

    return res.status(200).json({
      success: true,
      message: "README generated successfully.",
      markdown
    });
  } catch (error) {
    next(error);
  }
};
