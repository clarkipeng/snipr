/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type FriendRequest = {
  __typename: "FriendRequest",
  createdAt: string,
  id: string,
  receiver?: UserProfile | null,
  receiverId: string,
  sender?: UserProfile | null,
  senderId: string,
  updatedAt: string,
};

export type UserProfile = {
  __typename: "UserProfile",
  createdAt: string,
  email: string,
  friends?: ModelFriendshipConnection | null,
  id: string,
  name: string,
  owner?: string | null,
  profilePicture?: string | null,
  receivedRequests?: ModelFriendRequestConnection | null,
  sentRequests?: ModelFriendRequestConnection | null,
  snipesMade?: ModelSnipeConnection | null,
  snipesReceived?: ModelSnipeConnection | null,
  updatedAt: string,
};

export type ModelFriendshipConnection = {
  __typename: "ModelFriendshipConnection",
  items:  Array<Friendship | null >,
  nextToken?: string | null,
};

export type Friendship = {
  __typename: "Friendship",
  createdAt: string,
  friendId: string,
  id: string,
  updatedAt: string,
  user?: UserProfile | null,
  userId: string,
};

export type ModelFriendRequestConnection = {
  __typename: "ModelFriendRequestConnection",
  items:  Array<FriendRequest | null >,
  nextToken?: string | null,
};

export type ModelSnipeConnection = {
  __typename: "ModelSnipeConnection",
  items:  Array<Snipe | null >,
  nextToken?: string | null,
};

export type Snipe = {
  __typename: "Snipe",
  caption?: string | null,
  createdAt: string,
  id: string,
  imageKey: string,
  owner?: string | null,
  sniper?: UserProfile | null,
  sniperId: string,
  target?: UserProfile | null,
  targetId: string,
  updatedAt: string,
};

