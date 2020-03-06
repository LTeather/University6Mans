const commando = require('discord.js-commando');
const discord  = require('discord.js');

class HelpMessage extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'h',
            group: 'other',
            memberName: 'h',
            description: 'View all commands for the server.'
        });
    }

    async run(message, args) {
        var HelpReply = new discord.RichEmbed()
        .setTitle("UK University 6Mans Bot Help")
        .addField("!a/active", "View all active matches (non-reported matches)")
        .addField("!cancel", "Cancels a game (Admin only).")
        .addField("!clear", "Clear the queue (Admin only).")
        .addField("!donate", "Enjoying the server? Then consider donating!")
        .addField("!doppla", "Doppla!?.")
        .addField("!h", "Shows this help message.")
        .addField("!leaderboard/s", "Provides a link to the leaderboards.")
        .addField("!ping", "Shows latency between bot & discord.")
        .addField("!q", "Join the queue to play a game.")
        .addField("!report", "Join the queue to play a game (!report <match id> <win/loss>).")
        .addField("!rules", "Shows the rules for this server/games.")
        .addField("!s/status", "Shows the current players in the queue.")
        .setColor(embedColor)
        .setFooter(footer, footerImage)

        message.channel.send(HelpReply);  
    }
}

module.exports = HelpMessage;