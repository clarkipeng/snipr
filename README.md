# Snipr

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
   - Scan QR code for Expo Go on your phone

## For Most Developers (no AWS setup needed)

If someone on the team already has a sandbox running, just:

1. Get the `amplify_outputs.json` file from that teammate
2. Drop it in the project root
3. `npm install`
4. `npx expo start`

That's it — you'll connect to the shared backend.

## Notes

- `amplify_outputs.json` is gitignored — get it from a teammate or generate your own.
- The sandbox owner must keep `npm run amplify:sandbox` running for schema changes to auto-deploy.
- Do **not** commit `.env` or `~/.aws/credentials`.
