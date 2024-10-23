import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default:"Description",
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: [
          "short_text",
          "long_text",
          "multiple_choice",
          "checkbox",
          "dropdown",
          "rating",
          "date",
        ],
        required: true,
      },
      options: [
        {
          type: String,
        },
      ], 
      maxRating: {
        type: Number,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const answerSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Survey = mongoose.model("Survey", surveySchema);
export const Answer = mongoose.model("Answer", answerSchema);
