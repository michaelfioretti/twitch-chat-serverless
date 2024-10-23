# Twitch Chat Serverless

A serverless application that interacts with the Twitch API to fetch live stream and chat data, built using AWS Lambda, TypeScript, and the Serverless Framework.

![Codecov](https://img.shields.io/codecov/c/github/michaelfioretti/twitch-livestream-app-serverless)

## Features

- **Fetch Twitch Stream Data**: Get real-time stream details.
- **Stream Search**: Search for individual streams or streamers
- **TypeScript**: Full TypeScript support for better type safety.
- **Serverless**: Deployed via AWS Lambda for scalability and cost-efficiency.

## Getting Started

### Prerequisites

- Node.js v16+
- npm
- Serverless Framework (`npm install -g serverless`)
- Twitch Developer API credentials

### Installation
```bash
git clone https://github.com/michaelfioretti/twitch-chat-serverless.git
cd twitch-chat-serverless
npm install
```

### Testing
Tests can be ran via the following:

`npm test`
