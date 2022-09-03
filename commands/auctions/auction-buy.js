const { SlashCommandBuilder, MessageCollector } = require('discord.js');
const { Auction, AuctionParticipation } = require('../../models');

const buyingProcess = async (channel, member, auction, amount) => {
	await awaitGivek(channel, member, auction, amount);
	await awaitValidation(channel, member, auction, amount);
}

const awaitGivek = async (channel, member, auction, amount) => {
	const command = "$givek";
	const filter = m => (m.content.startsWith(command) && m.author.id === member.id)
	const collector = channel.createMessageCollector({filter, time: 20 * 1000});
	
	return new Promise((resolve, reject) => {
		collector.on('collect', m => {
			collector.resetTimer({time : 20 * 1000});
			let args = m.content.substring(command.length).trim().split(/\s+/);
	
			if (args[0] !== auction.user_id) {
				m.react('❌');
				return channel.send("Vérifiez l'id");
			}
	
			if (+args[1] !== amount) {
				m.react('❌');
				return channel.send("Vérifiez le montant");
			}
	
			m.react('✅')
			resolve(+args[1]);
			collector.stop('valid');
		})

		collector.on('end', (collected, reason) => {
           if (reason == 'time') reject("Temps écoulé");
       });
	})
}

const awaitValidation = async (channel, member, auction, amount) => {
    const okChoices = ['oui', 'yes', 'o', 'y'];
	const cancelChoices = ['no', 'n'];
	const filter = m => (okChoices.concat(cancelChoices).includes(m.content.trim().toLowerCase()) && m.author.id === member.id)

	const collector = channel.createMessageCollector({filter, time: 15 * 1000});
	return new Promise((resolve, reject) => {
		collector.on('collect', m => {
			const choice = m.content.trim().toLowerCase();
			if (okChoices.includes(choice)) {
				console.log('received good choice')
				collector.stop('confirmed');
			}
			if (cancelChoices.includes(choice)) {
				reject("givek stoppé");
				collector.stop('end');
			}
		});

		collector.on('end', (collected, reason)  => {
			if(reason == 'confirmed') {
				const filter = m => m.author.id === "432610292342587392";
				const mudaeCollector = channel.createMessageCollector({filter, time: 5 * 1000 });
				mudaeCollector.on('collect', m => {
					if (
						m.content.includes(member.id) &&
						m.content.includes(amount) &&
						m.content.includes(":kakera:469835869059153940") &&
						m.content.includes(auction.user_id)
					) {
						resolve(true);
						collector.stop('end');
					}
				})
		
				collector.on('end', (collected, reason)  => {
					if(reason == 'time') reject("L'achat n'a pas abouti.");
				})
			}

            if(reason == 'time') reject("Temps écoulé");
        })
	})

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('abuy')
		.setDescription('Buy auction entries')
		.setDMPermission(false)
		.addIntegerOption(option => 
			option.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('entries')
				.setDescription('Number of entries to buy')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const {options, member, channel} = interaction;
		const id = options.getInteger('auction-id');
		const entries = options.getInteger('entries');
		let userParticipation;

		const auction = await Auction.findByPk(id);

		if (auction === null) {
			return await interaction.editReply('Enchère introuvable.');
		}

		if (auction.status !== Auction.ONGOING_STATUS);

		if (auction.user_id === member.id) {
			return await interaction.editReply('Cette enchère vous appartient.');
		}

		if (auction.max_entries !== null || auction.max_user_entries !== null) {
			userParticipation = await AuctionParticipation.findOne({where: {user_id: member.id, auction_id: id}});
			if (auction.max_user_entries) {
				if (
					entries > auction.max_user_entries ||
					(userParticipation && (userParticipation.entries + entries > auction.max_user_entries))
				) {
					return await  interaction.editReply(
						"Le nombre d'entrées que vous souhaitez acheter dépasse la limite autorisée par utilisateur pour cette enchère"
					);
				}
			}

			if (auction.max_entries) {
				const participationsCount = await AuctionParticipation.sum('entries', {where: {auction_id: id}});
				if (
					entries > auction.max_entries ||
					(userParticipation && (participationsCount + entries > auction.max_entries))
				) {
					return await interaction.editReply("Le nombre d'entrées que vous souhaitez acheter dépasse la limite autorisée pour cette enchère");
				}
			}
		}

		const amount = entries * (auction.entry_price || Auction.DEFAULT_PRICE);
		await interaction.editReply(
			`Pour confirmer votre achat, tapez la commande: \`$givek ${auction.user_id} ${amount}\`\n` +
			`Une fois la commande validée, votre achat sera effectif.`
		)
		
		buyingProcess(channel, member, auction, amount).then(async () => {
			if (moment(auction.end_date).isBefore(moment())) {
				return await interaction.followUp({content: "L'enchère a eu le temps de se terminer, dommage pour vous ¯\\_(ツ)_/¯"});
			}

			[userParticipation, created] = await AuctionParticipation.findOrCreate({
				where: {
					user_id: member.id,
					auction_id: id,
				},
				defaults: {
					entries: entries,
					created_at: new Date()
				}
			});

			if (!created) {
				userParticipation.entries += entries;
				await userParticipation.save();
			}
			
			await interaction.followUp({content: 'Achat effectué !'});
		}).catch(async e => {
			await interaction.followUp({content: "Achat annulé"});
		})
	},
};
