const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acreate')
		.setDescription('Create an auction')
		.setDMPermission(false)
		.addStringOption(option =>
			option.setName('character')
				.setDescription('Character to auction')
				.setMaxLength(50)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('image')
				.setDescription('Character\'s image link'),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auction create...');
	},
};
