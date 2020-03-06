/**
 * Represents a single 6mans game.
 */
class Game {
    /**
     * Creates a new game and generates teams based on the option provided.
     */
    constructor(team1, team2, gameId) {
        this.team1 = team1;
        this.team2 = team2;
        this.gameId = gameId;
    }

    toSqlStrings() {
        var sqlStringTeam1 = "";
        var sqlStringTeam2 = ""
        sqlStringTeam1 += this.team1[0] + ",";
        sqlStringTeam1 += this.team1[1] + ",";
        sqlStringTeam1 += this.team1[2];
        sqlStringTeam2 += this.team2[0] + ",";
        sqlStringTeam2 += this.team2[1] + ",";
        sqlStringTeam2 += this.team2[2];
        return [sqlStringTeam1, sqlStringTeam2]
    }

    toDiscordStrings() {
        var discordStringteam1 = "";
        var discordStringteam2 = ""
        discordStringteam1 += "<@" + this.team1[0] + "> ";
        discordStringteam1 += "<@" + this.team1[1] + "> ";
        discordStringteam1 += "<@" + this.team1[2] + "> ";
        discordStringteam2 += "<@" + this.team2[0] + "> ";
        discordStringteam2 += "<@" + this.team2[1] + "> ";
        discordStringteam2 += "<@" + this.team2[2]+ "> ";
        return [discordStringteam1, discordStringteam2]
    }
}
module.exports = Game;