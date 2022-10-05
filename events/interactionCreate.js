module.exports = {
	name: 'interactionCreate',
	execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const { commandName } = interaction;
			const command = client.slashCommands.get(commandName);
			if (!command) return;

			try {
				command.execute(client, interaction);
			}
			catch (e) {
				console.log(e);
			}
		}
	},
};