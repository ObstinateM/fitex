import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { StoryService } from './story.service.js';

@Controller('stories')
@UseGuards(AuthGuard)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Get()
  list(@Req() req: Request) {
    return this.storyService.list((req as any).user.id);
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() body: { title: string; description?: string; tags?: string[] },
  ) {
    return this.storyService.create((req as any).user.id, body);
  }

  @Post('bulk')
  bulk(
    @Req() req: Request,
    @Body()
    body: {
      stories: { title: string; description?: string; tags?: string[] }[];
    },
  ) {
    return this.storyService.bulkCreate((req as any).user.id, body.stories);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; tags?: string[] },
  ) {
    return this.storyService.update((req as any).user.id, id, body);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.storyService.remove((req as any).user.id, id);
  }

  @Post('enhance')
  enhance(@Body() body: { title: string; description: string }) {
    return this.storyService.enhance(body.title, body.description);
  }

  @Post('import')
  import(@Body() body: { rawText: string }) {
    return this.storyService.importText(body.rawText);
  }

  @Post('answer-question')
  answerQuestion(
    @Req() req: Request,
    @Body() body: { question: string; jobDescription?: string },
  ) {
    if (!body.question) throw new BadRequestException('question is required');
    return this.storyService.answerQuestion(
      (req as any).user.id,
      body.question,
      body.jobDescription,
    );
  }

  @Post('filter')
  filter(
    @Body()
    body: {
      jobDescription: string;
      stories: { id: string; title: string; tags: string[] }[];
    },
  ) {
    return this.storyService.filterRelevant(body.jobDescription, body.stories);
  }
}
