const discord = require('discord.js');
/**
 * An instance of a sixmans lobby
 */
class SixMansInstance {
    constructor(name, databaseService, gameService, discordService, queue, channels) {
        this.name = name;
        this.databaseService = databaseService;
        this.gameService = gameService;
        this.discordService = discordService;
        this.queue = queue;
        this.channels = channels;
    }

    /**
     * Initiates the process of adding a vote.
     */
    async ProcessNewVote(message, vote) {
        var player = message.author;
        var [success, error] = this.queue.TryAddVote(player, vote);
        if(!success) {
            // TODO Replace this with a call to 'DiscordService'
            return [false, error];
        }
        var [votingComplete, vote, players] = this.queue.TryEndVoting();
        // If enough votes reached, create a new game
        if(votingComplete) {
            var game = await this.gameService.CreateGame(vote, players);
            // Adds new game to database. This ensures if the database connection/bot goes down, 
            // the game is still remembered and can be submitted later.
            await this.databaseService.AddNewGame(game);
            // Display message in the channel.
            var teamsMsg = this.createTeamMsg(vote, game);
            this.discordService.Send(message, teamsMsg);
            // Message users details
            this.messageUsers(teamsMsg, game);
            // Create voice channels
            this.discordService.CreateChannel(message, `#${game.gameId} - Team 1`);
            this.discordService.CreateChannel(message, `#${game.gameId} - Team 2`);
            
        }
        // TODO Replace this with a call to 'DiscordService'
        return [true, null];
    }

    /**
     * Publishes a message displaying the teams that have been created.
     * TODO: Move to discord service
     */
    createTeamMsg(vote, game) {
        var [discordStringTeam1, discordStringTeam2] = game.toDiscordStrings();
        if(vote == "b") { vote = "Balanced" }
        if(vote == "c") { vote = "Captains" }
        if(vote == "r") { vote = "Random" }
        var teamsMsg = new discord.RichEmbed()
            .setTitle(`***${vote}***  teams have been selected!`)
            .addField("Team 1:", discordStringTeam1)
            .addField("Team 2:", discordStringTeam2)
            .addField("Match ID (use for reporting result):", game.gameId)
            .setColor(embedColor)
            .setFooter(footer, footerImage)

        console.log(`[Game] ${vote} Match created ID: ${game.gameId}`);

        return teamsMsg;
    }

    /**
     * Messages the user's the details of the match.
     */
    messageUsers(teamsMsg, game) {
        for (var i = 0; i < game.team1.length; ++i) {
            this.discordService.SendDirectMessage(game.team1[i], "**Your match has started!** Here's the details:");
            this.discordService.SendDirectMessage(game.team1[i], teamsMsg);
        }
        for (var i = 0; i < game.team2.length; ++i) {
            this.discordService.SendDirectMessage(game.team2[i], "**Your match has started!** Here's the details:");
            this.discordService.SendDirectMessage(game.team2[i], teamsMsg);
        }
    }
}

module.exports = SixMansInstance;