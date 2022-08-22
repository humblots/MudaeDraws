const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alist')
		.setDescription('Display an auctions list')
		.setDMPermission(false)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User for which to return the list'),
		),
	async execute(interaction) {
		await interaction.reply('Incomming auctions list...');
	},
};