export type ModelFriendRequestFilterInput = {
  and?: Array< ModelFriendRequestFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelFriendRequestFilterInput | null,
  or?: Array< ModelFriendRequestFilterInput | null > | null,
  receiverId?: ModelIDInput | null,
  senderId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelFriendshipFilterInput = {
  and?: Array< ModelFriendshipFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  friendId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelFriendshipFilterInput | null,
  or?: Array< ModelFriendshipFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelIDInput | null,
};

export type ModelSnipeFilterInput = {
  and?: Array< ModelSnipeFilterInput | null > | null,
  caption?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  imageKey?: ModelStringInput | null,
  not?: ModelSnipeFilterInput | null,
  or?: Array< ModelSnipeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sniperId?: ModelIDInput | null,
  targetId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserProfileFilterInput = {
  and?: Array< ModelUserProfileFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelUserProfileFilterInput | null,
  or?: Array< ModelUserProfileFilterInput | null > | null,
  owner?: ModelStringInput | null,
  profilePicture?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection",
  items:  Array<UserProfile | null >,
  nextToken?: string | null,
};

export type ModelFriendRequestConditionInput = {
  and?: Array< ModelFriendRequestConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  not?: ModelFriendRequestConditionInput | null,
  or?: Array< ModelFriendRequestConditionInput | null > | null,
  receiverId?: ModelIDInput | null,
  senderId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateFriendRequestInput = {
  id?: string | null,
  receiverId: string,
  senderId: string,
};

export type ModelFriendshipConditionInput = {
  and?: Array< ModelFriendshipConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  friendId?: ModelStringInput | null,
  not?: ModelFriendshipConditionInput | null,
  or?: Array< ModelFriendshipConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelIDInput | null,
};

export type CreateFriendshipInput = {
  friendId: string,
  id?: string | null,
  userId: string,
};

export type ModelSnipeConditionInput = {
  and?: Array< ModelSnipeConditionInput | null > | null,
  caption?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  imageKey?: ModelStringInput | null,
  not?: ModelSnipeConditionInput | null,
  or?: Array< ModelSnipeConditionInput | null > | null,
  owner?: ModelStringInput | null,
  sniperId?: ModelIDInput | null,
  targetId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateSnipeInput = {
  caption?: string | null,
  id?: string | null,
  imageKey: string,
  sniperId: string,
  targetId: string,
};

export type ModelUserProfileConditionInput = {
  and?: Array< ModelUserProfileConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelUserProfileConditionInput | null,
  or?: Array< ModelUserProfileConditionInput | null > | null,
  owner?: ModelStringInput | null,
  profilePicture?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateUserProfileInput = {
  email: string,
  id?: string | null,
  name: string,
  profilePicture?: string | null,
};

export type DeleteFriendRequestInput = {
  id: string,
};

export type DeleteFriendshipInput = {
  id: string,
};

export type DeleteSnipeInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type UpdateFriendRequestInput = {
  id: string,
  receiverId?: string | null,
  senderId?: string | null,
};

export type UpdateFriendshipInput = {
  friendId?: string | null,
  id: string,
  userId?: string | null,
};

export type UpdateSnipeInput = {
  caption?: string | null,
  id: string,
  imageKey?: string | null,
  sniperId?: string | null,
  targetId?: string | null,
};

export type UpdateUserProfileInput = {
  email?: string | null,
  id: string,
  name?: string | null,
  profilePicture?: string | null,
};

export type ModelSubscriptionFriendRequestFilterInput = {
  and?: Array< ModelSubscriptionFriendRequestFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionFriendRequestFilterInput | null > | null,
  receiverId?: ModelSubscriptionIDInput | null,
  senderId?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionFriendshipFilterInput = {
  and?: Array< ModelSubscriptionFriendshipFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  friendId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionFriendshipFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionIDInput | null,
};

export type ModelSubscriptionSnipeFilterInput = {
  and?: Array< ModelSubscriptionSnipeFilterInput | null > | null,
  caption?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  imageKey?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionSnipeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sniperId?: ModelSubscriptionIDInput | null,
  targetId?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserProfileFilterInput = {
  and?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  owner?: ModelStringInput | null,
  profilePicture?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type GetFriendRequestQueryVariables = {
  id: string,
};

export type GetFriendRequestQuery = {
  getFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type GetFriendshipQueryVariables = {
  id: string,
};

export type GetFriendshipQuery = {
  getFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type GetSnipeQueryVariables = {
  id: string,
};

export type GetSnipeQuery = {
  getSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type GetUserProfileQueryVariables = {
  id: string,
};

export type GetUserProfileQuery = {
  getUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type ListFriendRequestsQueryVariables = {
  filter?: ModelFriendRequestFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFriendRequestsQuery = {
  listFriendRequests?:  {
    __typename: "ModelFriendRequestConnection",
    items:  Array< {
      __typename: "FriendRequest",
      createdAt: string,
      id: string,
      receiverId: string,
      senderId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListFriendshipsQueryVariables = {
  filter?: ModelFriendshipFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFriendshipsQuery = {
  listFriendships?:  {
    __typename: "ModelFriendshipConnection",
    items:  Array< {
      __typename: "Friendship",
      createdAt: string,
      friendId: string,
      id: string,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSnipesQueryVariables = {
  filter?: ModelSnipeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSnipesQuery = {
  listSnipes?:  {
    __typename: "ModelSnipeConnection",
    items:  Array< {
      __typename: "Snipe",
      caption?: string | null,
      createdAt: string,
      id: string,
      imageKey: string,
      owner?: string | null,
      sniperId: string,
      targetId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserProfilesQueryVariables = {
  filter?: ModelUserProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserProfilesQuery = {
  listUserProfiles?:  {
    __typename: "ModelUserProfileConnection",
    items:  Array< {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateFriendRequestMutationVariables = {
  condition?: ModelFriendRequestConditionInput | null,
  input: CreateFriendRequestInput,
};

export type CreateFriendRequestMutation = {
  createFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type CreateFriendshipMutationVariables = {
  condition?: ModelFriendshipConditionInput | null,
  input: CreateFriendshipInput,
};

export type CreateFriendshipMutation = {
  createFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type CreateSnipeMutationVariables = {
  condition?: ModelSnipeConditionInput | null,
  input: CreateSnipeInput,
};

export type CreateSnipeMutation = {
  createSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type CreateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: CreateUserProfileInput,
};

export type CreateUserProfileMutation = {
  createUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type DeleteFriendRequestMutationVariables = {
  condition?: ModelFriendRequestConditionInput | null,
  input: DeleteFriendRequestInput,
};

export type DeleteFriendRequestMutation = {
  deleteFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type DeleteFriendshipMutationVariables = {
  condition?: ModelFriendshipConditionInput | null,
  input: DeleteFriendshipInput,
};

export type DeleteFriendshipMutation = {
  deleteFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type DeleteSnipeMutationVariables = {
  condition?: ModelSnipeConditionInput | null,
  input: DeleteSnipeInput,
};

export type DeleteSnipeMutation = {
  deleteSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: DeleteUserProfileInput,
};

export type DeleteUserProfileMutation = {
  deleteUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type UpdateFriendRequestMutationVariables = {
  condition?: ModelFriendRequestConditionInput | null,
  input: UpdateFriendRequestInput,
};

export type UpdateFriendRequestMutation = {
  updateFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type UpdateFriendshipMutationVariables = {
  condition?: ModelFriendshipConditionInput | null,
  input: UpdateFriendshipInput,
};

export type UpdateFriendshipMutation = {
  updateFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type UpdateSnipeMutationVariables = {
  condition?: ModelSnipeConditionInput | null,
  input: UpdateSnipeInput,
};

export type UpdateSnipeMutation = {
  updateSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: UpdateUserProfileInput,
};

export type UpdateUserProfileMutation = {
  updateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnCreateFriendRequestSubscriptionVariables = {
  filter?: ModelSubscriptionFriendRequestFilterInput | null,
};

export type OnCreateFriendRequestSubscription = {
  onCreateFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type OnCreateFriendshipSubscriptionVariables = {
  filter?: ModelSubscriptionFriendshipFilterInput | null,
};

export type OnCreateFriendshipSubscription = {
  onCreateFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type OnCreateSnipeSubscriptionVariables = {
  filter?: ModelSubscriptionSnipeFilterInput | null,
  owner?: string | null,
};

export type OnCreateSnipeSubscription = {
  onCreateSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserProfileSubscription = {
  onCreateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteFriendRequestSubscriptionVariables = {
  filter?: ModelSubscriptionFriendRequestFilterInput | null,
};

export type OnDeleteFriendRequestSubscription = {
  onDeleteFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFriendshipSubscriptionVariables = {
  filter?: ModelSubscriptionFriendshipFilterInput | null,
};

export type OnDeleteFriendshipSubscription = {
  onDeleteFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type OnDeleteSnipeSubscriptionVariables = {
  filter?: ModelSubscriptionSnipeFilterInput | null,
  owner?: string | null,
};

export type OnDeleteSnipeSubscription = {
  onDeleteSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserProfileSubscription = {
  onDeleteUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateFriendRequestSubscriptionVariables = {
  filter?: ModelSubscriptionFriendRequestFilterInput | null,
};

export type OnUpdateFriendRequestSubscription = {
  onUpdateFriendRequest?:  {
    __typename: "FriendRequest",
    createdAt: string,
    id: string,
    receiver?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    receiverId: string,
    sender?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    senderId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFriendshipSubscriptionVariables = {
  filter?: ModelSubscriptionFriendshipFilterInput | null,
};

export type OnUpdateFriendshipSubscription = {
  onUpdateFriendship?:  {
    __typename: "Friendship",
    createdAt: string,
    friendId: string,
    id: string,
    updatedAt: string,
    user?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    userId: string,
  } | null,
};

export type OnUpdateSnipeSubscriptionVariables = {
  filter?: ModelSubscriptionSnipeFilterInput | null,
  owner?: string | null,
};

export type OnUpdateSnipeSubscription = {
  onUpdateSnipe?:  {
    __typename: "Snipe",
    caption?: string | null,
    createdAt: string,
    id: string,
    imageKey: string,
    owner?: string | null,
    sniper?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    sniperId: string,
    target?:  {
      __typename: "UserProfile",
      createdAt: string,
      email: string,
      id: string,
      name: string,
      owner?: string | null,
      profilePicture?: string | null,
      updatedAt: string,
    } | null,
    targetId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserProfileSubscription = {
  onUpdateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email: string,
    friends?:  {
      __typename: "ModelFriendshipConnection",
      nextToken?: string | null,
    } | null,
    id: string,
    name: string,
    owner?: string | null,
    profilePicture?: string | null,
    receivedRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    sentRequests?:  {
      __typename: "ModelFriendRequestConnection",
      nextToken?: string | null,
    } | null,
    snipesMade?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    snipesReceived?:  {
      __typename: "ModelSnipeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};
