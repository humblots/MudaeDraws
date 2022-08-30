const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acancel')
		.setDescription('Cancels an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auction cancel...');
	},
};
