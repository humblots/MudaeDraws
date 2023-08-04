const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawrole')
		.setDescription('Permet de choisir un rôle pour les mentions, laisser vide pour retirer le rôle actuel')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle à mentionner')
		),
	async execute(client, interaction) {
		const role = interaction.options.getRole('role');

		const [guild] = await Guild.findOrCreate({
			where: { id: interaction.guildId },
		});

		let message;
		if (role) {
			message = 'Rôle défini !'
			guild.role = role.id;
		} else {
			message = guild.role ? 'Rôle supprimé !' : "Aucun rôle n'est défini"
			guild.role = null
		}

		await guild.save();
		await interaction.reply(message, );
	},
};
