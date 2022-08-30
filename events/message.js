const { Guild } = require('../models');
const { DEFAULT_PREFIX } = require('../config.json');

module.exports = {
	name: 'message',
	execute(client, message) {
		let prefix = DEFAULT_PREFIX;

		const guild = Guild.findByPk(message.guildId);
		if (guild !== null && guild.prefix) {
			prefix = guild.prefix;
		}

		if (!message.content.startsWith(prefix) || message.author.bot) {return;}

		const args = message.content.substring(prefix.length).trim().split(/\s+/);
		const cmdName = args.shift().toLowerCase();

		const command = client.commands.get(cmdName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
		if (!command) return;

		if (command.guildOnly && message.channel.type === 'dm') {
			return message.reply('Cette commande n\'est pas disponible via les DMs!');
		}

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply('Vous n\'avez pas les droits !');
			}
		}

		if (command.args && !args.length) {
			let reply = '';
			if (command.usage) {
				reply += `Synatxe: \`${prefix}${command.name} ${command.usage}\`\n${command.description}`;
			}
			return message.channel.send(reply);
		}

		try {
			command.execute(message, args, client);
		}
		catch (error) {
			message.channel.send(`Syntaxe: \`${prefix}${command.name} ${command.usage}\`\n${command.description}`);
		}
	},
};