// seed.ts
import mongoose, { Model } from 'mongoose';
import envConfig from 'src/shared/utils/config';
import { UserStatus } from 'src/shared/constants/auth.constant';
import { Rolename } from 'src/shared/constants/role.constant';
import { HashingService } from 'src/shared/services/hashing.service';

// Import your schemas
import { Role, RoleSchema } from 'src/shared/schemas/role.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

const hashingService = new HashingService();

// Create models manually for seeding
const RoleModel: Model<Role> = mongoose.model<Role>(Role.name, RoleSchema);
const UserModel: Model<User> = mongoose.model<User>(User.name, UserSchema);

const main = async () => {
  await mongoose.connect(envConfig.MONGODB_URI);

  const roleCount = await RoleModel.countDocuments();
  if (roleCount > 0) {
    throw new Error('Roles already exist');
  }

  // Insert roles
  await RoleModel.insertMany([
    { name: Rolename.Admin, description: 'Admin role' },
    { name: Rolename.Customer, description: 'Customer role' },
    { name: Rolename.NutritionExpert, description: 'NutritionExpert role' },
  ]);

  const adminRole = await RoleModel.findOne({ name: Rolename.Admin }).orFail();

  const hashedPassword = await hashingService.hashPassword(
    envConfig.ADMIN_PASSWORD,
  );

  // Create admin user
  const adminUser = await UserModel.create({
    email: envConfig.ADMIN_EMAIL,
    password: hashedPassword,
    fullname: envConfig.ADMIN_FULLNAME,
    phoneNumber: envConfig.ADMIN_PHONENUMBER,
    status: UserStatus.Active,
    roleId: adminRole._id,
  });

  return { createdRolesCount: 3, adminUser };
};

main()
  .then(({ adminUser, createdRolesCount }) => {
    console.log(
      `✅ Seeding success. Created ${createdRolesCount} roles and admin user with email ${adminUser.email}`,
    );
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ Seeding failed', err);
    mongoose.connection.close();
  });
