export function buildCvTailoringPrompt(
  texSource: string,
  jobDescription: string,
  guidance: string,
  context: string,
): string {
  return `You are an expert CV/resume tailoring assistant. Your task is to modify a LaTeX CV to better match a job description.

RULES:
- Only modify the CONTENT of the CV (text, descriptions, skills, bullet points).
- Do NOT change the document structure, packages, commands, or formatting macros.
- Do NOT add experience, skills, or qualifications the candidate doesn't already have.
- You may reorder, rephrase, emphasize, or de-emphasize existing content.
- Use keywords from the job description naturally where they match existing experience.
- Keep the LaTeX compilable - do not break any commands or environments.
- CRITICAL: The result MUST fit on EXACTLY ONE PAGE. If the original is already tight, shorten the least important bullet points to ensure it compiles to a single page.
- Return ONLY the complete modified LaTeX source, no explanations.

JOB DESCRIPTION:
${jobDescription}

${context ? `CANDIDATE CONTEXT:\n${context}\n` : ""}${guidance ? `ADDITIONAL GUIDANCE:\n${guidance}\n` : ""}
ORIGINAL LATEX CV:
${texSource}`;
}

export function buildReduceToOnePagePrompt(texSource: string, pageCount: number, jobDescription: string): string {
  return `The LaTeX CV below compiled to ${pageCount} pages but MUST fit on exactly 1 page.

RULES:
- Make only a FEW small reductions — do not over-cut. We will retry if it is still too long.
- Focus on the job mission and requirements: keep and highlight experiences, skills, and bullet points that are most relevant to the job offer.
- Shorten or trim content that is least relevant to the job offer first, before touching anything important.
- Do NOT remove contact info, recent relevant experience, or skills that match the job.
- Do NOT change the document structure, packages, commands, or formatting macros.
- Keep the LaTeX compilable.
- Return ONLY the complete modified LaTeX source, no explanations.

JOB DESCRIPTION:
${jobDescription}

CURRENT LATEX CV:
${texSource}`;
}

export function buildQuestionAnswerPrompt(
  question: string,
  jobDescription: string,
  texSource: string,
  guidance: string,
  context: string,
  questionGuidance?: string,
): string {
  return `You are an expert job application assistant. Write a professional, compelling answer to the following application question.

RULES:
- Base your answer on the candidate's real experience from their CV below.
- Tailor the answer to the specific job description.
- Be concise but thorough (2-4 paragraphs unless the question calls for a shorter answer).
- Sound natural and professional, not generic or AI-generated.
- Do NOT fabricate experiences or qualifications not present in the CV.
- Return ONLY the answer text, no preamble or labels.

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n\n` : ""}${context ? `CANDIDATE CONTEXT:\n${context}\n` : ""}${guidance ? `ADDITIONAL GUIDANCE:\n${guidance}\n` : ""}${questionGuidance ? `INSTRUCTIONS FOR THIS QUESTION:\n${questionGuidance}\n\n` : ""}${texSource ? `CANDIDATE'S CV (LaTeX source):\n${texSource}\n\n` : ""}QUESTION:
${question}`;
}
