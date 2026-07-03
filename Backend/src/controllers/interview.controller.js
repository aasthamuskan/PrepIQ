const pdfParse = require("pdf-parse/lib/pdf-parse.js")
const { generateInterviewReport, generateResumePdf, handlePlanChat } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const { selfDescription, jobDescription } = req.body

    // Validation
    if (!jobDescription || jobDescription.trim() === "") {
        return res.status(400).json({ message: "Job description is required." })
    }

    let resumeContent = ""

    if (req.file && req.file.buffer) {
        try {
            const parsed = await pdfParse(req.file.buffer)
            resumeContent = parsed.text
            console.log(`PDF parsed successfully. Characters extracted: ${resumeContent.length}`)
        } catch (err) {
            console.error("PDF parse error:", err.message || err)
            return res.status(400).json({ message: "Could not read the uploaded PDF. Please try a different file." })
        }
    }

    if (!resumeContent && (!selfDescription || selfDescription.trim() === "")) {
        return res.status(400).json({ message: "Please upload a resume PDF or provide a self description." })
    }

    try {
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("generateInterViewReport error:", err.message)
        res.status(500).json({ message: err.message || "Failed to generate interview report." })
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    try {
        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is missing from this report." })
        }

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("generateResumePdf error:", err.message)
        res.status(500).json({ message: err.message || "Failed to generate resume PDF." })
    }
}

/**
 * @description Controller to chat with AI coach about the interview plan, optionally modifying it.
 */
async function chatInterviewController(req, res) {
    const { interviewId, message, chatHistory } = req.body

    if (!interviewId || !message) {
        return res.status(400).json({ message: "Interview ID and message are required." })
    }

    try {
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const { resume, selfDescription, jobDescription } = interviewReport

        // Construct current plan details to give the model
        const currentPlan = {
            matchScore: interviewReport.matchScore,
            technicalQuestions: interviewReport.technicalQuestions,
            behavioralQuestions: interviewReport.behavioralQuestions,
            skillGaps: interviewReport.skillGaps,
            preparationPlan: interviewReport.preparationPlan
        }

        const result = await handlePlanChat({
            resume,
            selfDescription,
            jobDescription,
            currentPlan,
            message,
            chatHistory
        })

        // If there is an updated plan, apply updates to MongoDB and save
        if (result.updatedPlan) {
            const up = result.updatedPlan
            if (up.matchScore !== undefined) interviewReport.matchScore = up.matchScore
            if (up.technicalQuestions !== undefined) interviewReport.technicalQuestions = up.technicalQuestions
            if (up.behavioralQuestions !== undefined) interviewReport.behavioralQuestions = up.behavioralQuestions
            if (up.skillGaps !== undefined) interviewReport.skillGaps = up.skillGaps
            if (up.preparationPlan !== undefined) interviewReport.preparationPlan = up.preparationPlan

            await interviewReport.save()
        }

        return res.status(200).json({
            message: "Chat processed successfully",
            response: result.response,
            updatedReport: result.updatedPlan ? interviewReport : null
        })

    } catch (err) {
        console.error("chatInterviewController error:", err)
        return res.status(500).json({ message: err.message || "Failed to process chat message." })
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController,
    chatInterviewController
}