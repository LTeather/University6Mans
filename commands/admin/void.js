const commando = require('discord.js-commando');
const discord  = require('discord.js');

class VoidMatch extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'void',
            group: 'admin',
            memberName: 'void',
            description: '!void <matchID> : Gives back mmr for a reported match which has been void'
        });
    }

    /**
     *  Called when a 'void' message is read.
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

        if(args_better[0] == null) {
            message.reply("Incorrect usage! - Usage: !void <matchID>");
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
            voidGame_(args_better[0]); 
        }        

        async function voidGame_(id) {
            async function getMMR(id) {
                return await databaseService.getMatchMMR(id);
            }

            async function giveBackMMR(id, mmr) {
                var teams = await databaseService.GetAllPlayers(id);
                teams = teams[0].team1 + "," + teams[0].team2;
                teams = teams.split(",");

                var winner = await databaseService.GetWinner(id);
                winner = winner[0].winner;

                var user_mmr = [];
                
                for (var i = 0; i < teams.length; ++i) {
                    var mmr_val = await databaseService.getUserMMR(teams[i]);
                    user_mmr.push(mmr_val[0].mmr);
                }

                if(winner == 1) {
                    for (var i = 0; i < 2; ++i) {
                        await databaseService.setUserMMR(id, user_mmr[i] -= mmr);
                    }
                    for (var i = 3; i < 5; ++i) {
                        await databaseService.setUserMMR(id, user_mmr[i] += mmr);
                    }                    
                }

                if(winner == 2) {
                    for (var i = 0; i < 2; ++i) {
                        await databaseService.setUserMMR(id, user_mmr[i] += mmr);
                    }
                    for (var i = 3; i < 5; ++i) {
                        await databaseService.setUserMMR(id, user_mmr[i] -= mmr);
                    }                    
                }                           
            }

            var mmr = await getMMR(id);
            await giveBackMMR(id, mmr);
            await databaseService.removeMatch(id);

            var voidReply = new discord.RichEmbed()
            .addField("**Match Void!** (Match ID #" + id + ")", "MMR has been given back to all players.")
            .setColor(adminColor)
            .setFooter(footer, footerImage)
    
            message.channel.send(voidReply);    
        }
    }
}
module.exports = VoidMatch;