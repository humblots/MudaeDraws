const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Guild } = require('../../models');
const { DEFAULT_PREFIX } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Send the help message')
		.setDMPermission(false),
	async execute(client, interaction) {
		let prefix;
		const guild = await Guild.findByPk(client.guildId);
		if (guild !== null && guild.prefix) {
			prefix = guild.prefix;
		}
		else {
			prefix = DEFAULT_PREFIX;
		}

		const embed = new EmbedBuilder()
			.setTitle('Liste de toutes les commandes:')
			.setDescription(
				client.slashCommands.map(command => `**/${command.data.name}** - ${command.data.description}`).join('\n') + '\n' +
				client.commands.map(command => `**${prefix + command.name}** - ${command.description}`).join('\n'),
			);

		return interaction.reply({ embeds: [embed] });
	},
};
