const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aview')
		.setDescription('View an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auction view...');
	},
};
