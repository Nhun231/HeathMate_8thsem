import {
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

export const NotFoundChatRoomException = new NotFoundException(
  'Error.NotFoundChatRoom'
);

export const NotFoundMessageException = new NotFoundException(
  'Error.NotFoundMessage'
);

export const NotFoundUserException = new NotFoundException(
  'Error.NotFoundUser'
);

export const UnauthorizedChatAccessException = new ForbiddenException(
  'Error.UnauthorizedChatAccess'
);

export const InvalidMessageContentException = new BadRequestException(
  'Error.InvalidMessageContent'
);

export const ChatRoomCreationFailedException = new UnprocessableEntityException(
  'Error.ChatRoomCreationFailed'
);

export const MessageSendFailedException = new UnprocessableEntityException(
  'Error.MessageSendFailed'
);
