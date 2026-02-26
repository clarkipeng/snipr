/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getFriendRequest = /* GraphQL */ `query GetFriendRequest($id: ID!) {
  getFriendRequest(id: $id) {
    createdAt
    id
    receiver {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    receiverId
    sender {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    senderId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFriendRequestQueryVariables,
  APITypes.GetFriendRequestQuery
>;
export const getFriendship = /* GraphQL */ `query GetFriendship($id: ID!) {
  getFriendship(id: $id) {
    createdAt
    friendId
    id
    updatedAt
    user {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFriendshipQueryVariables,
  APITypes.GetFriendshipQuery
>;
export const getSnipe = /* GraphQL */ `query GetSnipe($id: ID!) {
  getSnipe(id: $id) {
    caption
    createdAt
    id
    imageKey
    owner
    sniper {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    sniperId
    target {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    targetId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetSnipeQueryVariables, APITypes.GetSnipeQuery>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    createdAt
    email
    friends {
      nextToken
      __typename
    }
    id
    name
    owner
    profilePicture
    receivedRequests {
      nextToken
      __typename
    }
    sentRequests {
      nextToken
      __typename
    }
    snipesMade {
      nextToken
      __typename
    }
    snipesReceived {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const listFriendRequests = /* GraphQL */ `query ListFriendRequests(
  $filter: ModelFriendRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  listFriendRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      id
      receiverId
      senderId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFriendRequestsQueryVariables,
  APITypes.ListFriendRequestsQuery
>;
export const listFriendships = /* GraphQL */ `query ListFriendships(
  $filter: ModelFriendshipFilterInput
  $limit: Int
  $nextToken: String
) {
  listFriendships(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      friendId
      id
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFriendshipsQueryVariables,
  APITypes.ListFriendshipsQuery
>;
export const listSnipes = /* GraphQL */ `query ListSnipes(
  $filter: ModelSnipeFilterInput
  $limit: Int
  $nextToken: String
) {
  listSnipes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      caption
      createdAt
      id
      imageKey
      owner
      sniperId
      targetId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSnipesQueryVariables,
  APITypes.ListSnipesQuery
>;
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;
