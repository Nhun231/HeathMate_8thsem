import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai'; 
import envConfig from '../../shared/utils/config';

@Injectable()
export class AiService {
  private groq: OpenAI;

  constructor() {
    this.groq = new OpenAI({
      apiKey: envConfig.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const result = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `
            Bạn là HealthMate Assistant - chuyên gia dinh dưỡng Việt Nam.

            Nhiệm vụ:
            1. Chỉ trả lời các câu hỏi LIÊN QUAN đến: sức khỏe, ăn uống, dinh dưỡng, BMI, BMR, TDEE.
            2. Nếu câu hỏi KHÔNG liên quan đến các chủ đề trên (ví dụ: toán học, lập trình, thể thao, lịch sử, v.v.), bạn PHẢI trả lời chính xác câu này, không thêm gì khác:
            "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến sức khỏe và ăn uống."

            Không được trả lời bất kỳ nội dung nào khác ngoài phạm vi cho phép.
            `,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      return result.choices?.[0]?.message?.content || 
        'Xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến sức khỏe và ăn uống.';
      
    } catch (error: any) {
      console.error('AI generation error:', error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const message = data?.error?.message || data?.message || error.message;
        
        if (status >= 400 && status < 500) {
          
          throw new BadRequestException({
            message: `AI request invalid: ${message}`,
            statusCode: status,
            details: data,
          });
        } else {
          throw new InternalServerErrorException({
            message: `AI server error: ${message}`,
            statusCode: status,
            details: data,
          });
        }
      }
      throw new InternalServerErrorException({
        message: `AI unknown error: ${error.message}`,
        statusCode: 500,
      });
    }
  }
}
