const { Draw, DrawParticipation, Guild } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { getGuild, getChannel } = require('./discord-getters');
const { drawEmbed, winnerEmbed } = require('./embeds');

const updateStatus = async (client) => {
	const now = new Date();
	const draws = await Draw.findAll({
		where: {
			start_date: {
				[Op.lte]: now,
			},
			end_date: {
				[Op.gt]: now,
			},
			status: Draw.PENDING_STATUS,
		},
		include: Guild,
	});

	for (const draw of draws) {
		await draw.update({ status: Draw.ONGOING_STATUS });
		const { guild, channel } = await getGuildAndChannelFromDraw(
			client,
			draw.Guild,
		);
		if (!guild || !channel) continue;

		const embed = await drawEmbed(draw, guild);
		channel.send({
			content: `${draw.Guild.role ? '<@&' + draw.Guild.role + '>' : ''}` +
				` Le tirage pour **${draw.character}** vient de commencer !`,
			embeds: [embed],
		});
	}
};

const weightedDraw = (participations, entriesSum) => {
	const weights = {};
	for (const participation of participations) {
		weights[participation.user_id] = participation.entries / entriesSum;
	}

	const rand = Math.random();
	let winner;
	for (const [id, weight] of Object.entries(weights)) {
		winner = { id, weight };
		if (weight >= rand) return winner;
		rand - weight;
	}

	// not supposed ta happen
	return winner;
};

const pickWinners = async (client) => {
	const draws = await Draw.findAll({
		where: {
			end_date: {
				[Op.lte]: new Date(),
			},
			status: Draw.ONGOING_STATUS,
		},
		include: Guild,
	});

	for (const draw of draws) {
		await draw.update({ status: Draw.FINISHED_STATUS });

		const { guild, channel } = await getGuildAndChannelFromDraw(
			client,
			draw.Guild,
		);
		if (!guild || !channel) continue;

		const message =
			`${draw.Guild.role ? '<@&' + draw.Guild.role + '>' : ''}` +
			` Le tirage pour **${draw.character}** vient de se terminer !`;

		const participations = await draw.getDrawParticipations({
			order: [sequelize.fn('RAND')],
		});
		if (!participations.length) {
			channel.send(message + '\nMalheureusement, personne n\'y a participé...');
			continue;
		}

		const entriesSum = await DrawParticipation.sum('entries', {
			where: { draw_id: draw.id },
		});
		const winner = weightedDraw(participations, entriesSum);
		if (!winner) continue;
		draw.update({ winner_id: winner.id });
		const embed = await winnerEmbed(
			draw,
			guild,
			winner.id,
			winner.weight * entriesSum,
		);
		channel.send({ content: message, embeds: [embed] });
	}
};

const getGuildAndChannelFromDraw = async (client, guildModel) => {
	const guild = await getGuild(client, guildModel.id);
	if (!guild) return { guild: null, channel: null };
	const channel = await getChannel(guild, guildModel.channel);
	return { guild, channel };
};

module.exports = {
	updateStatus,
	pickWinners,
};