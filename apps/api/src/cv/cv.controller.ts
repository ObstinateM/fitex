import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
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
  async convertPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No PDF file provided');
    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('File must be a PDF');
    return this.cvService.convertPdf(file.buffer);
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
}
