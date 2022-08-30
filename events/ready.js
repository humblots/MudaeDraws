const { CronJob } = require('cron');
const { DEFAULT_PREFIX } = require('../config.json');

// Mass updates on pending auctions
// Then Mass updates on finished auctions, results calculations and sending.
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
		client.user.setActivity(`${DEFAULT_PREFIX}help`, { type: 'PLAYING' });
		console.log(`Ready! Logged in as ${client.user.tag}`);
		new CronJob(
			'0 0 0 * * *',
			() => onTick(client),
		).start();
	},
};
