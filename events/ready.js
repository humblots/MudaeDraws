const { CronJob } = require('cron');
const { Client } = require('discord.js');

/**
 *
 * @param {Client} client
 */
const onTick = async client => {
	let channel = client.channels.cache.get('819166815414124555');
	if (channel === null) {
		channel = await client.channels.fetch('819166815414124555');
		if (channel === null) return console.log('Unknow channel');
	}
	channel.send('Temp Cron action: sending message every day at midnight if set properly');
};

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		 const job = new CronJob(
			"0 0 0 * * *",
			() => onTick(client)
		 ).start();
	},
};
