export const Goal = {
  GainWeight: 'GainWeight',
  LoseWeight: 'LoseWeight',
  MaintainWeight: 'MaintainWeight',
} as const;
export type GoalType = (typeof Goal)[keyof typeof Goal];