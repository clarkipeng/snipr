import { defineFunction } from '@aws-amplify/backend';

export const createSnipeFunction = defineFunction({
    name: 'create-snipe',
    entry: './handler.ts',
    resourceGroupName: 'data'
});
