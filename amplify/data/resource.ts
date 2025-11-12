import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      income: a.float(),
      firstName: a.string().default(''),
      lastName: a.string().default(''),
      email: a.string(),
      savingsGoal: a.float(),
      variableBudgets: a.json(),
      fixedBudgets: a.json(),
      joinedChallenges: a.json(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated() // Any authenticated user can access
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
