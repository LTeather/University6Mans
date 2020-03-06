const commando = require('discord.js-commando');
const discord = require('discord.js');

class ActiveList extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'active',
            aliases: ['a'],
            group: 'game',
            memberName: 'active',
            description: 'Shows all active (un-reported) games.'
        });
    }

    /**
     *  Called when a 'active' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if (services == null) {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;

        var games = await databaseService.GetAllActiveGames();
        var active_matches = [];
        // Get all active games.
        if (games.length > 0) {
            for (var i = 0; i < games.length; ++i) {
                active_matches.push(games[i].id);
            }
        }

        // Create string to display matches in a discord message.
        var matchesString = "";

        if (active_matches.length == 0) {
            matchesString = "There are currently no active matches!";
        }
        else {
            for (var i = 0; i < active_matches.length; ++i) {
                if (i + 1 == active_matches.length) {
                    matchesString += "**#" + active_matches[i] + "**";
                }
                else {
                    matchesString += "**#" + active_matches[i] + "**, ";
                }
            }
        }

        var ActiveReply = new discord.RichEmbed()
            .addField("Current active games (by ID):", matchesString)
            .setColor(embedColor2)
            .setFooter(footer, footerImage)

        message.channel.send(ActiveReply);
    }
}

module.exports = ActiveList;