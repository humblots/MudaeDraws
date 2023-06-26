const { SlashCommandBuilder } = require('discord.js');
const { Draw, Guild } = require('../../models');
const { getChannel } = require('../../utils/discord-getters');
const { drawEmbed } = require('../../utils/embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawdelete')
		.setDescription('Supprime un tirage')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('draw-id')
				.setDescription('Id du tirage')
				.setRequired(true),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, member, guild } = interaction;
		const id = options.getInteger('draw-id');

		const draw = await Draw.findOne({ where: { id, guild_id: guild.id }, include: Guild });
		if (draw === null) {
			return await interaction.editReply('Tirage introuvable.');
		}

		if (
			draw.user_id !== member.id ||
			draw.guild_id !== guild.id
		) {
			return await interaction.editReply(
				'Tu n\'as pas le droit de supprimer ce tirage.',
			);
		}

		if (draw.status !== Draw.PENDING_STATUS) {
			return await interaction.editReply(
				'Ce tirage ne peut pas être supprimé.',
			);
		}

		await draw.destroy();
		draw.status = Draw.CANCELLED_STATUS;
		const embed = await drawEmbed(draw, guild);
		const message = {
			content: `${draw.Guild.role ? '<@&' + draw.Guild.role + '> ' : ''}` +
				`Le tirage pour ${draw.character} a été supprimé !`,
			embeds: [embed],
		};
		if (draw.Guild.channel !== null) {
			const channel = await getChannel(guild, draw.Guild.channel);
			channel.send(message);
			return await interaction.editReply('Done.');
		}
		return await interaction.editReply(message);
	},
};