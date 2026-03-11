import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { acceptFriendRequestFunction } from "./functions/accept-friend-request/resource";
import { createSnipeFunction } from "./functions/create-snipe/resource";
import { searchUsersFunction } from "./functions/search-users/resource";
import { updateSnipeScoreFunction } from "./functions/update-snipe-score/resource";
import { storage } from "./storage/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createSnipeFunction,
  acceptFriendRequestFunction,
  searchUsersFunction,
  updateSnipeScoreFunction,
});

const snipeLambda = backend.createSnipeFunction.resources.lambda as any;
const acceptFriendLambda =
  backend.acceptFriendRequestFunction.resources.lambda as any;
const updateSnipeScoreLambda =
  backend.updateSnipeScoreFunction.resources.lambda as any;
const tables = backend.data.resources.tables;

// Grant read/write to tables for create-snipe
tables["Snipe"].grantReadWriteData(snipeLambda);
tables["Snipe"].grantReadWriteData(updateSnipeScoreLambda);
tables["Message"].grantReadWriteData(snipeLambda);
tables["GroupMember"].grantReadData(snipeLambda);
tables["UserProfile"].grantReadData(snipeLambda);

snipeLambda.addEnvironment("SNIPE_TABLE_NAME", tables["Snipe"].tableName);
updateSnipeScoreLambda.addEnvironment(
  "SNIPE_TABLE_NAME",
  tables["Snipe"].tableName,
);
snipeLambda.addEnvironment("MESSAGE_TABLE_NAME", tables["Message"].tableName);
snipeLambda.addEnvironment(
  "GROUP_MEMBER_TABLE_NAME",
  tables["GroupMember"].tableName,
);
snipeLambda.addEnvironment(
  "USER_PROFILE_TABLE_NAME",
  tables["UserProfile"].tableName,
);

// Grant permissions for accept-friend-request (read FriendRequest + UserProfile, write Friendship + FriendRequest)
tables["FriendRequest"].grantReadWriteData(acceptFriendLambda);
tables["Friendship"].grantReadWriteData(acceptFriendLambda);
tables["UserProfile"].grantReadData(acceptFriendLambda);

acceptFriendLambda.addEnvironment(
  "FRIEND_REQUEST_TABLE_NAME",
  tables["FriendRequest"].tableName,
);
acceptFriendLambda.addEnvironment(
  "FRIENDSHIP_TABLE_NAME",
  tables["Friendship"].tableName,
);
acceptFriendLambda.addEnvironment(
  "USER_PROFILE_TABLE_NAME",
  tables["UserProfile"].tableName,
);

// Grant read UserProfile for search-users
const searchUsersLambda = backend.searchUsersFunction.resources.lambda as any;
tables["UserProfile"].grantReadData(searchUsersLambda);
searchUsersLambda.addEnvironment(
  "USER_PROFILE_TABLE_NAME",
  tables["UserProfile"].tableName,
);
