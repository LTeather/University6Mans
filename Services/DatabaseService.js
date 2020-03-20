
/**
 * Handles database queries to the database.  
 */
class DatabaseService {
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Gets a Game by Id
     */
    async GetGameById(id) {
        const query = `SELECT * FROM games WHERE id=${id};`;
        var [rows, _] = await this.pool.query(query);
        
        if(rows.length > 1) {
            throw `Multiple games with Id='${id}'`;
        }
        if(rows.length == 0) {
            return null;
        }
        return rows[0];
    }

    /**
     * Resets the mmr for all the leaderboards.
     */
    async ResetAllMmr() {
        const query = "UPDATE 6mans SET mmr=1000, gp=0, win=0, loss=0, streak=0 WHERE 1;";
        await this.pool.query(query);
    }

    /**
     * Soft Resets the mmr for all the leaderboards.
     */
    async SoftResetAllMMR() {
        var players = await this.GetAllPlayersForReset();

        for(var i = 0; i < players.length; ++i) {
            var mmr = await this.GetPlayerMMR(players[i].discordID);
            var softmmr = 0;

            while(mmr > 1000) {
                if((mmr - 10) < 1000) {
                    break;
                }                
                mmr -= 10;
                softmmr += 2;
            }

            var new_mmr = softmmr + 1000;

            const query = `UPDATE 6mans SET mmr=${new_mmr}, gp=0, win=0, loss=0, streak=0 WHERE discordID = ${players[i].discordID};`;
            await this.pool.query(query);            
        }
    }    

    /**
     * Gets all players ids and mmr
     */
    async GetAllPlayersForReset() {
        const query = `SELECT discordID, mmr FROM 6mans`;
        var [rows, _] = await this.pool.query(query);
     
        return rows;
    }        

    /**
     * Gets a player's MMR
     */
    async GetPlayerMMR(id) {
        const query = `SELECT mmr FROM 6mans WHERE discordID = ${id};`;
        var [rows, _] = await this.pool.query(query);
     
        return rows[0].mmr;
    }    

    /**
     * Gets all games that are in progress.
     */
    async GetAllActiveGames() {
        const query = "SELECT id FROM games WHERE winner=0 ORDER BY id ASC;";
        var [rows, _] = await this.pool.query(query);
     
        return rows;
    }

    /**
     * Submits the result of a game.
     */
    async UpdateTeams(t1str, t2str, subGame) {
        const query = "UPDATE games SET team1='" + t1str + "' , team2='" + t2str + "' WHERE id=" + subGame;
        await this.pool.query(query);
    }

    /**
     * Gets a single user. Returns null if no user found.
     * Throws if multiple users found with the same id.
     */
    async GetUser(id) {
        const query = `SELECT * FROM 6mans WHERE discordID = ${id};`;
        var [rows, _] = await this.pool.query(query);
        
        if(rows.length > 1) {
            throw `Multiple users with id=${id}`;
        }
        if(rows.length == 0) {
            return null;
        }
        return rows[0];
    }

    /**
     * Adds a new user to the database.
     */
    async AddNewUser(id, username) {
        const query = `INSERT INTO 6mans (discordID, username) VALUES ('${id}', '${username}');`;
        await this.pool.query(query);
    }

    /**
     * Gets the latest incremental Id. This will be used to set the games.
     */
    async GetMaxId() {
        const query = "SELECT actual_gameID FROM misc";
        var [rows, _] = await this.pool.query(query);

        if(rows.length == 0) {
            throw "Could not find actual_gameId";
        }
        if(rows.length > 1) {
            throw "Found multiple rows in misc";
        }
        return rows[0].actual_gameID;
    }

    /**
     * Gets a list of mmr in order
     */
    async GetOrderedMmr() {
        const query = 'SELECT discordID FROM 6mans ORDER BY mmr DESC LIMIT 3';
        var [rows, _] = await this.pool.query(query);

        return rows;
    }

    /**
     * Adds a new game to the database
     */
    async AddNewGame(game) {
        // Add game to database.
        var [sqlStringTeam1, sqlStringTeam2] = game.toSqlStrings();

        var query = `INSERT INTO games (id, team1, team2) VALUES (${game.gameId}, '${sqlStringTeam1}', '${sqlStringTeam2}')`;
        await this.pool.query(query);

        // Update database to set the new gameID.
        var query = "UPDATE misc SET actual_gameID=" + game.gameId.toString() + " WHERE 1";
        await this.pool.query(query);
    }

