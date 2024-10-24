import { Answer, Survey } from "../Models/SurveyModel.js";

// Create a new survey
export const createSurvey = async (req, res) => {
  const { title, description, questions } = req.body;
  const userId = req.user.id;

  try {
    const survey = new Survey({
      title,
      description,
      questions,
      user: userId,
    });

    await survey.save();

    res.status(201).json({ message: "Survey created successfully", survey });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating survey", error: error.message });
  }
};

// Get all surveys
export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json(surveys);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching surveys", error: error.message });
  }
};

// Get a single survey by ID
export const getSurveyById = async (req, res) => {
  const { id: surveyId } = req.params; // Destructuring with a more descriptive name

  try {
    const survey = await Survey.findById(surveyId); // Using the descriptive name
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    return res.status(200).json(survey); // Return a 200 status code for a successful fetch
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching survey", error: error.message });
  }
};

export const getSurveysByAdmin = async (req, res) => {
  const userId = req.user.id;

  try {
    const surveys = await Survey.find({ user: userId }).populate(
      "user",
      "name email"
    );

    if (surveys.length === 0) {
      return res
        .status(404)
        .json({ message: "No surveys found for this user" });
    }

    res
      .status(200)
      .json({ message: "Surveys retrieved successfully", surveys });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving surveys", error: error.message });
  }
};

// Update a survey by ID
export const updateSurvey = async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;

  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    survey.title = title || survey.title;
    survey.description = description || survey.description;
    survey.questions = questions || survey.questions;

    await survey.save();

    res.json({ message: "Survey updated successfully", survey });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating survey", error: error.message });
  }
};

// Delete a survey by ID
export const deleteSurvey = async (req, res) => {
  const { id } = req.params;

  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    await survey.remove();

    res.json({ message: "Survey deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting survey", error: error.message });
  }
};

export const getUserAnsweredSurveys = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch answered surveys and populate the survey details
    const answeredSurveys = await Answer.find({ user: userId })
      .populate({
        path: "survey",
        select: "title description questions",
      })
      .select("answers submittedAt survey");

    // Check if no surveys have been answered
    if (!answeredSurveys || answeredSurveys.length === 0) {
      return res.status(404).json({ message: "No answered surveys found." });
    }

    // Format the response to include survey details and answers, including max rating
    const formattedSurveys = answeredSurveys.map((answeredSurvey) => {
      // Create a map of question IDs to maxRating for quick lookup
      const questionMaxRatings = answeredSurvey.survey.questions.reduce(
        (acc, question) => {
          acc[question._id] = question.maxRating; // Map question ID to its maxRating
          return acc;
        },
        {}
      );

      return {
        surveyId: answeredSurvey.survey._id,
        surveyTitle: answeredSurvey.survey.title,
        surveyDescription: answeredSurvey.survey.description,
        submittedAt: answeredSurvey.submittedAt,
        answers: answeredSurvey.answers.map((answer) => ({
          questionId: answer.questionId,
          answer: answer.answer,
          maxRating: questionMaxRatings[answer.questionId],
        })),
      };
    });

    res.status(200).json(formattedSurveys);
  } catch (error) {
    console.error("Error fetching answered surveys:", error);
    res.status(500).json({ message: "Server error" });
  }
};
