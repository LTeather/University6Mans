const Game = require('../Model/Game');
const Sub = require('../Model/Sub')
const Commando = require('discord.js-commando');
const discord = require('discord.js');

const emoji = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣"];

/**
 * Handles the creation and completion of games.
 */
class GameService {
    constructor(minGameID, games, databaseService, discordService, bot) {
        /* Services */
    
        // Database service.
        this.databaseService = databaseService;

        // Discord service.
        this.discordService = discordService;

        /* Game variables */

        // Stores the smallest available ID. Used to create uniquely identifiable games.
        this.MinGameID = minGameID;
        // Contains all games
        this.games = games;

        /* Subbing variables */

        this.hasVotedSub = [];
        // The current proposed Sub. Null means no currently proposed sub
        this.proposedSub = null;

        this.bot = bot;
    }

    /**
     * Creates a game for the given vote.
     */
    async CreateGame(vote, playerList, message) {
        switch(vote){
            case "b":
                var game = await this.CreateBalancedGame(playerList);
                break;
            case "r":
                var game = await this.CreateRandomGame(playerList);
                break;
            case "c":
                var game = await this.CreateCaptainsGame(playerList, message);
                break;
        }
        this.games.push(game.gameId);
        return game;
    }

    /**
     * Creates a balanced game
     */
    async CreateBalancedGame(playerList) {
        var orderedPlayers = [];
        var players = await this.databaseService.GetAllUsers(playerList);
        if (players == null) {
            throw "Couldn't retrieve players details";
        } else {
            for (var i = 0; i < players.length; ++i) {
                orderedPlayers.push({ discordID: players[i].discordID, mmr: players[i].mmr });
            }
        }
        this.SortMMR(orderedPlayers);
        return this.CreateBalancedTeams(orderedPlayers);
    }

    /**
     * Creates a random game.
     */
    async CreateRandomGame(playerList) {
        var pickedPlayers = [];
        var team1 = [];
        var team2 = [];
        // Choose 3 indexes at random
        while (pickedPlayers.length < 3) {
            var rand = Math.floor(Math.random() * 6);
            if (!pickedPlayers.includes(rand)) {
                pickedPlayers.push(rand);
            }
        }

        // Create the teams accordingly.
        for (var i = 0; i < 6; ++i) {
            var playerId = playerList[i].id;
            if (pickedPlayers.includes(i)) {
                team1.push(playerId)
            } else {
                team2.push(playerId);
            }
        }
        var newGameId = this.CreateNewGameID();
        return new Game(team1, team2, newGameId);
    }

    /**
     * Creates a captains game.
     */
    async CreateCaptainsGame(playerList, message) {
        var captains = [];
        var choices = [];
        var team1 = [];
        var team2 = [];

        // Choose the two captains at random
        while (captains.length < 2) {
            var rand = Math.floor(Math.random() * 6);
            if (!captains.includes(rand)) {
                captains.push(rand);
            }
        }

        var captain1 = playerList[captains[0]].id;
        var captain2 = playerList[captains[1]].id;

        this.discordService.Send(message, "**Team 1 Captain is:** <@" + captain1 + ">\n\n**Team 2 Captain is:** <@" + captain2 + ">");

        // Create list of 4 players
        var listNum = 1;
        var choiceList = {};

        var teamsMsg = new discord.RichEmbed()
            .setTitle("Captain choice")
            .setDescription("You get the first choice!")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        var playersString = "";

        for (var i = 0; i < 6; i++) {
            if (captains.includes(i) || choices.includes(i)) { continue; }
            playersString += `${emoji[listNum]} <@${playerList[i].id}>\n`;
            choiceList[listNum] = i;
            listNum++;
        }

        teamsMsg.addField("Name", playersString, true);

        // DM first captain with 4 players
        var message = await this.discordService.SendDirectMessage(captain1, teamsMsg)
        for (var i = 1; i < listNum; i++) {
            await message.react(`${emoji[i]}`);
        }

        // First choice
        var choice = await this.getChoice(1, message);
        choices.push(choiceList[choice]);
        var confirmMsg = new discord.RichEmbed()
            .setDescription("You chose <@" + playerList[choiceList[choice]].id + ">")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        this.discordService.SendDirectMessage(captain1, confirmMsg);

        // Create list of 3 players
        listNum = 1;
        choiceList = {};

        var teamsMsg = new discord.RichEmbed()
            .setTitle("Captain choice")
            .setDescription("You get the second choice!")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        var playersString = "";

        for (var i = 0; i < 6; i++) {
            if (captains.includes(i) || choices.includes(i)) { continue; }
            playersString += `${emoji[listNum]} <@${playerList[i].id}>\n`;
            choiceList[listNum] = i;
            listNum++;
        }

        teamsMsg.addField("Name", playersString, true);

        // DM second captain with 3 players
        var message = await this.discordService.SendDirectMessage(captain2, teamsMsg)
        for (var i = 1; i < listNum; i++) {
            await message.react(`${emoji[i]}`);
        }

        // Second choice
        choice = await this.getChoice(2, message);
        choices.push(choiceList[choice]);
        var confirmMsg = new discord.RichEmbed()
            .setDescription("You chose <@" + playerList[choiceList[choice]].id + ">")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        this.discordService.SendDirectMessage(captain2, confirmMsg);
        
        // Create list of 2 players
        listNum = 1;
        choiceList = {};

        var teamsMsg = new discord.RichEmbed()
            .setTitle("Captain choice")
            .setDescription("You get the third and final choice!")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        var playersString = "";

        for (var i = 0; i < 6; i++) {
            if (captains.includes(i) || choices.includes(i)) { continue; }
            playersString += `${emoji[listNum]} <@${playerList[i].id}>\n`;
            choiceList[listNum] = i;
            listNum++;
        }
        
        teamsMsg.addField("Name", playersString, true);

        // DM second captain with 2 players
        var message = await this.discordService.SendDirectMessage(captain2, teamsMsg)
        for (var i = 1; i < listNum; i++) {
            await message.react(`${emoji[i]}`);
        }

        // Third choice
        choice = await this.getChoice(3, message);
        choices.push(choiceList[choice]);
        var confirmMsg = new discord.RichEmbed()
            .setDescription("You chose <@" + playerList[choiceList[choice]].id + ">")
            .setColor(embedColor)
            .setFooter(footer, footerImage)
        this.discordService.SendDirectMessage(captain2, confirmMsg);
        
        // Remaining player
        for (var i = 0; i < 6; ++i) {
            if (!(captains.includes(i) || choices.includes(i))) {
                choices.push(i);
                break;
            }
        }

        // Add players to teams
        team1.push(captain1);
        team1.push(playerList[choices[0]].id);
        team1.push(playerList[choices[3]].id);        
        team2.push(captain2);
        team2.push(playerList[choices[1]].id);
        team2.push(playerList[choices[2]].id);

        var newGameId = this.CreateNewGameID();
        return new Game(team1, team2, newGameId);
    }    

