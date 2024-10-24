import express from "express";
import { verifyAdmin, verifyToken } from "../Middleware/verifyToken.js";
import {
  createSurvey,
  deleteSurvey,
  getAllSurveys,
  getSurveyById,
  getSurveysByAdmin,
  getUserAnsweredSurveys,
  updateSurvey,
} from "../Controllers/surveyController.js";
import {
  getSurveyAnswers,
  getSurveyRatingData,
  getSurveyRatingsForChart,
  submitSurveyAnswers,
} from "../Controllers/answerController.js";

const router = express.Router();

// Survey routes
router.post("/create-survey", verifyToken, verifyAdmin, createSurvey);
router.get("/all-surveys", getAllSurveys);
router.get("/surveys/:id", verifyToken, getSurveyById);
router.get("/get-user-survey", verifyToken, verifyAdmin, getSurveysByAdmin);
router.get("/get-answered-survey", verifyToken, getUserAnsweredSurveys);
router.put("/edit-survey/:id", verifyToken, verifyAdmin, updateSurvey);
router.delete("/delete-survey/:id", verifyToken, verifyAdmin, deleteSurvey);

// Answer routes
router.post("/surveys/:surveyId/answers", verifyToken, submitSurveyAnswers);
router.get("/surveys/:surveyId/answers", verifyToken, getSurveyAnswers);
router.get("/survey/:surveyId/rating-data", verifyToken, getSurveyRatingData);
router.get("/survey-ratings/:surveyId", verifyToken, getSurveyRatingsForChart);

export default router;
