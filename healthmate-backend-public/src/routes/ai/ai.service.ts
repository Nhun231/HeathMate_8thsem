import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import envConfig from '../../shared/utils/config';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private chatSession: any;

  constructor() {
    const apiKey = envConfig.GOOGLE_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.chatSession = this.genAI
      .getGenerativeModel({ model: 'gemini-2.5-pro' })
      .startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: `Đây là phần giới thiệu về trang web HealthMate:
                        HealthMate là một công cụ trực tuyến giúp người dùng Việt Nam quản lý và theo dõi chế độ ăn uống, sức khỏe, và các chỉ số quan trọng như BMI, BMR và TDEE. Ứng dụng cung cấp các công cụ tính toán dinh dưỡng chuẩn khoa học, gợi ý thực đơn thông minh, theo dõi thể trạng, và hỗ trợ người dùng lập kế hoạch ăn uống phù hợp với mục tiêu cá nhân như giảm cân, tăng cơ hoặc duy trì sức khỏe cân bằng. Giao diện trực quan, dễ sử dụng, được thiết kế riêng cho cộng đồng Việt Nam. Nếu có ai hỏi về HealthMate, hãy trả lời rằng đây là một công cụ hữu ích cho việc quản lý sức khỏe và dinh dưỡng giống như bạn là người của trang web này.
                        Nếu câu hỏi không liên quan đến những chủ đề này, hãy trả lời: "Xin lỗi, tôi chỉ có thể trả lời về HealthMate và dinh dưỡng.`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Thông tin đã được ghi nhận. Tôi sẽ sử dụng kiến thức này nếu người dùng hỏi về HealthMate.',
              },
            ],
          },
        ],
      });
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const result = await this.chatSession.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new InternalServerErrorException('Failed to generate AI response');
    }
  }
}
