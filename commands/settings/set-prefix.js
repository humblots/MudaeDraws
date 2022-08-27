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
        await interaction.deferReply();
        const guildId = interaction.guildId;
        const newPrefix = interaction.options.getString('input');

        await Guild.findOrCreate({
            where: { id: guildId },
            defaults: {
                prefix: newPrefix
            }
        });
 
        await interaction.editReply('Changement effectué, nouveau préfixe : ' + newPrefix );
	},
};
