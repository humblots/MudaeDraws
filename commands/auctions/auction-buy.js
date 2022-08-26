const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('abuy')
		.setDescription('Buy auction entries')
		.setDMPermission(false)
		.addIntegerOption(option => 
			option.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('entries')
				.setDescription('Number of entries to buy')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auction buy...');
	},
};
