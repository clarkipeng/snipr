import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { createSnipeFunction } from '../functions/create-snipe/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  UserProfile: a
    .model({
      name: a.string().required(),
      email: a.string().required(),
      profilePicture: a.string(),
      friends: a.hasMany('Friendship', 'userId'),
      friendOf: a.hasMany('Friendship', 'friendId'),
      sentRequests: a.hasMany('FriendRequest', 'senderId'),
      receivedRequests: a.hasMany('FriendRequest', 'receiverId'),
      snipesMade: a.hasMany('Snipe', 'sniperId'),
      snipesReceived: a.hasMany('Snipe', 'targetId'),
      groupMemberships: a.hasMany('GroupMember', 'userId'),
      messages: a.hasMany('Message', 'senderId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  Friendship: a
    .model({
      userId: a.id().required(),
      friendId: a.string().required(),
      user: a.belongsTo('UserProfile', 'userId'),
      friend: a.belongsTo('UserProfile', 'friendId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  FriendRequest: a
    .model({
      senderId: a.id().required(),
      receiverId: a.id().required(),
      sender: a.belongsTo('UserProfile', 'senderId'),
      receiver: a.belongsTo('UserProfile', 'receiverId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  Snipe: a
    .model({
      sniperId: a.id().required(),
      targetId: a.id().required(),
      imageKey: a.string().required(),
      caption: a.string(),
      sniper: a.belongsTo('UserProfile', 'sniperId'),
      target: a.belongsTo('UserProfile', 'targetId'),
      messages: a.hasMany('Message', 'snipeId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  Group: a
    .model({
      name: a.string().required(),
      description: a.string(),
      createdBy: a.id().required(),
      members: a.hasMany('GroupMember', 'groupId'),
      messages: a.hasMany('Message', 'groupId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  GroupMember: a
    .model({
      groupId: a.id().required(),
      userId: a.id().required(),
      group: a.belongsTo('Group', 'groupId'),
      user: a.belongsTo('UserProfile', 'userId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  Message: a
    .model({
      groupId: a.id().required(),
      senderId: a.id().required(),
      content: a.string(),
      snipeId: a.id(),
      isSystemMessage: a.boolean(),
      group: a.belongsTo('Group', 'groupId'),
      sender: a.belongsTo('UserProfile', 'senderId'),
      snipe: a.belongsTo('Snipe', 'snipeId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  submitSnipe: a.mutation()
    .arguments({
      targetId: a.id().required(),
      imageKey: a.string().required(),
      caption: a.string(),
    })
    .returns(a.ref('Snipe'))
    .handler(a.handler.function(createSnipeFunction))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
