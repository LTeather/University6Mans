const commando = require('discord.js-commando');
const discord  = require('discord.js');

class LeaderboardReply extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'rules',
            group: 'other',
            memberName: 'rules',
            description: 'View the rules for the server.'
        });
    }

    async run(message, args) {
        message.reply("To view the rules please go to the <#641661288019394560> channel!");
    }
}

module.exports = LeaderboardReply;