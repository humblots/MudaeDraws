const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();

const { CLIENT_ID, TOKEN } = process.env;

const slashCommands = [];
const slashCommandFolders = fs.readdirSync(path.join(__dirname, 'slash-commands'));
for (const folder of slashCommandFolders) {
	const slashCommandsPath = path.join(__dirname, 'slash-commands', folder);
	const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
	for (const file of slashCommandFiles) {
		const command = require(path.join(slashCommandsPath, file));
		if (command.data) {
			slashCommands.push(command.data.toJSON());
		}
	}
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

rest.put(Routes.applicationCommands(CLIENT_ID), { body: slashCommands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
