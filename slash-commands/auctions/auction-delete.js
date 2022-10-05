const { SlashCommandBuilder } = require('discord.js');
const { Auction, Guild } = require('../../models');
const { getChannel } = require('../../utils/discord-getters');
const { auctionEmbed } = require('../../utils/embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adelete')
		.setDescription('Delete an auction')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, member, guild } = interaction;
		const id = options.getInteger('auction-id');

		const auction = await Auction.findByPk(id, { include: Guild });
		if (auction === null) {
			return await interaction.editReply('Tirage introuvable.');
		}

		if (
			auction.user_id !== member.id ||
            auction.guild_id !== interaction.guildId
		) {
			return await interaction.editReply(
				'Tu n\'as pas le droit de supprimer ce tirage.',
			);
		}

		if (auction.status !== Auction.PENDING_STATUS) {
			return await interaction.editReply(
				'Ce tirage ne peut pas être supprimé.',
			);
		}

		await auction.destroy();
		const embed = await auctionEmbed(auction, guild);
		const message = {
			content: `${auction.Guild.role ? '<@&' + auction.Guild.role + '> ' : ''}` +
				`Le tirage pour ${auction.character} a été supprimé !`,
			embeds: [embed],
		};
		if (auction.Guild.channel !== null) {
			const channel = await getChannel(guild, auction.Guild.channel);
			channel.send(message);
			await interaction.editReply('Done.');
		}
		await interaction.editReply(message);
	},
};