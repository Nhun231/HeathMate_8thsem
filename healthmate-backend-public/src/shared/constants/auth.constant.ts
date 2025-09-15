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
  Other: 'Other',
} as const;

export type GenderType = (typeof Gender)[keyof typeof Gender];

export const ActivityLevel = {
  Sedentary: 'Sedentary',
  Light: 'Lightly',
  Moderate: 'Moderate',
  Active: 'Active',
  VeryActive: 'VeryActive',
} as const;

export type ActivityLevelType =
  (typeof ActivityLevel)[keyof typeof ActivityLevel];