    async getChoice(num, message) {
        var maxChoice;
        var choice;
        
        switch (num) {
            case 1:
                maxChoice = 4;
                break;
            case 2:
                maxChoice = 3;
                break;
            case 3:
                maxChoice = 2;
                break;
            default:
                break;
        }

        var validEmoji = emoji.slice(1, maxChoice+1);

        // Await reactions
        const filter = (reaction, user) => validEmoji.includes(reaction.emoji.name) && !user.bot;

        await message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                choice = emoji.indexOf(collected.first().emoji.name);
            })
            .catch(collected => {
                // If no choice after 60 seconds, choose randomly
                choice = Math.ceil(Math.random() * maxChoice);
            });
        return choice;
    }

    /**
     * Proposes a substitution for a game. Validates that the user is in the game.
     * Returns [success:bool, error:string]
     */
    async ProposeSub(originalPlayer, substitutePlayer, gameId, authorId) {
        if(this.proposedSub != null) {
            return [false, "Please wait until the previous sub voting is over!"];
        }

        var game = await this.databaseService.GetGameById(gameId);

        if(game.winner != 0) {
            return [false, "You can't sub for a game that's already ended!"];
        }

        if(!game.team1.includes(authorId) && !game.team2.includes(authorId)) {
            return [false, "You can't call a sub vote for a game that you aren't a part of!"];
        }

        this.proposedSub = new Sub(originalPlayer, substitutePlayer, game);
        return [true, null]; 
    }

    /**
     * Trys to confirm a sub
     */
    TryConfirmSub(authorId) {
        if(this.proposedSub == null) {
            return [false, "There is currently no sub ongoing!"]
        }
        if(Environment != "Development") {
            if(this.hasVotedSub.includes(authorId)) {
                return [false, "You have already confirmed the sub!"]
            }
        }
        var game = this.proposedSub.game;
        if(!game.team1.includes(authorId) && !game.team2.includes(authorId)) { 
            return [false, "You aren't in the current game!"];
        }
        this.hasVotedSub.push(authorId);
        return [true, null];
    }

    /**
     * Trys to commit the substitution. Commits the substitution and returns it if voting threshold met. Returns null otherwise.
     */
    async TryCommitSubstitution() {
        if(this.hasVotedSub.length == 3) {
            await this.CommitSubstitution(this.proposedSub);
            // Create a new sub as we need to remove the old one.
            var sub = new Sub(this.proposedSub.originalPlayer, this.proposedSub.substitutePlayer, this.proposedSub.game);
            this.EndSubstitution();
            return sub;
        }
        return null;
    }

    async CommitSubstitution(sub) {
        var team1str = sub.game.team1.replace(sub.originalPlayer, sub.substitutePlayer);
        var team2str = sub.game.team2.replace(sub.originalPlayer, sub.substitutePlayer);
        await this.databaseService.UpdateTeams(team1str, team2str, sub.game.id);
    }

    /**
     * Ends substitution
     */
    EndSubstitution() {
        this.hasVotedSub = [];
        this.proposedSub = null;
    }

    /**
     * Sorts players by mmr
     */
    SortMMR(balancedmmr) {
        balancedmmr.sort((a, b) => {
            if (a.mmr > b.mmr) { return 1; }
            else if (a.mmr == b.mmr) { return 0; }
            else { return -1; }
        });
        return balancedmmr;
    }

    /**
     * Arranges balanced teams.
     */
    CreateBalancedTeams(balancedmmr) {
        var team1 = [];
        var team2 = [];
        // On dev, we will likely only have one person queueing. This means the sql query will only return 1 user.
        // So lets fill it with users to make sure it has enough to run this code.
        if(Environment == "Development") {
            var noOfPlayers = balancedmmr.length;
            for(var i = 0; i<6-noOfPlayers; ++i) {
                balancedmmr.push(balancedmmr[0])
            }
        }
        team1.push(balancedmmr[0].discordID);
        team1.push(balancedmmr[2].discordID);
        team1.push(balancedmmr[4].discordID);
        team2.push(balancedmmr[1].discordID);
        team2.push(balancedmmr[3].discordID);
        team2.push(balancedmmr[5].discordID);
        var newGameId = this.CreateNewGameID();
        return new Game(team1, team2, newGameId);
    }

    CreateNewGameID() {
        return this.MinGameID ++
    }

    GameExists(gameId) {
        for (var i = 0; i < this.games.length; ++i) {
            if (this.games[i] == gameId) {
                return true;
            }
        }
        return false;
    }
}
module.exports = GameService;