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
				.setDescription('Character\'s image link')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('price')
				.setDescription('Entry price')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('max-user-entries')
				.setDescription('Max number of entries that a user can purchase'),
		)
		.addIntegerOption(option =>
			option.setName('max-entries')
				.setDescription('Max number of entries for the auction'),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auction create...');
	},
};
