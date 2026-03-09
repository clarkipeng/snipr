import { defineFunction } from '@aws-amplify/backend';

export const searchUsersFunction = defineFunction({
  name: 'search-users',
  entry: './handler.ts',
  resourceGroupName: 'data',
});
