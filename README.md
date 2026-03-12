# Snipr

Snipr is a gamified social photography app where users "snipe" friends by taking photos of them. Snipes are shared in mutual friend groups, tracked on leaderboards, and used to build domination streaks.

## Project Summary

- **Auth:** Email/password authentication with AWS Cognito
- **Core flow:** Capture photo, pick target friend, submit snipe
- **Social features:** Friend requests, groups, group chat, leaderboards
- **Backend:** AWS Amplify Gen 2 (AppSync + DynamoDB + Lambda + S3)

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

## Reproducing This Project 

### 1) Prerequisites

- Node.js 20+ and npm
- AWS account and AWS CLI configured (`aws configure`) (We have sandbox server running so you don't have to)
- Expo Go app (to test mobile)

### 2) Extract and install

From the repository root:

```bash
npm install
```

### 3) Backend setup (choose one path)

#### Use an existing shared backend

1. Place `amplify_outputs.json` in the repo root (provided by the team).
2. Start the app:

```bash
npx expo start
```

This is the fastest way to reproduce behavior without provisioning new AWS resources.

2. In terminal 2, run:

```bash
npx expo start
```

3. Open on:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web
- or scan QR for Expo Go

## Environment Files

- This repo does **not** require a committed `.env` file for default local development.
