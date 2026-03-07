import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createSnipeFunction } from './functions/create-snipe/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createSnipeFunction,
});

const snipeLambda = backend.createSnipeFunction.resources.lambda as any;
const tables = backend.data.resources.tables;

// Grant read/write to tables
tables['Snipe'].grantReadWriteData(snipeLambda);
tables['Message'].grantReadWriteData(snipeLambda);
tables['GroupMember'].grantReadData(snipeLambda);
tables['UserProfile'].grantReadData(snipeLambda);

// Set environment variables for the Lambda
snipeLambda.addEnvironment('SNIPE_TABLE_NAME', tables['Snipe'].tableName);
snipeLambda.addEnvironment('MESSAGE_TABLE_NAME', tables['Message'].tableName);
snipeLambda.addEnvironment('GROUP_MEMBER_TABLE_NAME', tables['GroupMember'].tableName);
snipeLambda.addEnvironment('USER_PROFILE_TABLE_NAME', tables['UserProfile'].tableName);

