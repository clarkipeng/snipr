/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createFriendRequest = /* GraphQL */ `mutation CreateFriendRequest(
  $condition: ModelFriendRequestConditionInput
  $input: CreateFriendRequestInput!
) {
  createFriendRequest(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateFriendRequestMutationVariables,
  APITypes.CreateFriendRequestMutation
>;
export const createFriendship = /* GraphQL */ `mutation CreateFriendship(
  $condition: ModelFriendshipConditionInput
  $input: CreateFriendshipInput!
) {
  createFriendship(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateFriendshipMutationVariables,
  APITypes.CreateFriendshipMutation
>;
export const createSnipe = /* GraphQL */ `mutation CreateSnipe(
  $condition: ModelSnipeConditionInput
  $input: CreateSnipeInput!
) {
  createSnipe(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateSnipeMutationVariables,
  APITypes.CreateSnipeMutation
>;
export const createUserProfile = /* GraphQL */ `mutation CreateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: CreateUserProfileInput!
) {
  createUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;
export const deleteFriendRequest = /* GraphQL */ `mutation DeleteFriendRequest(
  $condition: ModelFriendRequestConditionInput
  $input: DeleteFriendRequestInput!
) {
  deleteFriendRequest(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteFriendRequestMutationVariables,
  APITypes.DeleteFriendRequestMutation
>;
export const deleteFriendship = /* GraphQL */ `mutation DeleteFriendship(
  $condition: ModelFriendshipConditionInput
  $input: DeleteFriendshipInput!
) {
  deleteFriendship(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteFriendshipMutationVariables,
  APITypes.DeleteFriendshipMutation
>;
export const deleteSnipe = /* GraphQL */ `mutation DeleteSnipe(
  $condition: ModelSnipeConditionInput
  $input: DeleteSnipeInput!
) {
  deleteSnipe(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteSnipeMutationVariables,
  APITypes.DeleteSnipeMutation
>;
export const deleteUserProfile = /* GraphQL */ `mutation DeleteUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: DeleteUserProfileInput!
) {
  deleteUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteUserProfileMutationVariables,
  APITypes.DeleteUserProfileMutation
>;
export const updateFriendRequest = /* GraphQL */ `mutation UpdateFriendRequest(
  $condition: ModelFriendRequestConditionInput
  $input: UpdateFriendRequestInput!
) {
  updateFriendRequest(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateFriendRequestMutationVariables,
  APITypes.UpdateFriendRequestMutation
>;
export const updateFriendship = /* GraphQL */ `mutation UpdateFriendship(
  $condition: ModelFriendshipConditionInput
  $input: UpdateFriendshipInput!
) {
  updateFriendship(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateFriendshipMutationVariables,
  APITypes.UpdateFriendshipMutation
>;
export const updateSnipe = /* GraphQL */ `mutation UpdateSnipe(
  $condition: ModelSnipeConditionInput
  $input: UpdateSnipeInput!
) {
  updateSnipe(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateSnipeMutationVariables,
  APITypes.UpdateSnipeMutation
>;
export const updateUserProfile = /* GraphQL */ `mutation UpdateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: UpdateUserProfileInput!
) {
  updateUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;
