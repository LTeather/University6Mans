const commando = require('discord.js-commando');
const discord = require('discord.js');
const math = require('mathjs');

class ReportScore extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'report',
            group: 'game',
            memberName: 'report',
            description: 'Report the result of the game (!report <match id> <win/loss>)'
        });
    }

    /**
     *  Called when a 'report' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if (message.channel.id == channels.report) {
            // Validate command
            var argsArray = args.split(" ");
            var gameId = argsArray[0];
            var result = argsArray[1];
            var [isValid, error] = this.validCommand(gameId, result)
            if (!isValid) {
                message.reply(error);
                return;
            }

            // Check game exists
            if (!gameService.GameExists(gameId)) {
                message.reply("Invalid match ID!");
                return;
            }

            // Get the game
            var game = await databaseService.GetGameById(gameId);
            if (game.winner != 0) {
                message.reply("This game has already been reported!");
                return;
            }

            var team1 = game.team1.split(",");
            var team2 = game.team2.split(",");

            // Work out which team is reported to win from the message.
            var gameWinner = this.getWinningTeam(message.author.id, result, team1, team2);
            // Make sure the author is part of the game.
            if(gameWinner == 0) {
                message.reply("You can't report a score for a game that you aren't a part of!");
                return;
            }
            // Then do all the reporting logic.
            var mmr_gain = await this.reportGame(databaseService, gameService, game, gameWinner);
            // Delete the left over voice channels.
            this.deleteVoiceChannels(gameId, message);
            // Output report message to the user.
            var reportReply = new discord.RichEmbed()
                .addField(`Match complete! (Match ID #${game.id})`, `Team ${gameWinner} has won! Score reported.`)
                .addField("MMR Gain/Loss", "+/- **" + mmr_gain + "**")
                .setColor(embedColor3)
                .setFooter(footer, footerImage)

            message.channel.send(reportReply);

            console.log(`[Game] Match reported ID: ${game.id}`);
        }
    }

    validCommand(gameId, result) {
        var error = null;
        var isValid = true;
        const validScores = ["win", "loss", "w", "l", "dub"];

        if (gameId == null || result == null) {
            error = "Incorrect usage! - Usage: !report <match id> <win/loss>";
            isValid = false;
        }

        else {
            result = result.toLowerCase();
            if (!(validScores.includes(result))) {
                error = "There has been an error finding the winning team for this game. Please try again!";
                isValid = false;
            }
        }
        return [isValid, error];
    }

    getWinningTeam(authorId, result, team1, team2) {
        var gameWinner = 0;
        // If the person who reported is on team 1
        if (team1.includes(authorId)) {
            if (result == "win" || result == "w" || result == "dub") {
                gameWinner = 1;
            }
            else {
                gameWinner = 2;
            }
        }

        else if (team2.includes(authorId)){
            if (result == "win" || result == "w" || result == "dub") {
                gameWinner = 2;
            }
            else {
                gameWinner = 1;
            }
        }
        return gameWinner;
    }

    async reportGame(databaseService, gameService, game, gameWinner) {
        // Find the winner
        var team1 = game.team1.split(",");
        var team2 = game.team2.split(",");

        if (gameWinner == 1) {
            var winningTeamIds = team1;
            var losingTeamIds = team2;
        } else {
            var winningTeamIds = team2;
            var losingTeamIds = team1;
        }

        var winningTeam = []
        var losingTeam = []
        for (var i = 0; i < winningTeamIds.length; ++i) {
            var user = await databaseService.GetUser(winningTeamIds[i]);
            if (user != null) {
                winningTeam.push({ discordID: user.discordID, mmr: user.mmr, gp: user.gp, win: user.win, loss: user.loss, streak: user.streak, total_gp: user.total_gp, total_wins: user.total_wins, total_losses: user.total_losses });
            }
        }

        for (var j = 0; j < losingTeamIds.length; ++j) {
            var user = await databaseService.GetUser(losingTeamIds[j]);
            if (user != null) {
                losingTeam.push({ discordID: user.discordID, mmr: user.mmr, gp: user.gp, win: user.win, loss: user.loss, streak: user.streak, total_gp: user.total_gp, total_wins: user.total_wins, total_losses: user.total_losses });
            }
        }

        // Calculate mmr gain
        var winningTeam_avg = 0;
        var losingTeam_avg = 0;
        for (var i = 0; i < winningTeam.length; ++i) {
            winningTeam_avg += winningTeam[i].mmr;
        }
        for (var i = 0; i < losingTeam.length; ++i) {
            losingTeam_avg += losingTeam[i].mmr;
        }
        winningTeam_avg = winningTeam_avg / 3;
        losingTeam_avg = losingTeam_avg / 3;

        var mmr_diff = winningTeam_avg - losingTeam_avg;

        // Calculate mmr
        var mmr_gain = this.calculateMmr(mmr_diff)

        var winningTeam_avgStr = winningTeam_avg.toFixed(1);
        var losingTeam_avgStr = losingTeam_avg.toFixed(1);
        var winningTeam_avgAfterStr = (winningTeam_avg + mmr_gain).toFixed(1);
        var losingTeam_avgAfterStr = (losingTeam_avg - mmr_gain).toFixed(1);

        // Log to #game-logs
        var winningMsg = "";
        var losingMsg = "";
        for (var i = 0; i < winningTeam.length; ++i) {
            winningMsg += `<@${winningTeam[i].discordID}> ${winningTeam[i].mmr} -> ${winningTeam[i].mmr + mmr_gain} (+${mmr_gain})\n`;
        }
        for (var i = 0; i < losingTeam.length; ++i) {
            losingMsg += `<@${losingTeam[i].discordID}> ${losingTeam[i].mmr} -> ${losingTeam[i].mmr - mmr_gain} (-${mmr_gain})\n`;
        }
        if (gameWinner == 1) {
            var Team1Average = winningTeam_avgStr;
            var Team1AverageAfter = winningTeam_avgAfterStr;
            var Team2Average = losingTeam_avgStr;
            var Team2AverageAfter = losingTeam_avgAfterStr;
            var Team1Results = winningMsg;
            var Team2Results = losingMsg;
        }
        else {
            var Team1Average = losingTeam_avgStr;
            var Team1AverageAfter = losingTeam_avgAfterStr;
            var Team2Average = winningTeam_avgStr;
            var Team2AverageAfter = winningTeam_avgAfterStr;
            var Team1Results = losingMsg;
            var Team2Results = winningMsg;
        }
        var logMsg = new discord.RichEmbed()
            .setTitle(`Match ${game.id} has been reported!`)
            .addField(`Team 1 (Average ${Team1Average} -> ${Team1AverageAfter})`, Team1Results)
            .addField(`Team 2 (Average ${Team2Average} -> ${Team2AverageAfter})`, Team2Results)
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        await gameService.LogGame(logMsg);
        // Update stats for all the players in the lobby.
        await this.UpdatePlayerStats(databaseService, winningTeam, losingTeam, mmr_gain);
        // Update game.
        await databaseService.UpdateGame(game.id, gameWinner);
        await databaseService.setMatchReportTime(game.id);
        await databaseService.setMatchMMR(game.id, mmr_gain);
        return mmr_gain;
    }

    async UpdatePlayerStats(databaseService, winningTeam, losingTeam, mmr_gain) {

        //Update teams
        for (var i = 0; i < winningTeam.length; ++i) {
            // Update winning team stats
            winningTeam[i].mmr += mmr_gain;
            winningTeam[i].streak = calculateStreak(winningTeam[i].streak, 1);
            winningTeam[i].gp += 1;
            winningTeam[i].win += 1;
            winningTeam[i].total_gp += 1;
            winningTeam[i].total_wins += 1;
            // Update losing team stats
            losingTeam[i].mmr -= mmr_gain;
            losingTeam[i].streak = calculateStreak(losingTeam[i].streak, -1);
            losingTeam[i].gp += 1;
            losingTeam[i].loss += 1;
            losingTeam[i].total_gp += 1;
            losingTeam[i].total_losses += 1;
            // Update database
            await databaseService.UpdateUserStats(winningTeam[i]);
            await databaseService.UpdateUserStats(losingTeam[i]);
        }

        function calculateStreak(streak, plusOrMinus) {
            // If streak continuing (i.e. a loss or win streak).
            if (streak * plusOrMinus > 0) {
                streak += plusOrMinus;
            }
            // If streak is broken.
            else {
                streak = plusOrMinus;
            }
            return streak;
        }
    }

    calculateMmr(mmr_diff) {
        var mmr_gain;

        // MMR diff is 
        // winningTeam_avg - losingTeam_avg
        // So 
        // A positive diff means winning team was stronger than losing team (by MMR)
        // A negative diff means winning team was weaker than losing team (by MMR)
        // Larger positive diff means W much stronger than L
        // Larger negative diff means W much weaker than L

        mmr_gain = Math.round(25.5 - ((mmr_diff+200)*11)/400);
        
        // mmr_diff                                 -200 to 200
        // mmr_diff + 200                           0 to 400
        // (mmr_diff + 200)*11                      0 to 4400
        // ((mmr_diff + 200)*11)/400                0 to 11
        // 25.5 - ((mmr_diff + 200)*11)/400         25.5 to 14.5
        // round(25.5 - ((mmr_diff + 200)*11)/400)    26 to 14

        mmr_gain = Math.min(26, Math.max(14, mmr_gain));

        return mmr_gain;
    }

    async deleteVoiceChannels(gameId, message) {
        const team1_channel = message.guild.channels.find(c => c.name === "#" + gameId + " - Team 1");
        const team2_channel = message.guild.channels.find(c => c.name === "#" + gameId + " - Team 2");
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
    }
}

module.exports = ReportScore;
