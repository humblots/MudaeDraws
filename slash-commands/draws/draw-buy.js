const { SlashCommandBuilder } = require('discord.js');
const { Draw, DrawParticipation, User } = require('../../models');
const moment = require('moment');

const exitWord = 'exit';

const buyingProcess = async (channel, member, draw, amount) => {
	await awaitGivek(channel, member, draw, amount);
	await awaitValidation(channel, member, draw, amount);
};

const awaitGivek = async (channel, member, draw, amount) => {
	const command = '$givek';
	const filter = (m) =>
		(m.content.toLowerCase().startsWith(command) ||
			m.content.toLowerCase() === exitWord) &&
		m.author.id === member.id;

	const collector = channel.createMessageCollector({ filter, time: 60 * 1000 });
	return new Promise((resolve, reject) => {
		collector.on('collect', (m) => {
			collector.resetTimer({ time: 20 * 1000 });

			if (m.content.toLowerCase() === exitWord) {
				return collector.stop('end');
			}

			const args = m.content.substring(command.length).trim().split(/\s+/);

			if (!args[0].includes(draw.user_id)) {
				m.react('❌');
				console.log(args[0]);
				return channel.send('Vérifiez l\'id');
			}

			if (+args[1] !== amount) {
				m.react('❌');
				return channel.send('Vérifiez le montant');
			}

			m.react('✅');
			resolve(+args[1]);
			collector.stop('valid');
		});

		collector.on('end', (collected, reason) => {
			if (reason === 'time') reject('Temps écoulé');
			if (reason === 'end') reject('Opération annulée');
		});
	});
};

const awaitValidation = async (channel, member, draw, amount) => {
	const okChoices = ['oui', 'yes', 'o', 'y'];
	const cancelChoices = ['no', 'n'];
	const filter = (m) =>
		(okChoices.concat(cancelChoices).includes(m.content.toLowerCase()) ||
			m.content.toLowerCase() === exitWord) &&
		m.author.id === member.id;

	const collector = channel.createMessageCollector({ filter, time: 15 * 1000 });
	return new Promise((resolve, reject) => {
		collector.on('collect', (m) => {
			const choice = m.content.trim().toLowerCase();
			if (okChoices.includes(choice)) {
				return collector.stop('confirmed');
			}
			if (cancelChoices.includes(choice) || choice === exitWord) {
				return collector.stop('end');
			}
		});

		collector.on('end', (collected, reason) => {
			if (reason == 'confirmed') {
				const mudaeFilter = (m) => m.author.id === '432610292342587392';
				const mudaeCollector = channel.createMessageCollector({
					mudaeFilter,
					time: 10 * 1000,
				});
				mudaeCollector.on('collect', (m) => {
					if (
						m.content.includes(member.id) &&
						m.content.includes(amount) &&
						m.content.includes(':kakera:469835869059153940') &&
						m.content.includes(draw.user_id)
					) {
						resolve(true);
						return mudaeCollector.stop('confirmed');
					}

					if (m.content === 'Error: not enough kakera!') {
						return mudaeCollector.stop('end');
					}
				});

				mudaeCollector.on('end', (mudaeCollected, mudaeReason) => {
					if (mudaeReason === 'time') reject('L\'achat n\'a pas abouti.');
					if (mudaeReason === 'end') reject('Kakera insuffisant');
				});
				return;
			}

			if (reason === 'time') return reject('Temps écoulé');
			if (reason === 'end') return reject('Opération annulée');
		});
	});
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawbuy')
		.setDescription('Permet d\'acheter des participations à un tirage.')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('draw-id')
				.setDescription('Id du tirage')
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName('entries')
				.setDescription('Nombre de participations')
				.setMinValue(1)
				.setRequired(true),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, member, channel, guild } = interaction;
		const id = options.getInteger('draw-id');
		const entries = options.getInteger('entries');
		let userParticipation;

		const [user] = await User.findOrCreate({ where: { id: member.id } });

		if (user.occupied) {
			return await interaction.followUp(
				'Tu as déjà une opération en cours...',
			);
		}

		const draw = await Draw.findOne({ where: { id, guild_id: guild.id } });
		if (draw === null) {
			return await interaction.editReply('Tirage introuvable.');
		}

		if (draw.status !== Draw.ONGOING_STATUS) {
			return await interaction.editReply(
				'Ce tirage n\'accepte pas de participation.',
			);
		}

		if (draw.user_id === member.id) {
			return await interaction.editReply('Ce tirage t\'appartiens.');
		}

		if (draw.max_entries !== null || draw.max_user_entries !== null) {
			userParticipation = await DrawParticipation.findOne({
				where: { user_id: member.id, draw_id: id },
			});
			if (draw.max_user_entries) {
				if (
					entries > draw.max_user_entries ||
					(userParticipation &&
						userParticipation.entries + entries > draw.max_user_entries)
				) {
					return await interaction.editReply(
						'Le nombre d\'entrées que tu souhaites acheter dépasse la limite autorisée par utilisateur pour ce tirage.',
					);
				}
			}

			if (draw.max_entries) {
				const entriesSum = await DrawParticipation.sum('entries', {
					where: { draw_id: id },
				});
				if (
					entries > draw.max_entries ||
					(entriesSum + entries > draw.max_entries)
				) {
					return await interaction.editReply(
						'Le nombre d\'entrées que tu souhaites acheter dépasse la limite autorisée pour ce tirage.',
					);
				}
			}
		}

		const amount = entries * (draw.entry_price === null ? Draw.DEFAULT_PRICE : draw.entry_price);
		if (amount !== 0) {
			await interaction.editReply(
				`Pour confirmer ton achat, tapes la commande: $givek ${draw.user_id} ${amount}\n` +
				':warning: Seule cette commande sera prise en compte !\n' +
				'Une fois la commande validée, ton achat sera effectif.:\n' +
				`Pour annuler l'opération, tapes ${exitWord}.`,
			);

			await user.update({ occupied: true });

			try {
				await buyingProcess(channel, member, draw, amount);
			}
			catch (e) {
				await user.update({ occupied: false });
				return await interaction.followUp({ content: e + ', achat annulé.' });
			}

			await user.update({ occupied: false });
			if (moment(draw.end_date).isBefore(moment())) {
				return await interaction.followUp({
					content: 'Le tirage a eu le temps de se terminer, dommage pour toi. ¯\\_(ツ)_/¯\n' +
						'Demande vite un remboursement !',
				});
			}
		}

		if (!userParticipation) {
			const [userParticipations, created] = await DrawParticipation.findOrCreate({
				where: {
					user_id: member.id,
					draw_id: id,
				},
				defaults: {
					entries: entries,
				},
			});
			if (!created) {
				userParticipations.entries += entries;
				await userParticipations.save();
			}
		}
		else {
			userParticipation.entries += entries;
			await userParticipation.save();
		}

		await interaction.followUp({ content: 'Achat effectué !' });
	},
};