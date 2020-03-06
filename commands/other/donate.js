const commando = require('discord.js-commando');
const discord  = require('discord.js');

class DonationLink extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'donate',
            group: 'other',
            memberName: 'donate',
            description: 'Enjoying the server? Consider donating to help the development :wink:'
        });
    }

    async run(message, args) {
        message.reply("To donate towards the development of the bot, please use this link: http://university6mans.com/Supporters \n\nThanks in advance! :wink:");
    }
}

module.exports = DonationLink;