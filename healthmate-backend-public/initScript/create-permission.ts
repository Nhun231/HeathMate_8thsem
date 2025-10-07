import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod, Rolename } from 'src/shared/constants/role.constant';

import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Permission,
  PermissionDocument,
} from 'src/routes/permission/schema/permission.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // ✅ we don’t need to listen()
  await app.listen(3010);
  const server = app.getHttpAdapter().getInstance();
  const router = server?.router;

  const permissionModel = app.get<Model<PermissionDocument>>(
    getModelToken(Permission.name),
  );
  const roleModel = app.get<Model<RoleDocument>>(getModelToken(Role.name));

  const permissionInDb = await permissionModel.find({
    deletedAt: { $exists: false },
  });

  const availableRoutes: {
    path: string;
    method: keyof typeof HTTPMethod;
    name: string;
    module: string;
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = String(
          layer.route?.stack[0].method,
        ).toUpperCase() as keyof typeof HTTPMethod;
        const moduleName = String(path.split('/')[2]).toUpperCase();
        console.log(path, method, moduleName);
        return {
          path,
          method,
          name: `${method} ${path}`,
          module: moduleName,
        };
      }
    })
    .filter((item) => item !== undefined);

  // Build map of existing and available permissions
  const permissionInDbMap = permissionInDb.reduce<Record<string, boolean>>(
    (acc, cur) => {
      acc[`${cur.method}-${cur.path}`] = true;
      return acc;
    },
    {},
  );

  const availableRoutesMap = availableRoutes.reduce<Record<string, boolean>>(
    (acc, cur) => {
      acc[`${cur.method}-${cur.path}`] = true;
      return acc;
    },
    {},
  );

  // Delete permissions not found in routes anymore
  const permissionsToDelete = permissionInDb.filter((item) => {
    const key = `${item.method}-${item.path}`;
    return !availableRoutesMap[key];
  });

  if (permissionsToDelete.length > 0) {
    const deletedResult = await permissionModel.deleteMany({
      _id: { $in: permissionsToDelete.map((item) => item._id) },
    });
    console.log('Deleted Permissions:', deletedResult.deletedCount);
  } else {
    console.log('No permissions to delete');
  }

  // Create permissions that are new
  const permissionsToCreate = availableRoutes.filter((item) => {
    const key = `${item.method}-${item.path}`;
    return !permissionInDbMap[key];
  });

  if (permissionsToCreate.length > 0) {
    const createdResult = await permissionModel.insertMany(
      permissionsToCreate,
      {
        ordered: false,
      },
    );
    console.log('Created Permissions:', createdResult.length);
  } else {
    console.log('No permissions to create');
  }

  const updatedPermissionsInDb = await permissionModel.find({
    deletedAt: { $exists: false },
  });

  // Update admin role to have all permissions
  const adminRole = await roleModel.findOne({ name: Rolename.Admin });
  if (!adminRole) throw new Error('Admin role not found');

  // Set every permission to include Admin role (if not already)
  await Promise.all(
    updatedPermissionsInDb.map(async (permission) => {
      const roleIds = permission.role.map((id) => id.toString());
      if (!roleIds.includes(adminRole._id.toString())) {
        permission.role.push(adminRole._id);
        await permission.save();
      }
    }),
  );

  console.log(
    `Admin role assigned to ${updatedPermissionsInDb.length} permissions.`,
  );

  await app.close();
  process.exit(0);
}

bootstrap();
