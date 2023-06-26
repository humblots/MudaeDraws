const { EmbedBuilder } = require('discord.js');
const { Draw } = require('../models');
const moment = require('moment');
const { getMember } = require('./discord-getters');

const drawEmbed = async (draw, guild, pagination = null) => {
	const startDateTimeStamp = moment(draw.start_date).unix();
	const endDateTimeStamp = moment(draw.end_date).unix();
	const member = await getMember(guild, draw.user_id);
	const paginationTrace = pagination ?
		` - ${pagination.index + 1}/${pagination.count}` :
		'';

	const embed = new EmbedBuilder()
		.setColor(draw.getEmbedColor())
		.setTitle('Tirage pour ' + draw.character)
		.setDescription(
			`**Prix de l'entrée:** ${
				draw.entry_price === null ? Draw.DEFAULT_PRICE : draw.entry_price
			}\n` +
			`**Entrées max par participants:** ${draw.max_user_entries || 'illimité'}\n` +
			`**Entrées max total:** ${draw.max_entries || 'illimité'}`,
		)
		.addFields({
			name: 'Date de début',
			value: `<t:${startDateTimeStamp}:R> (<t:${startDateTimeStamp}>)`,
		}, {
			name: 'Date de fin',
			value: `<t:${endDateTimeStamp}:R> (<t:${endDateTimeStamp}>)`,
		})
		.setImage(draw.img_url)
		.setFooter({
			text: `Par ${member ? member.displayName : draw.user_id}\n` +
				`id: ${draw.id} - ${draw.status}` +
				paginationTrace,
			iconURL: member ? member.user.avatarURL() : null,
		});

	return embed;
};

const drawListEmbed = async (pagination, rows, guild) => {
	const { count, limit, offset } = pagination;
	const embed = new EmbedBuilder();
	embed.setAuthor({
		name: `Liste des tirages de ${guild.name}`,
		iconURL: guild.iconURL(),
	});

	for (const draw of rows) {
		const member = await getMember(guild, draw.user_id);
		_addDrawField(embed, draw, member);
	}

	embed.setFooter({
		text: `${guild.name} - page ${Math.floor(offset / limit) + 1}/${Math.ceil(
			count / limit,
		)} - total: ${count}`,
	});
	return embed;
};

const userDrawListEmbed = (pagination, rows, guild, member) => {
	const { count, limit, offset } = pagination;
	const embed = new EmbedBuilder();
	embed.setAuthor({
		name: `Liste des tirages de ${
			member ? member.displayName : rows[0].user_id
		}`,
		iconURL: member ? member.user.avatarURL() : null,
	});

	for (const draw of rows) {
		_addDrawField(embed, draw, member);
	}

	embed.setFooter({
		text: `${guild.name} - page ${Math.floor(offset / limit) + 1}/${Math.ceil(
			count / limit,
		)} - total: ${count}`,
	});
	return embed;
};

const _addDrawField = (embed, draw, member) => {
	const startDateTimeStamp = moment(draw.start_date).unix();
	const endDateTimeStamp = moment(draw.end_date).unix();

	embed.addFields({
		name: `${draw.getStatusSymbol()} ${draw.status} - ` +
			`${draw.character} - Id: ${draw.id} - Par ${member ? member.displayName : draw.user_id}`,
		value: `**Prix de l'entrée:** ${
			draw.entry_price === null ? Draw.DEFAULT_PRICE : draw.entry_price
		}\n` +
			`**Entrées max par participants:** ${draw.max_user_entries || 'illimité'}\n` +
			`**Entrées max total:** ${draw.max_entries || 'illimité'}\n` +
			`**Date de début:** <t:${startDateTimeStamp}:R>\n` +
			`**Date de fin:** <t:${endDateTimeStamp}:R>`,
	});
};

const participationsEmbed = async (
	draw,
	guild,
	participations,
	entriesSum,
) => {
	const drawMember = await getMember(guild, draw.user_id);
	const price = draw.entry_price === null ? Draw.DEFAULT_PRICE : draw.entry_price;
	const embed = new EmbedBuilder()
		.setColor(draw.getEmbedColor())
		.setTitle('Participations pour le tirage de ' + draw.character)
		.setFooter({
			text: `Par ${drawMember ? drawMember.displayName : draw.user_id}\n` +
				`id: ${draw.id} - ${draw.status}`,
			iconURL: drawMember ? drawMember.user.avatarURL() : null,
		});

	if (!participations.length) {
		embed.setDescription('Aucune participation.');
		return embed;
	}

	for (const participation of participations) {
		const member = await getMember(guild, participation.user_id);
		embed.addFields({
			name: member ? member.displayName : participation.user_id,
			value: `Nombre d'entrées: ${participation.entries}/${draw.max_user_entries || draw.max_entries || '∞'} ` +
				`- ${(participation.entries / entriesSum).toFixed(6) * 100} %\n` +
				`Total dépensé: ${participation.entries * price}`,
		});
	}

	let description;
	if (draw.max_entries) {
		description = `**Nombre d'entrées restantes: ${draw.max_entries - entriesSum}**`;
	}
	else {
		description = '**Nombre d\'entrées restantes: ∞**';
	}
	embed.setDescription(description + `\n**Total mis en jeu:** ${entriesSum * price}`);

	return embed;
};

const winnerEmbed = async (draw, guild, winnerId, winnerEntries) => {
	const winner = await getMember(guild, winnerId);
	const drawMember = await getMember(guild, draw.user_id);

	const embed = new EmbedBuilder()
		.setAuthor({
			name: `Tirage pour ${draw.character}`,
			iconURL: guild.iconURL(),
		})
		.setColor(draw.getEmbedColor())
		.setTitle(
			`Le vainqueur est ${winner ? winner.displayName : draw.user_id} !`,
		)
		.setDescription(
			`**Nombre d'entrées:** ${winnerEntries}\n` +
			`**Total dépensé:** ${winnerEntries * (draw.entry_price === null ? Draw.DEFAULT_PRICE : draw.entry_price)}\n` +
			'Fais-un signe à l\'organisateur pour récupérer ton gain',
		)
		.setImage(draw.img_url)
		.setFooter({
			text: `Par ${drawMember ? drawMember.displayName : draw.user_id}\n` +
				`id: ${draw.id} - ${draw.status}`,
			iconURL: drawMember ? drawMember.user.avatarURL() : null,
		});

	if (winner) {
		embed.setThumbnail(winner.user.avatarURL());
	}

	return embed;
};

module.exports = {
	drawEmbed,
	drawListEmbed,
	userDrawListEmbed,
	participationsEmbed,
	winnerEmbed,
};