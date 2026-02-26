import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";
import { initSchema } from "@aws-amplify/datastore";

import { schema } from "./schema";



type EagerUserProfileModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly profilePicture?: string | null;
  readonly friends?: (FriendshipModel | null)[] | null;
  readonly sentRequests?: (FriendRequestModel | null)[] | null;
  readonly receivedRequests?: (FriendRequestModel | null)[] | null;
  readonly snipesMade?: (SnipeModel | null)[] | null;
  readonly snipesReceived?: (SnipeModel | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserProfileModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly profilePicture?: string | null;
  readonly friends: AsyncCollection<FriendshipModel>;
  readonly sentRequests: AsyncCollection<FriendRequestModel>;
  readonly receivedRequests: AsyncCollection<FriendRequestModel>;
  readonly snipesMade: AsyncCollection<SnipeModel>;
  readonly snipesReceived: AsyncCollection<SnipeModel>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserProfileModel = LazyLoading extends LazyLoadingDisabled ? EagerUserProfileModel : LazyUserProfileModel

export declare const UserProfileModel: (new (init: ModelInit<UserProfileModel>) => UserProfileModel) & {
  copyOf(source: UserProfileModel, mutator: (draft: MutableModel<UserProfileModel>) => MutableModel<UserProfileModel> | void): UserProfileModel;
}

type EagerFriendshipModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Friendship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId: string;
  readonly friendId: string;
  readonly user?: UserProfileModel | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFriendshipModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Friendship, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId: string;
  readonly friendId: string;
  readonly user: AsyncItem<UserProfileModel | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type FriendshipModel = LazyLoading extends LazyLoadingDisabled ? EagerFriendshipModel : LazyFriendshipModel

export declare const FriendshipModel: (new (init: ModelInit<FriendshipModel>) => FriendshipModel) & {
  copyOf(source: FriendshipModel, mutator: (draft: MutableModel<FriendshipModel>) => MutableModel<FriendshipModel> | void): FriendshipModel;
}

type EagerFriendRequestModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<FriendRequest, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly senderId: string;
  readonly receiverId: string;
  readonly sender?: UserProfileModel | null;
  readonly receiver?: UserProfileModel | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFriendRequestModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<FriendRequest, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly senderId: string;
  readonly receiverId: string;
  readonly sender: AsyncItem<UserProfileModel | undefined>;
  readonly receiver: AsyncItem<UserProfileModel | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type FriendRequestModel = LazyLoading extends LazyLoadingDisabled ? EagerFriendRequestModel : LazyFriendRequestModel

export declare const FriendRequestModel: (new (init: ModelInit<FriendRequestModel>) => FriendRequestModel) & {
  copyOf(source: FriendRequestModel, mutator: (draft: MutableModel<FriendRequestModel>) => MutableModel<FriendRequestModel> | void): FriendRequestModel;
}

type EagerSnipeModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Snipe, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly sniperId: string;
  readonly targetId: string;
  readonly imageKey: string;
  readonly caption?: string | null;
  readonly sniper?: UserProfileModel | null;
  readonly target?: UserProfileModel | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySnipeModel = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Snipe, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly sniperId: string;
  readonly targetId: string;
  readonly imageKey: string;
  readonly caption?: string | null;
  readonly sniper: AsyncItem<UserProfileModel | undefined>;
  readonly target: AsyncItem<UserProfileModel | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type SnipeModel = LazyLoading extends LazyLoadingDisabled ? EagerSnipeModel : LazySnipeModel

export declare const SnipeModel: (new (init: ModelInit<SnipeModel>) => SnipeModel) & {
  copyOf(source: SnipeModel, mutator: (draft: MutableModel<SnipeModel>) => MutableModel<SnipeModel> | void): SnipeModel;
}



const { UserProfile, Friendship, FriendRequest, Snipe } = initSchema(schema) as {
  UserProfile: PersistentModelConstructor<UserProfileModel>;
  Friendship: PersistentModelConstructor<FriendshipModel>;
  FriendRequest: PersistentModelConstructor<FriendRequestModel>;
  Snipe: PersistentModelConstructor<SnipeModel>;
};

export {
  UserProfile,
  Friendship,
  FriendRequest,
  Snipe
};