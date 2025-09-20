export const REQUEST_USER_KEY = 'user';

export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  APIKey: 'APIKey',
} as const;

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
} as const;

export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];

export const UserStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
  Banned: 'Banned',
} as const;

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type TypeOfVerificationCodeType =
  (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];

export const Gender = {
  Male: 'Male',
  Female: 'Female',
} as const;

export type GenderType = (typeof Gender)[keyof typeof Gender];

export const ActivityLevel = {
  Sedentary: 'Sedentary', // little to no excercises
  Light: 'Light', // light exercise 1-3 days/week
  Moderate: 'Moderate', // moderate exercise 3-5 days/week
  Active: 'Active', // hard exercise 6-7 days/week
  VeryActive: 'VeryActive', // hard exercise & work in a physical job
} as const;

export type ActivityLevelType =
  (typeof ActivityLevel)[keyof typeof ActivityLevel];
