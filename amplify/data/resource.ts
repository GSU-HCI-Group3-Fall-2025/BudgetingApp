import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.id().required(),
      income: a.float(),
      savingsGoal: a.float(),
      variableBudgets: a.customType({
        // Define the structure or leave flexible for any key-value pairs
      }),
      fixedBudgets: a.customType({
        // Define the structure or leave flexible for any key-value pairs  
      }),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
