import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { cvTemplate, user } from '../db/schema.js';
import { AIService } from '../ai/ai.service.js';

@Injectable()
export class CvService {
  constructor(private readonly aiService: AIService) {}

  async convertPdf(pdfBuffer: Buffer): Promise<{ tex: string }> {
    const pdfBase64 = pdfBuffer.toString('base64');
    let tex = await this.aiService.convertPdfToLatex(pdfBase64);

    // Strip markdown code fences if present
    tex = tex.replace(/^```(?:latex)?\s*/i, '').replace(/\s*```$/, '').trim();

    if (!tex.includes('\\documentclass')) {
      throw new UnprocessableEntityException(
        'AI did not produce valid LaTeX — missing \\documentclass',
      );
    }

    return { tex };
  }

  async saveTemplate(
    userId: string,
    tex: string,
    filename?: string,
  ): Promise<{ id: string }> {
    const id = crypto.randomUUID();

    await db.delete(cvTemplate).where(eq(cvTemplate.userId, userId));
    await db
      .insert(cvTemplate)
      .values({ id, userId, tex, filename: filename ?? null });
    await db
      .update(user)
      .set({ isOnboarded: true })
      .where(eq(user.id, userId));

    return { id };
  }

  async getTemplate(
    userId: string,
  ): Promise<{ tex: string; filename: string | null; createdAt: Date }> {
    const [template] = await db
      .select()
      .from(cvTemplate)
      .where(eq(cvTemplate.userId, userId));

    if (!template) throw new NotFoundException('No template found');

    return {
      tex: template.tex,
      filename: template.filename,
      createdAt: template.createdAt,
    };
  }
}
