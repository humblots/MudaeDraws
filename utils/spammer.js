const crypto = require('crypto');
const getMessages = async (channel, limit) => {
	return await channel.messages.fetch({ limit: limit });
};

function Spammer() {
	this.looper = null;
	this.count = 0;
}

Spammer.prototype.start = async function(channel) {
	if (this.looper === null) {
		this.looper = setInterval(async () => {
			await channel.send(crypto.randomBytes(6).toString('hex'));
			this.count++;
			if (this.count >= 10) {
				await channel.bulkDelete(await getMessages(channel, this.count));
				this.count = 0;
			}
		}, 1000);
	}
};

Spammer.prototype.stop = async function(channel) {
	if (this.looper !== null) {
		clearInterval(this.looper);
		await channel.bulkDelete(await getMessages(channel, this.count));
		this.looper = null;
		this.count = 0;
	}
};

const spammer = new Spammer();

module.exports = spammer;