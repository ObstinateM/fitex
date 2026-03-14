import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
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

  @Post('compile-raw')
  async compileRaw(
    @Body() body: { tex: string },
    @Res() res: Response,
  ) {
    if (!body.tex) throw new BadRequestException('tex is required');
    const pdf = await this.cvService.compileRaw(body.tex);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline; filename="cv.pdf"');
    res.send(pdf);
  }
}
