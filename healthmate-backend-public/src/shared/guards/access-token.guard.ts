import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY,
} from '../constants/auth.constant';
import { AccessTokenPayload } from '../types/jwt.type';
import {
  Permission,
  PermissionDocument,
} from 'src/shared/schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,

    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const decodedAccessToken = await this.extractAndValidateToken(request);

    // check user permission
    await this.validateUserPermission(decodedAccessToken, request);
    return true;
  }

  async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request);
    try {
      const decodedToken =
        await this.tokenService.verifyAccessToken(accessToken);

      request[REQUEST_USER_KEY] = decodedToken;
      return decodedToken;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken');
    }
    return accessToken;
  }

  async validateUserPermission(
    decodedAccessToken: AccessTokenPayload,
    request: any,
  ): Promise<void> {
    const roleId = new Types.ObjectId(decodedAccessToken.roleId);
    const path = request.route.path;
    const method = request.method;

    const permission = await this.permissionModel.findOne({
      path,
      method,
      role: roleId,
    });

    if (!permission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const role = await this.roleModel
      .findById(roleId)
      .select('_id name description');
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    request[REQUEST_ROLE_PERMISSIONS] = role;
  }
}
