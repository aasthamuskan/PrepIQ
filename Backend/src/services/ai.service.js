const Groq = require("groq-sdk")
const puppeteer = require("puppeteer")
const { z } = require("zod")

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

const MODEL = "llama-3.3-70b-versatile"


// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const QuestionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string(),
})

const SkillGapSchema = z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"]),
})

const PreparationPlanSchema = z.object({
    day: z.number().int().positive(),
    focus: z.string(),
    tasks: z.array(z.string()),
})

const InterviewReportSchema = z.object({
    title: z.string(),
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(QuestionSchema).min(1),
    behavioralQuestions: z.array(QuestionSchema).min(1),
    skillGaps: z.array(SkillGapSchema),
    preparationPlan: z.array(PreparationPlanSchema).min(1),
})

const ResumePdfSchema = z.object({
    html: z.string().min(1),
})

// ─────────────────────────────────────────────────────────────────────────────


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert career coach and interview preparation specialist.

Generate a detailed interview report for a candidate based on the following information:

Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Return a JSON object with EXACTLY this structure (no extra fields):
{
  "title": "Job title extracted from job description",
  "matchScore": <number 0-100 indicating how well candidate matches the job>,
  "technicalQuestions": [
    {
      "question": "technical question to ask in interview",
      "intention": "why interviewer asks this question",
      "answer": "how to answer - key points, approach, what to cover"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "behavioral question to ask in interview",
      "intention": "why interviewer asks this question",
      "answer": "how to answer - key points, approach, what to cover"
    }
  ],
  "skillGaps": [
    {
      "skill": "skill the candidate is lacking",
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": <day number starting from 1>,
      "focus": "main topic to focus on this day",
      "tasks": ["specific task 1", "specific task 2", "specific task 3"]
    }
  ]
}

Generate at least 5 technical questions, 4 behavioral questions, identify key skill gaps, and create a 7-day preparation plan.`

    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert interview coach. Always respond with valid JSON only, no markdown, no extra text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        })

        const raw = JSON.parse(response.choices[0].message.content)

        // Validate + parse with Zod — throws if AI returned wrong structure/types
        const validated = InterviewReportSchema.parse(raw)

        return validated

    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error("Interview report validation failed:", err.errors)
            throw new Error("AI returned an invalid report structure. Please try again.")
        }
        console.error("generateInterviewReport error:", err.message)
        throw new Error("Failed to generate interview report. Please try again.")
    }
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `You are a professional resume writer.

Generate an ATS-friendly, professional resume in HTML format for a candidate with the following details:

Resume/Experience: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Return a JSON object with EXACTLY this structure:
{
  "html": "<full HTML resume content here>"
}

Requirements for the HTML resume:
- Tailored for the given job description
- ATS-friendly (parseable by applicant tracking systems)
- Professional, clean design with subtle styling
- Include inline CSS styles only
- 1-2 pages when printed to PDF
- Highlight relevant skills and experience
- Should NOT look AI-generated
- Use a professional color scheme (dark navy header, white body)
- Sections: Contact Info, Professional Summary, Skills, Experience, Education, Projects (if any)`

    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a professional resume writer. Always respond with valid JSON only, no markdown, no extra text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.6,
        })

        const raw = JSON.parse(response.choices[0].message.content)

        // Validate with Zod — ensures html field exists and is non-empty
        const { html } = ResumePdfSchema.parse(raw)

        const pdfBuffer = await generatePdfFromHtml(html)

        return pdfBuffer

    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error("Resume PDF validation failed:", err.errors)
            throw new Error("AI returned an invalid resume structure. Please try again.")
        }
        console.error("generateResumePdf error:", err.message)
        throw new Error("Failed to generate resume PDF. Please try again.")
    }
}

module.exports = { generateInterviewReport, generateResumePdf }