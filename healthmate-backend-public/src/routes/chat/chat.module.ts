import { Module, OnModuleInit, Injectable } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRoom, ChatRoomSchema, Message, MessageSchema } from '../../shared/schemas/chat.schema';
import { User, UserSchema } from '../../shared/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
class ChatIndexesInitializer implements OnModuleInit {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<any>,
  ) {}

  async onModuleInit() {
    // Drop stray unique index on roomId if it exists to prevent E11000 on null
    try {
      const indexes = await this.chatRoomModel.collection.indexes();
      const roomIdIdx = indexes.find((i: any) => i.name === 'roomId_1');
      if (roomIdIdx) {
        await this.chatRoomModel.collection.dropIndex('roomId_1');
      }
    } catch (_) {
      // no-op
    }
    // Ensure schema indexes are in place (including unique customerId+expertId)
    try {
      await this.chatRoomModel.createIndexes();
    } catch (_) {
      // no-op
    }
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatIndexesInitializer],
  exports: [ChatService],
})
export class ChatModule {}