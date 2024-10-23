import { Answer, Survey } from "../Models/SurveyModel.js";

// Submit answers for a survey
export const submitSurveyAnswers = async (req, res) => {
  const { surveyId } = req.params;
  const { answers } = req.body;

  const userId = req.user.id;
  //console.log(userId);

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if the survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Check if the user has already submitted answers
    const existingAnswer = await Answer.findOne({
      survey: surveyId,
      user: userId,
    });
    if (existingAnswer) {
      return res.status(400).json({
        message: "You have already submitted a response for this survey",
      });
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return res
        .status(400)
        .json({ message: "Answers must be a non-empty array" });
    }

    // Create a new answer
    const answer = new Answer({
      survey: surveyId,
      answers,
      user: userId,
    });

    // Save the answer
    await answer.save();

    // Respond with success
    res.status(201).json({
      message: "Answers submitted successfully",
      answer: {
        id: answer._id,
        survey: answer.survey,
        submittedAt: answer.submittedAt,
        // include other fields as necessary
      },
    });
  } catch (error) {
    console.error("Error submitting answers:", error); // Log error details
    res.status(500).json({
      message: "Error submitting answers",
      error:
        process.env.NODE_ENV === "development"
          ? error
          : "Internal server error", // Only send full error details in development
    });
  }
};

// Get  answers for a survey

export const getSurveyAnswers = async (req, res) => {
  const { surveyId } = req.params;

  try {
    // Fetch the survey by ID with its questions
    const survey = await Survey.findById(surveyId).populate("questions");

    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    // Fetch answers for the survey
    const answers = await Answer.find({ survey: surveyId }).populate(
      "user",
      "name"
    ); // Populate user details for each answer

    // Format the response to include questions and their answers
    const formattedResponse = survey.questions.map((question) => {
      // Find answers related to the current question
      const questionAnswers = answers
        .filter((answer) =>
          answer.answers.some((ans) => ans.questionId.equals(question._id))
        )
        .map((answer) => {
          // Get the specific answer for this question
          const specificAnswer = answer.answers.find((ans) =>
            ans.questionId.equals(question._id)
          );
          return {
            user: answer.user.name,
            answer: specificAnswer ? specificAnswer.answer : null,
          };
        });

      return {
        question: question.question,
        type: question.type,
        options: question.options,
        maxRating: question.maxRating,
        answers: questionAnswers,
      };
    });

    res.json(formattedResponse);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching answers", error: error.message });
  }
};

export const getSurveyRatingData = async (req, res) => {
  const { surveyId } = req.params;

  try {
    const survey = await Survey.findById(surveyId).populate("questions");

    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    const answers = await Answer.find({ survey: surveyId });

    const chartData = [];

    survey.questions.forEach((question) => {
      if (question.type === "rating") {
        const ratingsCount = {};

        for (let i = 1; i <= question.maxRating; i++) {
          ratingsCount[i] = 0;
        }

        answers.forEach((answer) => {
          const specificAnswer = answer.answers.find((ans) =>
            ans.questionId.equals(question._id)
          );

          if (specificAnswer && specificAnswer.answer !== null) {
            const rating = specificAnswer.answer;

            if (ratingsCount[rating] !== undefined) {
              ratingsCount[rating]++;
            }
          }
        });

        chartData.push({
          question: question.question,
          ratings: ratingsCount,
        });
      }
    });

    res.json(chartData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rating data", error: error.message });
  }
};
