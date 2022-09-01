const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Auction } = require('../../models');
const { auctionListEmbed, userAuctionListEmbed } = require('../../utils/auction-list-embed');

const buttonsRow = () => {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('auction-list-bwd')
				.setStyle(ButtonStyle.Secondary)
				.setLabel('⬅️'),
			new ButtonBuilder()
				.setCustomId('auction-list-fwd')
				.setStyle(ButtonStyle.Secondary)
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
	async execute(interaction) {
		await interaction.deferReply();
		const {options, channel} = interaction;
		const status = options.getString('status');
		const member = options.getMember('user');
		const guild = interaction.guild;
		const limit = 5;

		const filter = {
			where: { guild_id: guild.id }, order: [['start_date', 'DESC']],
			offset: 0,
			limit: limit,
		};
		if (member) {
			filter.where.user_id = member.id;
		}
		if (status) {
			filter.where.status = status;
		}

		const { count, rows } = await Auction.findAndCountAll(filter);

		if (rows === null || count === 0) {
			return await interaction.editReply('Aucune enchère retrouvée.');
		}

		const pagination = {count, limit, offset: filter.offset};
		const embed = member
			? userAuctionListEmbed(pagination, rows, guild, member)
			: await auctionListEmbed(pagination, rows, guild);
		
		if (count <= limit) {
			await interaction.editReply({ embeds: [ embed ]});
		} else {
			await interaction.editReply({ embeds: [ embed ], components: [ buttonsRow() ] });

			const collectorFilter = (btnInt) => {
				return btnInt.customId === 'auction-list-bwd' || btnInt.customId === 'auction-list-fwd';
			}
			const collector = interaction.channel.createMessageComponentCollector({ collectorFilter, time: 60 * 1000 });
			collector.on('collect', async i => {
				if (i.customId === 'auction-list-bwd') {
					if (filter.offset - limit < 0) filter.offset = limit * Math.floor(count/limit);
					else filter.offset -= limit;
				} else {
					if (filter.offset + limit >= count) filter.offset = 0;
					else filter.offset += limit;
				}
	
				const rows = await Auction.findAll(filter);
	
				if (rows.length) {
					return await interaction.editReply('Aucune enchère retrouvée.');
				}

				const pagination = {count, limit, offset: filter.offset};
				const embed = member
					? userAuctionListEmbed(pagination, rows, guild, member)
					: await auctionListEmbed(pagination, rows, guild);
	
				await i.update({ embeds: [embed], components: [buttonsRow()] });
			});
		}
	},
};
