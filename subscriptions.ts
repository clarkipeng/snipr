/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateFriendRequest = /* GraphQL */ `subscription OnCreateFriendRequest(
  $filter: ModelSubscriptionFriendRequestFilterInput
) {
  onCreateFriendRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateFriendRequestSubscriptionVariables,
  APITypes.OnCreateFriendRequestSubscription
>;
export const onCreateFriendship = /* GraphQL */ `subscription OnCreateFriendship(
  $filter: ModelSubscriptionFriendshipFilterInput
) {
  onCreateFriendship(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateFriendshipSubscriptionVariables,
  APITypes.OnCreateFriendshipSubscription
>;
export const onCreateGroup = /* GraphQL */ `subscription OnCreateGroup($filter: ModelSubscriptionGroupFilterInput) {
  onCreateGroup(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateGroupSubscriptionVariables,
  APITypes.OnCreateGroupSubscription
>;
export const onCreateGroupMember = /* GraphQL */ `subscription OnCreateGroupMember(
  $filter: ModelSubscriptionGroupMemberFilterInput
) {
  onCreateGroupMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateGroupMemberSubscriptionVariables,
  APITypes.OnCreateGroupMemberSubscription
>;
export const onCreateMessage = /* GraphQL */ `subscription OnCreateMessage($filter: ModelSubscriptionMessageFilterInput) {
  onCreateMessage(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateMessageSubscriptionVariables,
  APITypes.OnCreateMessageSubscription
>;
export const onCreateSnipe = /* GraphQL */ `subscription OnCreateSnipe(
  $filter: ModelSubscriptionSnipeFilterInput
  $owner: String
) {
  onCreateSnipe(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSnipeSubscriptionVariables,
  APITypes.OnCreateSnipeSubscription
>;
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onCreateUserProfile(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
>;
export const onDeleteFriendRequest = /* GraphQL */ `subscription OnDeleteFriendRequest(
  $filter: ModelSubscriptionFriendRequestFilterInput
) {
  onDeleteFriendRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteFriendRequestSubscriptionVariables,
  APITypes.OnDeleteFriendRequestSubscription
>;
export const onDeleteFriendship = /* GraphQL */ `subscription OnDeleteFriendship(
  $filter: ModelSubscriptionFriendshipFilterInput
) {
  onDeleteFriendship(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteFriendshipSubscriptionVariables,
  APITypes.OnDeleteFriendshipSubscription
>;
export const onDeleteGroup = /* GraphQL */ `subscription OnDeleteGroup($filter: ModelSubscriptionGroupFilterInput) {
  onDeleteGroup(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteGroupSubscriptionVariables,
  APITypes.OnDeleteGroupSubscription
>;
export const onDeleteGroupMember = /* GraphQL */ `subscription OnDeleteGroupMember(
  $filter: ModelSubscriptionGroupMemberFilterInput
) {
  onDeleteGroupMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteGroupMemberSubscriptionVariables,
  APITypes.OnDeleteGroupMemberSubscription
>;
export const onDeleteMessage = /* GraphQL */ `subscription OnDeleteMessage($filter: ModelSubscriptionMessageFilterInput) {
  onDeleteMessage(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteMessageSubscriptionVariables,
  APITypes.OnDeleteMessageSubscription
>;
export const onDeleteSnipe = /* GraphQL */ `subscription OnDeleteSnipe(
  $filter: ModelSubscriptionSnipeFilterInput
  $owner: String
) {
  onDeleteSnipe(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSnipeSubscriptionVariables,
  APITypes.OnDeleteSnipeSubscription
>;
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onDeleteUserProfile(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
>;
export const onUpdateFriendRequest = /* GraphQL */ `subscription OnUpdateFriendRequest(
  $filter: ModelSubscriptionFriendRequestFilterInput
) {
  onUpdateFriendRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateFriendRequestSubscriptionVariables,
  APITypes.OnUpdateFriendRequestSubscription
>;
export const onUpdateFriendship = /* GraphQL */ `subscription OnUpdateFriendship(
  $filter: ModelSubscriptionFriendshipFilterInput
) {
  onUpdateFriendship(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateFriendshipSubscriptionVariables,
  APITypes.OnUpdateFriendshipSubscription
>;
export const onUpdateGroup = /* GraphQL */ `subscription OnUpdateGroup($filter: ModelSubscriptionGroupFilterInput) {
  onUpdateGroup(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateGroupSubscriptionVariables,
  APITypes.OnUpdateGroupSubscription
>;
export const onUpdateGroupMember = /* GraphQL */ `subscription OnUpdateGroupMember(
  $filter: ModelSubscriptionGroupMemberFilterInput
) {
  onUpdateGroupMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateGroupMemberSubscriptionVariables,
  APITypes.OnUpdateGroupMemberSubscription
>;
export const onUpdateMessage = /* GraphQL */ `subscription OnUpdateMessage($filter: ModelSubscriptionMessageFilterInput) {
  onUpdateMessage(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateMessageSubscriptionVariables,
  APITypes.OnUpdateMessageSubscription
>;
export const onUpdateSnipe = /* GraphQL */ `subscription OnUpdateSnipe(
  $filter: ModelSubscriptionSnipeFilterInput
  $owner: String
) {
  onUpdateSnipe(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSnipeSubscriptionVariables,
  APITypes.OnUpdateSnipeSubscription
>;
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onUpdateUserProfile(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
