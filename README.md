# Paymet
Paymet is an automative service for selling ``Roblox`` in-game items for ``Robux`` without any user interactions.

This project was something that I wanted to work on during the summer before I start college. As of writing this , this is the last weekend before college starts and I wouldn't want to waste my time on working this project. I wouldn't recommend using this project for production as it is unfinished ,  having a lot of bugs , and being rushed towards the end. 

Use this project as a learning guide for those who want to be upcoming devs.

# Table Of Contents

# Prerequisites
- [Synapse-X](https://x.synapse.to/)
- [NodeJS](https://nodejs.org/en/) 16.6.0 or newer is required.
- [PostgreSQL](https://www.postgresql.org/download/)
- [Yarn Package Manager](https://yarnpkg.com/getting-started/install#about-global-installs)

# Environment Variables
Create a file named ``.env.development`` on the project root directory.
| Variable Name          | Description                                                 | Required | Default Value |
|------------------------|-------------------------------------------------------------|----------|---------------|
| pgHost                 | The hostname of your Postgres database.                     | false    | localhost     |
| pgPort                 | The port of your Postgres database.                         | false    | 5432          |
| pgUser                 | The username to your Postgres database.                     | false    | postgres      |
| pgPassword             | The password to your Postgres database.                     | true     |               |
| pgDatabase             | The name of the database you would want to connect to.      | true     |               |
| robloxAssetId          | This asset will be used to verify the payment of purchases. | true     |               |
| robloxCookie           | Your .ROBLOSECURITY to make requests to the Roblox API.     | true     |               |
| discordBotToken        | The token to your Discord Bot.                              | true     |               |
| discordCommandsDirPath | The directory path to load your Discord slash commands.     | false    | /commands/    |
| discordEventsDirPath   | The directory path to load your Discord events.             | false    | /events/      |
| socketServerPort       | Your socket server will listen on this port.                | false    | 8080          |
| expressServerPort      | Your express server will listen on this port.               | false    | 3000          |

# Installation

```
# Clone the repo.
https://github.com/TheRealLunatite/Paymet.git

# Install the required dependencies.
yarn install

# Run the services.
yarn run dev
```
