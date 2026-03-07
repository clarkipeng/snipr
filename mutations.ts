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
    friend {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
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
export const createGroup = /* GraphQL */ `mutation CreateGroup(
  $condition: ModelGroupConditionInput
  $input: CreateGroupInput!
) {
  createGroup(condition: $condition, input: $input) {
    createdAt
    createdBy
    description
    id
    members {
      nextToken
      __typename
    }
    messages {
      nextToken
      __typename
    }
    name
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateGroupMutationVariables,
  APITypes.CreateGroupMutation
>;
export const createGroupMember = /* GraphQL */ `mutation CreateGroupMember(
  $condition: ModelGroupMemberConditionInput
  $input: CreateGroupMemberInput!
) {
  createGroupMember(condition: $condition, input: $input) {
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
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
  APITypes.CreateGroupMemberMutationVariables,
  APITypes.CreateGroupMemberMutation
>;
export const createMessage = /* GraphQL */ `mutation CreateMessage(
  $condition: ModelMessageConditionInput
  $input: CreateMessageInput!
) {
  createMessage(condition: $condition, input: $input) {
    content
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
    id
    isSystemMessage
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
    snipe {
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
    snipeId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateMessageMutationVariables,
  APITypes.CreateMessageMutation
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
    messages {
      nextToken
      __typename
    }
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
    friendOf {
      nextToken
      __typename
    }
    friends {
      nextToken
      __typename
    }
    groupMemberships {
      nextToken
      __typename
    }
    id
    messages {
      nextToken
      __typename
    }
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
    friend {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
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
export const deleteGroup = /* GraphQL */ `mutation DeleteGroup(
  $condition: ModelGroupConditionInput
  $input: DeleteGroupInput!
) {
  deleteGroup(condition: $condition, input: $input) {
    createdAt
    createdBy
    description
    id
    members {
      nextToken
      __typename
    }
    messages {
      nextToken
      __typename
    }
    name
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteGroupMutationVariables,
  APITypes.DeleteGroupMutation
>;
export const deleteGroupMember = /* GraphQL */ `mutation DeleteGroupMember(
  $condition: ModelGroupMemberConditionInput
  $input: DeleteGroupMemberInput!
) {
  deleteGroupMember(condition: $condition, input: $input) {
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
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
  APITypes.DeleteGroupMemberMutationVariables,
  APITypes.DeleteGroupMemberMutation
>;
export const deleteMessage = /* GraphQL */ `mutation DeleteMessage(
  $condition: ModelMessageConditionInput
  $input: DeleteMessageInput!
) {
  deleteMessage(condition: $condition, input: $input) {
    content
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
    id
    isSystemMessage
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
    snipe {
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
    snipeId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteMessageMutationVariables,
  APITypes.DeleteMessageMutation
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
    messages {
      nextToken
      __typename
    }
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
    friendOf {
      nextToken
      __typename
    }
    friends {
      nextToken
      __typename
    }
    groupMemberships {
      nextToken
      __typename
    }
    id
    messages {
      nextToken
      __typename
    }
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
    friend {
      createdAt
      email
      id
      name
      owner
      profilePicture
      updatedAt
      __typename
    }
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
export const updateGroup = /* GraphQL */ `mutation UpdateGroup(
  $condition: ModelGroupConditionInput
  $input: UpdateGroupInput!
) {
  updateGroup(condition: $condition, input: $input) {
    createdAt
    createdBy
    description
    id
    members {
      nextToken
      __typename
    }
    messages {
      nextToken
      __typename
    }
    name
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateGroupMutationVariables,
  APITypes.UpdateGroupMutation
>;
export const updateGroupMember = /* GraphQL */ `mutation UpdateGroupMember(
  $condition: ModelGroupMemberConditionInput
  $input: UpdateGroupMemberInput!
) {
  updateGroupMember(condition: $condition, input: $input) {
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
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
  APITypes.UpdateGroupMemberMutationVariables,
  APITypes.UpdateGroupMemberMutation
>;
export const updateMessage = /* GraphQL */ `mutation UpdateMessage(
  $condition: ModelMessageConditionInput
  $input: UpdateMessageInput!
) {
  updateMessage(condition: $condition, input: $input) {
    content
    createdAt
    group {
      createdAt
      createdBy
      description
      id
      name
      updatedAt
      __typename
    }
    groupId
    id
    isSystemMessage
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
    snipe {
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
    snipeId
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateMessageMutationVariables,
  APITypes.UpdateMessageMutation
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
    messages {
      nextToken
      __typename
    }
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
    friendOf {
      nextToken
      __typename
    }
    friends {
      nextToken
      __typename
    }
    groupMemberships {
      nextToken
      __typename
    }
    id
    messages {
      nextToken
      __typename
    }
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
