const Question = require("../models/Question");
const Interview = require("../models/Interview");

// Create a new coding question and link to an interview
const createQuestion = async (req, res) => {
    try {
        const {
            title,
            description,
            difficulty,
            category,
            starterCode,
            testCases,
            solution,
            hints,
            timeLimit,
            interviewId,
            visibility,
            tags,
            constraints
        } = req.body;

        // Validate required fields
        if (!title || !description || !difficulty || !category || !interviewId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if interview exists
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        // Create the question
        const question = await Question.create({
            title: title.trim(),
            description,
            difficulty,
            category: category.trim(),
            starterCode,
            testCases,
            solution,
            hints,
            timeLimit,
            interviewId,
            createdBy: req.user._id, // Assuming you use auth middleware
            visibility: visibility || "private",
            tags,
            constraints
        });

        // Optionally, push question ID into interview doc (if interview has a question list)
        interview.questionIds = interview.questionIds || [];
        interview.questionIds.push(question._id);
        await interview.save();

        return res.status(201).json({
            message: "Question created and linked to interview",
            question
        });
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
const getQuestionsForInterview = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        // Step 1: Check if interview exists
        const interview = await Interview.findById(interviewId).populate('questions');
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Step 2: Return the populated questions
        res.status(200).json({
            interviewId: interview._id,
            questions: interview.questions
        });
    } catch (error) {
        console.error('Error fetching interview questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    createQuestion,
    getQuestionsForInterview
};

