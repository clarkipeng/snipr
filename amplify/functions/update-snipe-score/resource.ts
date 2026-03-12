import { defineFunction } from '@aws-amplify/backend';

export const updateSnipeScoreFunction = defineFunction({
  name: 'update-snipe-score',
  entry: './handler.ts',
  resourceGroupName: 'data',
});

