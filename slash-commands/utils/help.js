const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// const { Guild } = require('../../models');
// const { DEFAULT_PREFIX } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Affiche la liste des commandes')
		.setDMPermission(false),
	async execute(client, interaction) {
		// const guild = await Guild.findByPk(client.guildId);
		// const prefix = guild !== null && guild.prefix ? guild.prefix : DEFAULT_PREFIX;
		const embed = new EmbedBuilder()
			.setTitle('Liste de toutes les commandes:')
			.setDescription(
				client.slashCommands.map(command => `**/${command.data.name}** - ${command.data.description}`).join('\n'),
				// client.commands.map(command => `**${prefix + command.name}** - ${command.description}`).join('\n'),
			);

		return interaction.reply({ embeds: [embed] });
	},
};
