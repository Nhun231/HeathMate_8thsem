import envConfig from 'src/shared/config';
import { UserStatus } from 'src/shared/constants/auth.constant';
import { Rolename } from 'src/shared/constants/role.constant';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const hashingService = new HashingService();

const main = async () => {
  const roleCount = await prisma.role.count();
  if (roleCount > 0) {
    throw new Error('ROle already exists');
  }

  const roles = await prisma.role.createMany({
    data: [
      { name: Rolename.Admin, description: 'Admin role' },
      { name: Rolename.Customer, description: 'Customer role' },
      { name: Rolename.NutritionExpert, description: 'NutritionExpert role' },
    ],
  });

  const adminRole = await prisma.role.findFirstOrThrow({
    where: { name: Rolename.Admin },
  });

  const hashedPassword = await hashingService.hashPassword(
    envConfig.ADMIN_PASSWORD,
  );

  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      status: UserStatus.Active,
      roleId: adminRole.id,
    },
  });

  const adminUserCreated = await prisma.user.findFirstOrThrow({
    where: { email: envConfig.ADMIN_EMAIL, roleId: adminRole.id },
  });

  await prisma.profile.create({
    data: {
      userId: adminUserCreated.id,
      fullname: envConfig.ADMIN_FULLNAME,
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
    },
  });

  return { createdRolesCount: roles.count, adminUser };
};

main()
  .then(({ adminUser, createdRolesCount }) => {
    console.log(
      `Seeding success. Created ${createdRolesCount} roles and admin user with email ${adminUser.email}`,
    );
  })
  .catch((err) => {
    console.log('Seeding failed', err);
  });
