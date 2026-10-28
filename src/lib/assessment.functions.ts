import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateWithGeminiFallback, AiUserError } from "./gemini.server";

const QuestionSchema = z.object({
  id: z.string().max(40),
  type: z.enum(["mcq", "code", "scenario"]),
  topic: z.string().max(200),
  prompt: z.string().max(4000),
  code: z.string().max(6000).nullable().optional(),
  options: z.array(z.string().max(1000)).max(6).nullable().optional(),
  correctIndex: z.number().nullable().optional(),
  correctAnswer: z.string().max(4000).nullable().optional(),
  explanation: z.string().max(4000),
});

export type AssessmentQuestion = z.infer<typeof QuestionSchema>;

const GenInput = z.object({
  technology: z.string().min(1).max(60),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().min(3).max(20),
  mix: z.object({
    mcq: z.number().int().min(0).max(20),
    code: z.number().int().min(0).max(20),
    scenario: z.number().int().min(0).max(20),
  }),
  mode: z
    .enum(["mixed", "mcq", "coding", "scenario", "debugging", "rapid"])
    .optional()
    .default("mixed"),
  adaptive: z.boolean().optional().default(true),
});

export const generateAssessment = createServerFn({ method: "POST" })
  .validator((d: unknown) => GenInput.parse(d))
  .handler(async ({ data }) => {
    const modeHint =
      data.mode === "mcq"
        ? "MCQ only."
        : data.mode === "coding"
          ? "All coding output/prediction questions using the code field."
          : data.mode === "scenario"
            ? "All scenario/design questions."
            : data.mode === "debugging"
              ? "All debugging questions: put buggy snippet in code and ask which fix is correct as MCQ."
              : data.mode === "rapid"
                ? "All short MCQs, one line each."
                : `Mixed: ${data.mix.mcq} MCQ, ${data.mix.code} code, ${data.mix.scenario} scenario.`;

    const ResSchema = z.object({ questions: z.array(QuestionSchema) });
    const run = async () => {
      const { text } = await generateWithGeminiFallback({
        feature: "assessment",
        system:
          'You are a senior technical interviewer. Output ONLY a JSON object matching: {"questions":[{"id":string,"type":"mcq"|"code"|"scenario","topic":string,"prompt":string,"code":string|null,"options":string[]|null,"correctIndex":number|null,"correctAnswer":string|null,"explanation":string}]}. For mcq: options length 4, correctIndex 0-3, code=null, correctAnswer=null. For code: put snippet in code (non-null), options length 4, correctIndex 0-3, correctAnswer=null. For scenario: options=null, correctIndex=null, code=null, correctAnswer is a 2-4 sentence model answer. explanation is always required and non-empty. Return ONLY valid JSON, no markdown fences, no surrounding text.',
        prompt: `Create ${data.count} ${data.difficulty} questions for ${data.technology}. ${modeHint} Vary topics. Unique short ids q1..q${data.count}.`,
      });
      const parsed = parseJson(text);
      const validated = ResSchema.parse(parsed);
      return validated.questions.slice(0, data.count);
    };

    try {
      return await run();
    } catch (err) {
      // A second attempt only helps when the model returned malformed JSON.
      if (err instanceof AiUserError) throw err;
      return await run();
    }
  });

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

const EvalInput = z.object({
  technology: z.string().min(1).max(60),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answers: z.array(
    z.object({
      question: QuestionSchema,
      userAnswer: z.string().max(5000),
      selectedIndex: z.number().int().min(0).max(5).nullable(),
    })
  ).max(25),
});

export const evaluateAssessment = createServerFn({ method: "POST" })
  .validator((d: unknown) => EvalInput.parse(d))
  .handler(async ({ data }) => {
    // Auto-grade objective, LLM grades scenarios + produces report
    const items = data.answers.map((a) => {
      let correct = false;
      if (a.question.type === "mcq" || a.question.type === "code") {
        correct = a.selectedIndex != null && a.selectedIndex === a.question.correctIndex;
      }
      return { ...a, autoCorrect: correct };
    });

    const ReportSchema = z.object({
      scenarioScores: z.array(
        z.object({ id: z.string(), score: z.number(), feedback: z.string() })
      ),
      overallScore: z.number(),
      radar: z.object({
        accuracy: z.number(),
        problemSolving: z.number(),
        conceptUnderstanding: z.number(),
        confidence: z.number(),
        codingSkill: z.number(),
        communication: z.number(),
      }),
      interviewReadiness: z.number(),
      skillLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
      companiesReady: z.array(z.string()),
      companiesNeedsImprovement: z.array(z.string()),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      weakTopics: z.array(z.string()),
      learningPath: z.array(
        z.object({ topic: z.string(), resource: z.string(), reason: z.string() })
      ),
      summary: z.string(),
    });

    const { text } = await generateWithGeminiFallback({
      feature: "assessment",
      system:
        'You are a fair but strict technical evaluator. Output ONLY a JSON object with keys: scenarioScores[{id,score(0-10),feedback}], overallScore(0-100), radar{accuracy,problemSolving,conceptUnderstanding,confidence,codingSkill,communication all 0-100}, interviewReadiness(0-100), skillLevel("Beginner"|"Intermediate"|"Advanced"|"Expert"), companiesReady[string], companiesNeedsImprovement[string], strengths[string], weaknesses[string], weakTopics[string], learningPath[{topic,resource,reason}], summary. No prose, no markdown.',
      prompt: `Technology: ${data.technology} (${data.difficulty}).\nAnswers:\n${JSON.stringify(items)}\n\nGrade scenarios by id. Combine auto-graded MCQ/code (each 10) with scenario scores for overallScore. Return 2-5 strengths, 2-5 weaknesses, weak topic tags, 3-5 learning-path items. Companies: 3-6 ready, 2-5 need improvement.`,
    });

    const object = ReportSchema.parse(parseJson(text));
    return { grading: items, ...object };
  });