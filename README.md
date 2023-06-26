# MudaeDraws

Bot with commands to create Draws on top of Mudae

## Installation

1. Clone the repository
2. Install the dependencies
3. Create the env file using the .env.sample file
4. Create the config.json file using the config.sample.json file
5. Create a docker.compose.override.yml file to override the required values such as docker host, etc.
6. Deploy the commands using the deploy-commands.js file: `node deploy-commands.js`
7. Run the bot
8. Migrations should run automatically otherwise, refer
   to [sequelize-cli documentation](https://sequelize.org/docs/v6/other-topics/migrations/)

## Commands

### Admin Only

#### /drawchannel

Used to define the channel in which the notifications concerning the draws will be sent.

#### /drawrole

Used to define a role to mention in the notifications of the draws. If not defined, the notifications will not mention
any role.

### Draws Management

#### /drawcreate

Create a draw and define its options.

#### /drawupdate

Update the options of one of your draws.

#### /drawcancel

Cancel a draw in progress, the participants will need to be refunded if there are any. (not implemented yet)

#### /drawdelete

Delete a draw that has not started yet.

### Draws Visualization

#### /drawlist

Visualize the list of draws and filter it using parameters.

#### /drawview

Visualize a specific draw, can change the display to the one of the participations in this draw.

### Draws Participation

#### /drawbuy

Initiate a process to buy entries for a draw.

#### /drawrefund

Gives the organizer of a canceled draw the ability to refund their participants.
It is impossible to create new draws while a refund is in progress. (not implemented yet)