import { Injectable, InternalServerErrorException } from '@nestjs/common';

const PDF_TO_LATEX_PROMPT = `You are a LaTeX expert. Convert the attached CV/resume into a clean, compilable LaTeX document.
Requirements:
- Use \\documentclass{article} or a standard resume class
- Preserve all original content, structure, and sections exactly
- Use standard packages: fontenc, inputenc, geometry, hyperref, enumitem
- Output ONLY raw LaTeX — no markdown, no explanation, no code fences
- The document must compile with pdflatex without errors`;

@Injectable()
export class AIService {
  private readonly provider: string;
  private readonly model: string;

  constructor() {
    this.provider = process.env.AI_PROVIDER ?? 'anthropic';
    this.model = process.env.AI_MODEL ?? this.defaultModel();
  }

  private defaultModel(): string {
    switch (this.provider) {
      case 'openai':
        return 'gpt-4o';
      case 'gemini':
        return 'gemini-1.5-pro';
      default:
        return 'claude-opus-4-6';
    }
  }

  async convertPdfToLatex(pdfBase64: string): Promise<string> {
    switch (this.provider) {
      case 'anthropic':
        return this.callAnthropic(pdfBase64);
      case 'openai':
        return this.callOpenAI(pdfBase64);
      case 'gemini':
        return this.callGemini(pdfBase64);
      default:
        throw new InternalServerErrorException(
          `Unknown AI provider: ${this.provider}`,
        );
    }
  }

  private async callAnthropic(pdfBase64: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
              { type: 'text', text: PDF_TO_LATEX_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new InternalServerErrorException(`Anthropic API error: ${error}`);
    }

    const data = (await res.json()) as any;
    return data.content?.[0]?.text ?? '';
  }

  private async callOpenAI(pdfBase64: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_output_tokens: 8192,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                filename: 'cv.pdf',
                file_data: `data:application/pdf;base64,${pdfBase64}`,
              },
              { type: 'input_text', text: PDF_TO_LATEX_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new InternalServerErrorException(`OpenAI API error: ${error}`);
    }

    const data = (await res.json()) as any;
    return data.output?.[0]?.content?.[0]?.text ?? '';
  }

  private async callGemini(pdfBase64: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64,
                  },
                },
                { text: PDF_TO_LATEX_PROMPT },
              ],
            },
          ],
        }),
      },
    );

    if (!res.ok) {
      const error = await res.text();
      throw new InternalServerErrorException(`Gemini API error: ${error}`);
    }

    const data = (await res.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}
