import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import CustomMyZodValidationPipe from './shared/pipes/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter';
import { AuthModule } from './routes/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CalculationModule } from './routes/calculation/calculation.module';
import { UserModule } from './routes/user/user.module';
import envConfig from './shared/utils/config';
import { IngredientModule } from "./routes/ingredient/ingredient.module";
import { DietPlanModule } from './routes/dietplan/dietplan.module';
import { DishModule } from './routes/dish/dish.module';
import { MealModule } from './routes/meal/meal.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      envConfig.MONGODB_URI.replace(
        '<db_user>',
        envConfig.MONGODB_USER,
      ).replace('<db_password>', envConfig.MONGODB_PASSWORD),
    ),
    SharedModule,
    AuthModule,
    CalculationModule,
    UserModule,
    IngredientModule,
    DietPlanModule,
    DishModule,
    MealModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomMyZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule { }
