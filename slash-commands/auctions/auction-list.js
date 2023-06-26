const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { Auction, AuctionParticipation } = require('../../models');
const {
	auctionEmbed,
	auctionListEmbed,
	userAuctionListEmbed,
	participationsEmbed,
	winnerEmbed,
} = require('../../utils/embeds');

const LIST_LIMIT = 5;

const buttonsRow = () => {
	return new ActionRowBuilder().addComponents(
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

const pButtonRow = (label) => {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('auction-participations')
			.setStyle(ButtonStyle.Secondary)
			.setLabel(label)
			.setEmoji('🔄'),
	);
};

const pButtonsRow = (label) => {
	return buttonsRow().addComponents(
		new ButtonBuilder()
			.setCustomId('auction-participations')
			.setStyle(ButtonStyle.Secondary)
			.setLabel(label)
			.setEmoji('🔄'),
	);
};

const getProperEmbed = async (auction, guild) => {
	let embed;
	if (auction.winner_id) {
		const participation = await AuctionParticipation.findOne({
			where: { auction_id: auction.id, user_id: auction.winner_id },
		});
		embed = await winnerEmbed(auction, guild, auction.winner_id, participation.entries);
	}
	else {
		embed = await auctionEmbed(auction, guild);
	}
	return embed;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alist')
		.setDescription('Display an auctions list')
		.setDMPermission(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('User for which to return the list'),
		)
		.addStringOption((option) =>
			option
				.setName('status')
				.setDescription('Auction Status')
				.addChoices(
					{ name: Auction.PENDING_STATUS, value: Auction.PENDING_STATUS },
					{ name: Auction.ONGOING_STATUS, value: Auction.ONGOING_STATUS },
					{ name: Auction.CANCELLED_STATUS, value: Auction.CANCELLED_STATUS },
					{ name: Auction.FINISHED_STATUS, value: Auction.FINISHED_STATUS },
				),
		)
		.addBooleanOption((option) =>
			option.setName('view').setDescription('View list auction per auction'),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, channel, guild } = interaction;
		const status = options.getString('status');
		const member = options.getMember('user');
		const view = options.getBoolean('view');
		const collectorFilter = (btnInt) => {
			return (
				(btnInt.customId === 'auction-list-bwd') ||
        (btnInt.customId === 'auction-list-fwd')
			);
		};

		const filter = {
			where: { guild_id: guild.id },
			order: [
				['start_date', 'DESC'],
			],
		};

		if (member) {
			filter.where.user_id = member.id;
		}
		if (status) {
			filter.where.status = status;
		}

		const count = await Auction.count(filter);

		if (count === 0) {
			return await interaction.editReply('Aucun tirage retrouvé.');
		}

		if (view) {
			let index = 0;
			const rows = await Auction.findAll(filter);
			const auction = rows[index];
			let embed = await getProperEmbed(auction, guild);
			let showParticipations = false;

			if (count === 1) {
				await interaction.editReply({ embeds: [embed], components: [pButtonRow('Voir les participations')] });
			}
			else {
				await interaction.editReply({
					embeds: [embed],
					components: [pButtonsRow('Voir les participations')],
				});
			}

			const viewCollectorFilter = (btnInt) => {
				return collectorFilter(btnInt) ||
          (btnInt.customId === 'auction-participations');
			};

			const collector = channel.createMessageComponentCollector({ viewCollectorFilter, time: 60 * 1000 });
			collector.on('collect', async (i) => {
				try {
					if (i.customId === 'auction-list-bwd') {
						if (index - 1 < 0) index = count - 1;
						else index--;
					}
					else if (i.customId === 'auction-list-fwd') {
						if (index + 1 >= count) index = 0;
						else index++;
					}
					else {
						showParticipations = !showParticipations;
					}

					if (showParticipations) {
						const participations = await rows[index].getAuctionParticipations();
						const entriesSum = await AuctionParticipation.sum('entries', {
							where: { auction_id: rows[index].id },
						});
						embed = await participationsEmbed(rows[index], guild, participations, entriesSum);
					}
					else {
						embed = await getProperEmbed(rows[index], guild);
					}

					return await i.update({
						embeds: [embed],
						components: [count === 1
							? pButtonRow(showParticipations ? 'Voir le tirage' : 'Voir les participations')
							: pButtonsRow(showParticipations ? 'Voir le tirage' : 'Voir les participations'),
						],
					});
				}
				catch (e) {
					console.log(e);
				}
			});
			collector.on('end', async () => {
				await interaction.editReply({ components: [] });
			});

			return;
		}

		filter.offset = 0;
		filter.limit = LIST_LIMIT;
		let rows = await Auction.findAll(filter);
		let pagination = { count, limit: LIST_LIMIT, offset: filter.offset };
		let embed = member ?
			userAuctionListEmbed(pagination, rows, guild, member) :
			await auctionListEmbed(pagination, rows, guild);

		if (count <= LIST_LIMIT) {
			return await interaction.editReply({ embeds: [embed] });
		}

		await interaction.editReply({
			embeds: [embed],
			components: [buttonsRow()],
		});

		const collector = interaction.channel.createMessageComponentCollector({
			collectorFilter,
			time: 60 * 1000,
		});
		collector.on('collect', async (i) => {
			try {
				if (i.customId === 'auction-list-bwd') {
					if (filter.offset - LIST_LIMIT < 0) {
						filter.offset = LIST_LIMIT * Math.floor(count / LIST_LIMIT);
					}
					else {
						filter.offset -= LIST_LIMIT;
					}
				}
				else if (filter.offset + LIST_LIMIT >= count) {
					filter.offset = 0;
				}
				else {
					filter.offset += LIST_LIMIT;
				}

				rows = await Auction.findAll(filter);
				pagination = {
					count,
					limit: LIST_LIMIT,
					offset: filter.offset,
				};
				embed = member ?
					userAuctionListEmbed(pagination, rows, guild, member) :
					await auctionListEmbed(pagination, rows, guild);

				await i.update({ embeds: [embed], components: [buttonsRow()] });
			}
			catch (e) {
				console.log(e);
			}
		});
		collector.on('end', async () => {
			await interaction.editReply({ components: [] });
		});
	},
};