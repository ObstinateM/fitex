import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('cv')
@UseGuards(AuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post('convert-pdf')
  @UseInterceptors(
    FileInterceptor('pdf', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async convertPdf(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('No PDF file provided');
    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('File must be a PDF');
    return this.cvService.convertPdf(file.buffer, req.user.id);
  }

  @Get('pdf-usage')
  async getPdfUsage(@Req() req: any) {
    return this.cvService.getPdfUsage(req.user.id);
  }

  @Post('template')
  async saveTemplate(
    @Body() body: { tex: string; filename?: string },
    @Req() req: any,
  ) {
    if (!body.tex) throw new BadRequestException('tex is required');
    return this.cvService.saveTemplate(req.user.id, body.tex, body.filename);
  }

  @Get('template')
  async getTemplate(@Req() req: any) {
    return this.cvService.getTemplate(req.user.id);
  }

  @Post('compile')
  async compileTemplate(@Req() req: any, @Res() res: Response) {
    const pdf = await this.cvService.compileTemplate(req.user.id);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="cv.pdf"');
    res.send(pdf);
  }

  @Post('analyze-ats')
  async analyzeAts(@Body() body: { jobDescription: string }, @Req() req: any) {
    if (!body.jobDescription)
      throw new BadRequestException('jobDescription is required');
    return this.cvService.analyzeAts(req.user.id, body.jobDescription);
  }

  @Post('tailor')
  async tailorCv(
    @Body()
    body: {
      jobDescription: string;
      adjustmentComment?: string;
      atsKeywords?: string[];
      storyIds?: string[];
    },
    @Req() req: any,
  ) {
    if (!body.jobDescription)
      throw new BadRequestException('jobDescription is required');
    return this.cvService.tailorCv(
      req.user.id,
      body.jobDescription,
      body.adjustmentComment,
      body.atsKeywords,
      body.storyIds,
    );
  }

  @Get('history')
  async listHistory(@Req() req: any) {
    return this.cvService.listHistory(req.user.id);
  }

  @Get('history/:id')
  async getHistoryEntry(@Req() req: any, @Param('id') id: string) {
    return this.cvService.getHistoryEntry(req.user.id, id);
  }

  @Get('history/:id/pdf')
  async getHistoryPdf(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const entry = await this.cvService.getHistoryEntry(req.user.id, id);
    const pdf = await this.cvService.compileRawWithImages(entry.tex, req.user.id);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="cv.pdf"');
    res.send(pdf);
  }

  @Post('compile-raw')
  async compileRaw(
    @Body() body: { tex: string; includeImages?: boolean },
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!body.tex) throw new BadRequestException('tex is required');
    const pdf = body.includeImages
      ? await this.cvService.compileRawWithImages(body.tex, req.user.id)
      : await this.cvService.compileRaw(body.tex);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="cv.pdf"');
    res.send(pdf);
  }
}
