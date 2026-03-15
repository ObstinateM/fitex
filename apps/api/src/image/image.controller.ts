import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('image')
@UseGuards(AuthGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { label?: string },
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No image file provided');
    return this.imageService.upload(req.user.id, file, body.label);
  }

  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('images', 10, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files?.length) throw new BadRequestException('No image files provided');
    const results = [];
    for (const file of files) {
      results.push(await this.imageService.upload(req.user.id, file));
    }
    return results;
  }

  @Get()
  async list(@Req() req: any) {
    return this.imageService.list(req.user.id);
  }

  @Get('file/:userId/:filename')
  async getFile(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Ensure users can only access their own images
    if (userId !== req.user.id) {
      throw new BadRequestException('Access denied');
    }
    const imageId = filename.split('.')[0];
    const file = await this.imageService.getFile(req.user.id, imageId);
    res.set('Content-Type', file.mimeType);
    res.set(
      'Content-Disposition',
      `inline; filename="${file.filename}"`,
    );
    res.send(file.buffer);
  }

  @Patch(':id/rename')
  async rename(
    @Param('id') id: string,
    @Body() body: { filename: string },
    @Req() req: any,
  ) {
    if (!body.filename) throw new BadRequestException('filename is required');
    return this.imageService.rename(req.user.id, id, body.filename);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.imageService.remove(req.user.id, id);
  }
}
