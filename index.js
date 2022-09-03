const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const { TOKEN } = process.env;

// Create a new client instance
const client = new Client({ intents: [		
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

client.commands = new Collection();
client.buttons = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
	const commandsPath = path.join(__dirname, 'commands', folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(path.join(commandsPath, file));
		client.commands.set(command.data.name, command);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

/**
 * Uncomment to handle components
 */
//const componentsFolders = fs.readdirSync(path.join(__dirname, 'components'));
//for (const folder of componentsFolders) {
//	const componentsPath = path.join(__dirname, 'components', folder);
//	const componentsFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));
//	for (const file of componentsFiles) {
//		const component = require(path.join(componentsPath, file));
//		client[folder].set(component.data.name, component);
//	}
//}

// Login to Discord with your client's token
client.login(TOKEN);
