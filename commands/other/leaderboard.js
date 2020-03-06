const commando = require('discord.js-commando');
const discord  = require('discord.js');

class LeaderboardReply extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'leaderboard',
            aliases: ['leaderboards', 'lb'],
            group: 'other',
            memberName: 'leaderboard',
            description: 'View the leaderboards for the server.'
        });
    }

    async run(message, args) {
        message.reply("To view the leaderboards go here: http://university6mans.com/");
    }
}

module.exports = LeaderboardReply;