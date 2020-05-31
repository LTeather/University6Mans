const commando = require('discord.js-commando');
const discord  = require('discord.js');

class CancelGame extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'cancel',
            group: 'admin',
            memberName: 'cancel',
            description: 'Cancel an un-finished game (!cancel <matchID>)'
        });
    }

    /**
     *  Called when a 'cancel' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if(message.channel.id != channels.queue) {
            message.reply("This command can only be done in the queue channel!");
            return;
        }

        var args_str = "";
        var args_better = [];

        for (var i = 0; i < args.length; ++i) {
            args_str += args[i];
        }

        args_better = args_str.split(" ");

        if(args_better[0] != "") {
            var game = await databaseService.GetGameById(args_better[0]);
                
            games.push(game.id);
        }

        cancelGame_();

        async function cancelGame_() {
            if(args_better[0] == null) {
                message.reply("Incorrect usage! - Usage: !cancel <match id>");
                return;
            }

            if (!message.member.hasPermission("ADMINISTRATOR") || !message.member.hasPermission('MANAGE_MESSAGES')) {
                message.reply("Only Admins can use this command! Nice try... :wink:");
                return;
            }
    
           function checkArray(array, value) {
               for(var i = 0; i < array.length; ++i) {
                   if(array[i] == value) {
                       return true;
                   }
               }
    
               return false;
           }
    
            if(!checkArray(games, args_better[0])) {
                message.reply("Invalid match ID!");
                return;
            }

            else {
                const team1_channel = message.guild.channels.find(c => c.name === "#" + args_better[0] + " - Team 1");
                const team2_channel = message.guild.channels.find(c => c.name === "#" + args_better[0] + " - Team 2");
                const waiting_room = team1_channel.parent.children.find(c => c.name === "Waiting Room");

                for (var member of team1_channel.members.array().concat(team2_channel.members.array())) {
                    try {
                        await member.setVoiceChannel(waiting_room.id);
                    }
                    catch (err) {
                        continue;
                    }
                }
        
                if (team1_channel != null)
                {
                    await team1_channel.delete();
                }
                if (team2_channel != null) {
                    await team2_channel.delete();
                }

                databaseService.removeMatch(args_better[0]);
                    
                var cancelReply = new discord.RichEmbed()
                .addField("**Match Cancelled!** (Match ID #" + args_better[0] + ")", "MMR not affected due to cancellation.")
                .setColor(adminColor)
                .setFooter(footer, footerImage)
        
                message.channel.send(cancelReply);     
            }
        }
    }
}
module.exports = CancelGame;