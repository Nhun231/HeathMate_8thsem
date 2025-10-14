import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chatWithAi(@Body('prompt') prompt: string) {
    const response = await this.aiService.generateResponse(prompt);
    return { message: response };
  }
}
