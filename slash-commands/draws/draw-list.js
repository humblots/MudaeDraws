const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { Draw, DrawParticipation } = require('../../models');
const {
	drawEmbed,
	drawListEmbed,
	userDrawListEmbed,
	participationsEmbed,
	winnerEmbed,
} = require('../../utils/embeds');

const LIST_LIMIT = 5;

const buttonsRow = () => {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('draw-list-bwd')
			.setStyle(ButtonStyle.Secondary)
			.setLabel('⬅️'),
		new ButtonBuilder()
			.setCustomId('draw-list-fwd')
			.setStyle(ButtonStyle.Secondary)
			.setLabel('➡️'),
	);
};

const participationsButtonsRow = (label, listSize) => {

	const participationButton = new ButtonBuilder()
		.setCustomId('draw-participations')
		.setStyle(ButtonStyle.Secondary)
		.setLabel(label)
		.setEmoji('🔄');

	return listSize === 1
		? new ActionRowBuilder().addComponents(participationButton)
		: buttonsRow().addComponents(participationButton);
};

const getProperEmbed = async (draw, guild) => {
	let participation;
	if (draw.winner_id) {
		participation = await DrawParticipation.findOne({
			where: { draw_id: draw.id, user_id: draw.winner_id },
		});
	}

	return draw.winner_id
		? await winnerEmbed(draw, guild, draw.winner_id, participation.entries || 0)
		: drawEmbed(draw, guild);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawlist')
		.setDescription('Affiche la liste des tirages.')
		.setDMPermission(false)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Utilisateur à qui appartient la liste'),
		)
		.addStringOption((option) =>
			option
				.setName('status')
				.setDescription('Status du tirage')
				.addChoices(
					{ name: Draw.PENDING_STATUS, value: Draw.PENDING_STATUS },
					{ name: Draw.ONGOING_STATUS, value: Draw.ONGOING_STATUS },
					{ name: Draw.CANCELLED_STATUS, value: Draw.CANCELLED_STATUS },
					{ name: Draw.FINISHED_STATUS, value: Draw.FINISHED_STATUS },
				),
		)
		.addBooleanOption((option) =>
			option
				.setName('view')
				.setDescription('Affiche la liste tirage par tirage'),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, channel, guild } = interaction;
		const status = options.getString('status');
		const member = options.getMember('user');
		const view = options.getBoolean('view');
		const collectorFilter = (btnInt) => {
			return (
				(btnInt.customId === 'draw-list-bwd') ||
				(btnInt.customId === 'draw-list-fwd')
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

		const count = await Draw.count(filter);
		if (count === 0) {
			return await interaction.editReply('Aucun tirage retrouvé.');
		}

		if (view) {
			let index = 0;
			const rows = await Draw.findAll(filter);
			const draw = rows[index];
			let embed = await getProperEmbed(draw, guild);
			let showParticipations = false;

			await interaction.editReply({
				embeds: [embed],
				components: [participationsButtonsRow('Voir les participations', count)],
			});

			const viewCollectorFilter = (btnInt) => {
				return collectorFilter(btnInt) ||
					(btnInt.customId === 'draw-participations');
			};

			const collector = channel.createMessageComponentCollector({ viewCollectorFilter, time: 60 * 1000 });
			collector.on('collect', async (i) => {
				try {
					if (i.customId === 'draw-list-bwd') {
						index = index - 1 < 0 ? count - 1 : index - 1;
					}
					else if (i.customId === 'draw-list-fwd') {
						index = index + 1 >= count ? 0 : index + 1;
					}
					else {
						showParticipations = !showParticipations;
					}

					if (showParticipations) {
						const participations = await rows[index].getDrawParticipations();
						const entriesSum = await DrawParticipation.sum('entries', {
							where: { draw_id: rows[index].id },
						});
						embed = await participationsEmbed(rows[index], guild, participations, entriesSum);
					}
					else {
						embed = await getProperEmbed(rows[index], guild);
					}

					return await i.update({
						embeds: [embed],
						components: [participationsButtonsRow(showParticipations ? 'Voir le tirage' : 'Voir les participations', count)],
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
		let rows = await Draw.findAll(filter);
		let pagination = { count, limit: LIST_LIMIT, offset: filter.offset };
		let embed = member ?
			userDrawListEmbed(pagination, rows, guild, member) :
			await drawListEmbed(pagination, rows, guild);

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
				if (i.customId === 'draw-list-bwd') {
					filter.offset = filter.offset - LIST_LIMIT < 0
						? LIST_LIMIT * Math.floor(count / LIST_LIMIT)
						: filter.offset - LIST_LIMIT;
				}
				else {
					filter.offset = filter.offset + LIST_LIMIT >= count ? 0 : filter.offset + LIST_LIMIT;
				}

				rows = await Draw.findAll(filter);
				pagination = {
					count,
					limit: LIST_LIMIT,
					offset: filter.offset,
				};
				embed = member ?
					userDrawListEmbed(pagination, rows, guild, member) :
					await drawListEmbed(pagination, rows, guild);

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