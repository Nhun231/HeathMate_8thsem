import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from 'src/shared/schemas/device.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from 'src/shared/schemas/refreshToken.schema';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeDocument,
} from 'src/shared/schemas/verificationCode.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(VerificationCode.name)
    private verificationCodeModel: Model<VerificationCodeDocument>,
  ) {}

  async createUser(
    user: Pick<
      User,
      | 'email'
      | 'password'
      | 'fullname'
      | 'gender'
      | 'dob'
      | 'phoneNumber'
      | 'roleId'
    >,
  ): Promise<Omit<User, 'password'>> {
    const createdUser = await this.userModel.create(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = createdUser.toObject();

    return userWithoutPassword;
  }

  async updateUser(
    condition: { _id: Types.ObjectId } | { email: string },
    data: Partial<User>,
  ) {
    return await this.userModel.updateOne(condition, { $set: data });
  }

  async createVerificationCode(
    payload: Pick<VerificationCode, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCode> {
    return await this.verificationCodeModel.findOneAndUpdate(
      {
        email: payload.email,
        code: payload.code,
        type: payload.type,
      },
      {
        $set: {
          ...payload,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  async findUniqueVerificationCode(
    uniqueValue:
      | { _id: Types.ObjectId }
      | {
          email: string;
          code: string;
          type: string;
        },
  ): Promise<VerificationCodeDocument | null> {
    if ('_id' in uniqueValue) {
      return await this.verificationCodeModel.findById(uniqueValue._id);
    }

    return await this.verificationCodeModel.findOne({
      email: uniqueValue.email,
      code: uniqueValue.code,
      type: uniqueValue.type,
    });
  }

  async deleteVerificationCode(
    uniqueValue:
      | { _id: Types.ObjectId }
      | {
          email: string;
          code: string;
          type: string;
        },
  ): Promise<VerificationCodeDocument | null> {
    if ('_id' in uniqueValue) {
      return await this.verificationCodeModel.findByIdAndDelete(
        uniqueValue._id,
      );
    }

    return await this.verificationCodeModel.findOneAndDelete({
      email: uniqueValue.email,
      code: uniqueValue.code,
      type: uniqueValue.type,
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
    deviceId: string;
  }): Promise<RefreshToken> {
    return await this.refreshTokenModel.create(data);
  }

  async deleteRefreshToken(uniqueObject: {
    token: string;
  }): Promise<RefreshToken | null> {
    return await this.refreshTokenModel.findOneAndDelete({
      token: uniqueObject.token,
    });
  }

  async createDevice(data: {
    userId: Types.ObjectId;
    userAgent: string;
    ip: string;
    lastActive?: Date;
    isActive?: boolean;
  }): Promise<DeviceDocument> {
    return await this.deviceModel.create(data);
  }

  async updateDevice(
    deviceId: Types.ObjectId,
    data: Partial<Device>,
  ): Promise<DeviceDocument | null> {
    return await this.deviceModel.findByIdAndUpdate(
      deviceId,
      {
        $set: data,
      },
      {
        new: true,
      },
    );
  }

  async findUniqueRefreshToken(uniqueObject: {
    token: string;
  }): Promise<RefreshTokenDocument | null> {
    return await this.refreshTokenModel
      .findOne({
        token: uniqueObject.token,
      })
      .populate({
        path: 'userId',
        populate: {
          path: 'role',
        },
      })
      .populate('deviceId')
      .exec();
  }
}
