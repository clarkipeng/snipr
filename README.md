# Snipr

A gamified social photography app where users "snipe" friends by taking photos of them. Snipes are shared in mutual friend groups, tracked on leaderboards, and used to build domination streaks.

## Features

- **Authentication** — Email/password sign-up and login via AWS Cognito, with email confirmation and password reset
- **Sniping (Core)** — Take a photo with the in-app camera, select a target friend, add an optional caption, and send a snipe
- **Mission Feed** — View all snipes involving you and your friends, sorted chronologically
- **Friends** — Send, accept, and reject friend requests; search for users by name or email; unfriend
- **Groups & Group Chat** — Create groups with friends, send text messages, and have snipes auto-broadcast to any groups shared between the sniper and target
- **Group Leaderboard** — Ranked snipe scores per group, with "domination" tracking (3+ consecutive snipes against the same person)
- **User Profiles** — Profile pictures, snipe counts, top snipers, and recent snipe previews

## Tech Stack

| Layer             | Technology               |
| ----------------- | ------------------------ |
| Mobile Framework  | React Native + Expo      |
| Language          | TypeScript               |
| Navigation        | Expo Router (file-based) |
| Authentication    | AWS Cognito              |
| API               | AWS AppSync (GraphQL)    |
| Database          | AWS DynamoDB             |
| Server-Side Logic | AWS Lambda (Node.js)     |
| File Storage      | AWS S3                   |
| Infrastructure    | AWS Amplify Gen 2 + CDK  |

## Architecture

The backend uses AWS Amplify Gen 2. Amplify provisions the infrastructure (DynamoDB tables, AppSync API, Cognito user pool, S3 bucket) and auto-generates basic CRUD resolvers. On top of that, three custom Lambda functions implement the app's core business logic:

- **`createSnipe`** — Resolves the sniper's profile from their Cognito identity, creates a Snipe record, queries group memberships for both the sniper and target, finds shared groups, and creates a Message record in each shared group — all in a single server-side operation.
- **`acceptFriendRequest`** — Uses a DynamoDB `TransactWrite` to atomically create two bidirectional Friendship records and delete the FriendRequest in one ACID-compliant operation.
- **`searchUsers`** — Scans the UserProfile table and filters results by name or email substring match (case-insensitive).

The leaderboard's domination scoring (ranking users and detecting 3+ consecutive snipes against the same target) is computed client-side from snipe history fetched from the server.

## Prerequisites

- Node.js installed
- An AWS account with access keys

## AWS Setup (one-time per developer)

1. Install the AWS CLI:

   ```bash
   brew install awscli
   ```

2. Create an IAM user in the [AWS Console](https://console.aws.amazon.com/iam/):
   - Go to **Users** > **Create user**
   - Name it (e.g. `snipr-dev`)
   - **Attach policies directly** > check **`AdministratorAccess`**
   - Create the user, then go to **Security credentials** > **Create access key** > **CLI**
   - Copy the Access Key ID and Secret Access Key

3. Configure credentials locally:

   ```bash
   aws configure
   ```

   Enter your Access Key ID, Secret Access Key, region `us-west-2`, output `json`.

4. Bootstrap CDK (one-time per account/region):

   ```bash
   npx cdk bootstrap aws://<YOUR_ACCOUNT_ID>/us-west-2
   ```

   Find your account ID by running `aws sts get-caller-identity`.

## Running the App

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Amplify sandbox (keep this terminal running):

   ```bash
   npm run amplify:sandbox
   ```

   This deploys backend resources and generates `amplify_outputs.json`.

3. In a **new terminal**, start the app:

   ```bash
   npx expo start
   ```

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web
   - Scan QR code with the Expo Go app on your phone

### Push notifications: use `npx expo run:ios` (not `npx expo start`)

Push notifications (e.g. “you were sniped”) **do not work** when you use `npx expo start` and open the app in **Expo Go** or the iOS Simulator. You need a **development build** on a **physical iPhone**:

- **`npx expo start`** starts the Metro bundler; you then run the app inside Expo Go (or press `i` for the simulator). Expo Go is a pre-built app with a fixed set of native modules—it does not include the native code required for push notifications (or for AWS Amplify auth). The iOS Simulator also cannot receive push notifications.
- **`npx expo run:ios`** builds and runs your own native app that includes all your project’s native dependencies. Auth and push work there. Use a **physical device** for push (simulator cannot receive pushes).

One-time setup, then run on your iPhone:

```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:ios --device
```

Pick your iPhone when prompted. After the app is on your phone, sign in and allow notifications; the app will register your push token and you’ll receive snipes and other pushes.
w

## For Graders / Teammates (no AWS setup needed)

If a sandbox is already running, you only need:

1. Get the `amplify_outputs.json` file from a team member and place it in the project root
2. Run `npm install`
3. Run `npx expo start`

You will connect to the shared backend automatically.

## Notes

- `amplify_outputs.json` is gitignored — get it from a teammate or generate your own via the sandbox.
- **Why does `amplify_outputs.json` keep changing?** When you run `npm run amplify:sandbox`, it runs in **watch mode**: it watches the `amplify/` folder and redeploys on any file change. Each deploy regenerates `amplify_outputs.json`. So editing anything under `amplify/` (or the sandbox syncing) will overwrite that file. To deploy once without watching (so the file isn’t overwritten again), use `npm run amplify:sandbox:once`.
- The sandbox owner must keep `npm run amplify:sandbox` running for schema changes to auto-deploy.
- Do **not** commit `.env` or `~/.aws/credentials`.
