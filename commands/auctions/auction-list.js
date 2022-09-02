const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Auction } = require('../../models');
const auctionEmbed = require('../../utils/auction-embed');
const { auctionListEmbed, userAuctionListEmbed } = require('../../utils/auction-list-embed');

const LIST_LIMIT = 5;

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

const collectorFilter = (btnInt) => {
	return btnInt.customId === 'auction-list-bwd' || btnInt.customId === 'auction-list-fwd';
}

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
		)
		.addBooleanOption(option => 
			option.setName('view')
				.setDescription('View list auction per auction')

		),
	async execute(interaction) {
		await interaction.deferReply();
		const {options, channel, guild} = interaction;
		const status = options.getString('status');
		const member = options.getMember('user');
		const view = options.getBoolean('view');

		const filter = {
			where: { guild_id: guild.id }, order: [['start_date', 'DESC']],
		};

		if (member) {
			filter.where.user_id = member.id;
		}
		if (status) {
			filter.where.status = status;
		}

		const count = await Auction.count(filter);

		if (count === 0) {
			return await interaction.editReply('Aucune enchère retrouvée.');
		}

		if (view) {
			let index = 0;
			const rows = await Auction.findAll(filter);

			let embed = await auctionEmbed(rows[0], guild, {index, count});
			if (count === 1) {
				return await interaction.editReply({embeds: [embed] });
			}

			await interaction.editReply({embeds: [embed], components: [buttonsRow()]});
			const collector = channel.createMessageComponentCollector({ collectorFilter, time: 60 * 1000 });
			collector.on('collect', async (i) => {
				if (i.customId === 'auction-list-bwd') {
					if (index - 1 < 0) index = count - 1;
					else index--;
				} else {
					if (index + 1 >= count) index = 0;
					else index++;
				}
				embed = await auctionEmbed(rows[index], guild, {index, count});
				return await i.update({embeds: [embed], components: [buttonsRow()]});
			})
		} else {
			filter.offset = 0;
			filter.limit = LIST_LIMIT;
			const rows = await Auction.findAll(filter);
			const pagination = {count, limit: LIST_LIMIT, offset: filter.offset};
			const embed = member
				? userAuctionListEmbed(pagination, rows, guild, member)
				: await auctionListEmbed(pagination, rows, guild);
			
			if (count <= LIST_LIMIT) {
				await interaction.editReply({ embeds: [ embed ]});
			} else {
				await interaction.editReply({ embeds: [ embed ], components: [ buttonsRow() ] });
	
				const collector = interaction.channel.createMessageComponentCollector({ collectorFilter, time: 60 * 1000 });
				collector.on('collect', async i => {
					if (i.customId === 'auction-list-bwd') {
						if (filter.offset - LIST_LIMIT < 0) filter.offset = LIST_LIMIT * Math.floor(count/LIST_LIMIT);
						else filter.offset -= LIST_LIMIT;
					} else {
						if (filter.offset + LIST_LIMIT >= count) filter.offset = 0;
						else filter.offset += LIST_LIMIT;
					}
		
					const rows = await Auction.findAll(filter);
					const pagination = {count, limit: LIST_LIMIT, offset: filter.offset};
					const embed = member
						? userAuctionListEmbed(pagination, rows, guild, member)
						: await auctionListEmbed(pagination, rows, guild);
		
					await i.update({ embeds: [embed], components: [buttonsRow()] });
				});
			}
		}
	},
};