    /**
     * Retrieves all users from the database that are in the list of player Ids
     */
    async GetAllUsers(users) {
        var query = "SELECT discordID, mmr FROM 6mans WHERE discordID IN (";
        // Create SQL string to get all the mmrs of all players in the queue.
        for (var i = 0; i < users.length; ++i) {
            query += `${users[i].id}`;
            // For the last one, we don't need another comma
            if (i < users.length - 1) {
                query += ", ";
            }
        }
        query += ");";
        var [rows, _] = await this.pool.query(query);
        return rows;
    }

    /**
     * Retrieves all players from a match and returns in an array.
     */
    async GetAllPlayers(id) {
        const query = `SELECT team1, team2 FROM games WHERE id='${id}'`;
        var [rows, _] = await this.pool.query(query);
        
        return rows;
    }    

    /**
     * Retrieves the winner of a match.
     */
    async GetWinner(id) {
        const query = `SELECT winner FROM games WHERE id='${id}'`;
        var [rows, _] = await this.pool.query(query);
        
        return rows;
    }

    /**
     * Updates a user's stats.
     */
    async UpdateUserStats(user) {
        const query = `
        UPDATE 6mans SET mmr='${user.mmr}', gp='${user.gp}', streak='${user.streak}', win='${user.win}', loss='${user.loss}', 
        total_gp='${user.total_gp}', total_wins='${user.total_wins}', total_losses='${user.total_losses}'
        WHERE discordID='${user.discordID}'
        `;
        await this.pool.query(query);
    }

    /**
     * Updates a game with the result.
     */
    async UpdateGame(id, winner) {
        const query = `UPDATE games SET winner=${winner} WHERE id='${id}'`;
        await this.pool.query(query);
    }

    /**
     * Updates a game with the result.
     */
    async GetHasDonated() {
        const query = "SELECT * FROM 6mans WHERE has_donated=1 ORDER BY username ASC";
        var [rows, _] = await this.pool.query(query);

        return rows;
    }  

    /**
     * Updates a game with the time of reporting (match finished).
     */
    async setMatchReportTime(id) {
        var dateTime;
        dateTime = new Date();
        dateTime = dateTime.getUTCFullYear() + '-' +
            ('00' + (dateTime.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + dateTime.getUTCDate()).slice(-2) + ' ' + 
            ('00' + dateTime.getUTCHours()).slice(-2) + ':' + 
            ('00' + dateTime.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + dateTime.getUTCSeconds()).slice(-2);

        const query = `UPDATE games set time_reported='${dateTime}' WHERE id='${id}'`;
        await this.pool.query(query);
    }  

    /**
     * Updates a game with the mmr lost/gained.
     */
    async setMatchMMR(id, mmr) {
        const query = `UPDATE games set mmr='${mmr}' WHERE id='${id}'`;
        await this.pool.query(query);
    }  


    /**
     * Updates a game with the mmr lost/gained.
     */
    async setMatchMMR(id, mmr) {
        const query = `UPDATE games set mmr='${mmr}' WHERE id='${id}'`;
        await this.pool.query(query);
    }  

    /**
     * Gets the mmr lost/gained from a match.
     */
    async getMatchMMR(id) {
        const query = `SELECT mmr FROM games WHERE id='${id}'`;
        var [rows, _] = await this.pool.query(query);

        return rows;
    }      

    /**
     * Gets the mmr of a user.
     */
    async getUserMMR(id) {
        const query = `SELECT mmr FROM 6mans WHERE discordID='${id}'`;
        var [rows, _] = await this.pool.query(query);

        return rows;
    }        

    /**
     * Gets the mmr of a user.
     */
    async setUserMMR(id, mmr) {
        const query = `UPDATE 6mans set mmr='${mmr}' WHERE discordID='${id}'`;
        var [rows, _] = await this.pool.query(query);

        return rows;
    }       

    /**
     * Set the steamID of a player
     * @param {string} id 
     * @param {string} steamID 
     */
    async setUserSteam(id, steamID) {
        const query = 'UPDATE 6mans SET steamID=? WHERE discordID=?';
        await this.pool.query(query, steamID, id);
    }

    /**
     * Get the steamID of a player
     * @param {string} id  
     */
    async getUserSteam(id) {
        const query = 'SELECT steamID FROM 6mans WHERE discordID=?';
        let [_, rows] = await this.pool.query(query, id);
        return rows;
    }


    /**
     * Removes a match from the database after cancellation or voiding.
     */
    async removeMatch(id) {
        const query = `DELETE FROM games WHERE id='${id}'`;
        var [rows, _] = await this.pool.query(query);

        return rows;
    }      
}
module.exports = DatabaseService;
