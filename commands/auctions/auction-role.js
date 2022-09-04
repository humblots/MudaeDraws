const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arole')
		.setDescription('Set a role for for different mentions')
		.setDMPermission(false)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription("Role for mentions")
				.setRequired(true),
		),
	async execute(interaction) {
        const role = interaction.options.getRole('role');

        const [guild] = await Guild.findOrCreate({
			where: { id: interaction.guildId }
		});
        
        guild.role = role.id;

        await guild.save();
        await interaction.reply("Role défini !");
	},
};
