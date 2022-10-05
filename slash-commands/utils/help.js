const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Send the help message')
		.setDMPermission(false),
	async execute(client, interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Liste de toutes les commandes:')
			.setDescription(
				client.slashCommands.map(command => `**/${command.data.name}** - ${command.data.description}`).join('\n') + '\n' +
				client.commands.map(command => `**${command.name}** - ${command.description}`).join('\n')
			);

		return interaction.reply({ embeds: [embed] });
	},
};
