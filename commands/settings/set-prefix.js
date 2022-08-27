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

        let guild = await Guild.findByPk(guildId);
        let oldPrefix = null;
        if (guild === null) {
            guild = await Guild.create({id: guildId, prefix: newPrefix});
        } else {
            oldPrefix = guild.prefix;
            guild.prefix = newPrefix;
            await guild.save();
        }

        await interaction.editReply('Changement effectué, ancien préfixe : ' + oldPrefix || '$' );
	},
};
