const commando  = require('discord.js-commando');
const discord   = require('discord.js');
const math      = require('mathjs');

class ReportScore extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'sub',
            group: 'game',
            memberName: 'sub',
            description: 'Sub a player (!sub <@user> <@user> <gameID>)'
        });
    }

    /**
     *  Called when a 'sub' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if(message.channel.id == channels.queue) {
            var argsArray = args.split(" ");

            if(argsArray[0] == null || argsArray[1] == null || argsArray[2] == null) {
                message.reply("Incorrect usage! - Usage: !sub <@user> <@user> <gameID>");
            }
            // A Discord Id comes in the form <@!123456789>. We strip the sides to leave just the number.
            var originalPlayer = argsArray[0].slice(3, -1);
            var substitutePlayer = argsArray[1].slice(3, -1);
            var gameId = argsArray[2];
            
            if(!gameService.GameExists(gameId)) {
                message.reply("Invalid match ID! - Usage: !sub <@user> <@user> <gameID>");
                return;
            }

            var [success, error] = await gameService.ProposeSub(originalPlayer, substitutePlayer, gameId, message.author.id);
            if(!success) {
                message.reply(error);
                return;
            }

            var subReply = new discord.RichEmbed()
                .addField(`Sub has been called for: Match #${gameId}`, `<@${originalPlayer}> For: <@${substitutePlayer}>`)
                .addField("Do !confirm to activate the substitution.", "Confirms required: 3")
                .setColor(embedColor)
                .setFooter(footer, footerImage)
    
            message.channel.send(subReply);  
        }
    }
}
module.exports = ReportScore;