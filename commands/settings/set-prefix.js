const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Set a server prefix')
		.setDMPermission(false)
		.addStringOption(option => 
			option.setName('input')
				.setDescription('New prefix')
				.setRequired(true)
                .setMaxLength(5),
		),
	async execute(interaction) {
        const guild = Guild.findByPk(interaction.guild_id);
        if (guild === null) await interaction.reply('Guild not found');
        else await interaction.reply("Guild found! ta database est d'enfer mon reuf");
	},
};
