const commando = require('discord.js-commando');
const discord  = require('discord.js');

class FlipMatch extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'flip',
            group: 'admin',
            memberName: 'flip',
            description: '!flip <matchID> : Flip the result of a wrongly reported game'
        });
    }

    checkArray(array, value) {
        for(var i = 0; i < array.length; ++i) {
            if(array[i] == value) {
                return true;
            }
        }
        return false;
    }

    /**
     *  Called when a 'flip' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if (message.channel.id != channels.queue) {
            message.reply("This command can only be done in the queue channel!");
            return;
        }

        var args_str = "";

        for (var i = 0; i < args.length; ++i) {
            args_str += args[i];
        }

        var id = args_str.split(" ")[0];

        if (id != "") {
            var game = await databaseService.GetGameById(id);
                
            games.push(game.id);
        }

        if (id == null) {
            message.reply("Incorrect usage! - Usage: !flip <matchID>");
            return;
        }

        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.reply("Only Admins can use this command! Nice try... :wink:");
            return;
        }

        if (!this.checkArray(games, id)) {
            message.reply("Invalid match ID!");
            return;
        }

        else {
            await this.flipGame(databaseService, message, id); 
        }        
    }
    
    async flipUserStats(databaseService, id, mmr) {
        var teams = await databaseService.GetAllPlayers(id);
        teams = teams[0].team1 + "," + teams[0].team2;
        var players = teams.split(",");
        var winner = await databaseService.GetWinner(id);
        winner = winner[0].winner;
        
        for (var i = 0; i < players.length; ++i) {
            var user = await databaseService.GetUser(players[i]);
            var winnerCheck = 1
            if (i > 2) {
                winnerCheck = 2
            }
            if (winner == winnerCheck) {
                user.mmr -= 2*mmr;
                user.win -= 1;
                user.total_wins -= 1;
                user.loss += 1;
                user.total_losses += 1;
            }
            else {
                user.mmr += 2*mmr;
                user.win += 1;
                user.total_wins += 1;
                user.loss -= 1;
                user.total_losses -= 1;
            }
            if (user.streak > 1) {
                user.streak = -1
            }
            else if (user.streak < -1) {
                user.streak = 1
            }
            else {
                user.streak *= -1
            }
            // Update database
            await databaseService.UpdateUserStats(user);
        }
    }

    async flipMatchWinner(databaseService, game) {
        var winner = 1
        if (game.winner == 1) {
            winner = 2
        }
        await databaseService.UpdateGame(game.id, winner);
    }

    async flipGame(databaseService, message, id) {
        var game = await databaseService.GetGameById(id);
        await this.flipUserStats(databaseService, id, game.mmr);
        await this.flipMatchWinner(databaseService, game);

        var flipReply = new discord.RichEmbed()
        .addField("**Match flipped!** (Match ID #" + id + ")", "The MMR for this game has been flipped.")
        .setColor(adminColor)
        .setFooter(footer, footerImage)

        message.channel.send(flipReply);
    }
}
module.exports = FlipMatch;