const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Auction } = require('../../models');
const { auctionListEmbed, userAuctionListEmbed } = require('../../utils/auction-list-embed');

const buttonsRow = () => {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('primary')
				.setLabel('⬅️'),
			new ButtonBuilder()
				.setCustomId('primary')
				.setLabel('➡️'),
		);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alist')
		.setDescription('Display an auctions list')
		.setDMPermission(false)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User for which to return the list'),
		)
		.addStringOption(option =>
			option.setName('status')
				.setDescription('Auction Status')
				.addChoices(
					{ name: Auction.PENDING_STATUS, value: Auction.PENDING_STATUS },
					{ name: Auction.ONGOING_STATUS, value: Auction.ONGOING_STATUS },
					{ name: Auction.CANCELLED_STATUS, value: Auction.CANCELLED_STATUS },
					{ name: Auction.FINISHED_STATUS, value: Auction.FINISHED_STATUS },
				),
		),
	/**
	 * TODO: Better list display with navigation, more filters
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const options = interaction.options;
		const status = options.getString('status');
		const member = options.getMember('user');
		const guild = interaction.guild;
		const offset = 1;
		const limit = 5;

		const filter = {
			where: { guild_id: guild.id }, order: [['start_date', 'DESC']],
			offset: offset,
			limit: limit,
		};
		if (member) {
			filter.where.user_id = member.id;
		}
		if (status) {
			filter.where.status = status;
		}

		// Manage it with offset / limit
		const { count, rows } = await Auction.findAndCountAll(filter);

		if (rows === null || count === 0) {
			return await interaction.editReply('Aucune enchère retrouvée.');
		}

		const embed = member
			? userAuctionListEmbed(count, rows, guild, member)
			: await auctionListEmbed(count, rows, guild);

		await interaction.editReply({ embeds: [ embed ], rows: [ buttonsRow() ] });
	},
};
