import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable WebSocket adapter for Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:5173']; //**change when deploy
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 9999);
  console.log('🚀 Application is running on port:', process.env.PORT ?? 9999);
  console.log('🔌 WebSocket server is enabled');
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
