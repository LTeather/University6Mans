/**
 * Handles the creation and completion of games.
 */
class Queue {
    constructor() {
        // Internal use. Tracks the players currently in the queue
        this.queue = [];
        // Vars used to track voting.
        this.votes = [];
        this.hasVoted = [];
        this.isVoting = false;
    }

    /**
     * Tries to add a player to the queue. Returns a tuple of [success, errorMessage]
     * success = True/False , errorMessage is error if fails.
     */
    TryAddToQueue(player) {
        if (this.queue.length == 6) {
            var message = "Please wait until voting has complete to join the queue!";
            return [false, message];
        }
        // On development, let us vote as many times as we want
        if (Environment != "Development") {
            if (this.queue.includes(player)) {
                var message = "You are already in queue!";
                return [false, message];
            }
        }
        this.queue.push(player);
        return [true, null];
    }

    /**
     * Trys to remove a player to the queue. Returns a tuple of [success, errorMessage]
     * success = True/False , errorMessage is failure reason if fails.
     */
    TryRemoveFromQueue(player) {
        if (!this.queue.includes(player)) {
            var message = "You aren't in the queue!";
            return [false, message];
        }
        if (this.queue.length == 6) {
            var message = "You cannot leave when the queue is full. Please contact an admin to cancel the game. " +
                "Please remember that queue dodging is against the rules and is subject to bans.";
            return [false, message];
        }
        var newList = [];
        for (var i = 0; i < this.queue.length; ++i) {
            if (this.queue[i] != player) {
                newList.push(this.queue[i]);
            }
        }

        this.queue = newList;
        return [true, null];
    }

    voteOptions = ['b', 'r', 'c', 'mb'];
    /**
     * Trys to add a vote for a player. Returns false if there is an error
     */
    TryAddVote(player, vote) {
        if (!this.voteOptions.includes(vote)) {
            return [false, "Invalid voting option"];
        }
        if (this.isVoting == false) {
            return [false, "Voting is not currently taking place! Join the queue to play a game!"];
        }
        // If the player is in the queue.
        if (this.queue.includes(player)) {
            // On development, let us vote as many times as we like.
            if (Environment == "Development") {
                this.votes.push(vote);
                this.hasVoted.push(player);
            }
            else
            {
                if (!this.hasVoted.includes(player)) {
                    this.votes.push(vote);
                    this.hasVoted.push(player);
                }
                else {
                    return [false, "You have already voted!"];
                }
            }
            
        }
        else {
            return [false, "You can't vote when you're not in the queue!"];
        }
        return [true, null];
    }

    /**
     * Internal Use. Called when a vote is recorded. Ends voting if the threshold of votes has been reached.
     * Returns [ended:bool, vote:char, players:player[] ]
     */
    TryEndVoting() {
        let counts = {
            'b' : 0,
            'c' : 0,
            'r' : 0,
            'mb' : 0,
         }

        // Count the number of votes for balanced or random
        for (var i = 0; i < this.votes.length; ++i) {
            counts[this.votes[i]]++;
        }

        let vote = Object.entries(counts).find(([k,v]) => v==3 )
        if (!vote) {
            // if all 6 votes have been used just remove the last
            this.queue.pop();
            return [false, null, null];
        }
        
        let players = this.queue.slice();
        this.EndVoting();
        return [true, vote, players];
    }

    /**
     * Begins voting
     */
    BeginVoting() {
        this.isVoting = true;
    }

    /**
     * Ends voting. Resets all voting vars
     */
    EndVoting() {
        this.votes = [];
        this.hasVoted = [];
        this.isVoting = false;
        this.queue = [];
    }

    /**
     * Converts queue to a comma seperated formatted list of players. Used to display players in discord.
     */
    toDiscordString() {
        var discordString = "";
        if (this.queue.length == 0) {
            discordString = "Nobody is in the queue!";
        } else {
            for (var i = 0; i < this.queue.length; ++i) {
                discordString += this.queue[i] + " ";
            }
        }

        return discordString;
    }

    /**
     * Gets the number of players in the queue.
     */
    get length() {
        return this.queue.length;
    }

    /**
     * Checks whether a given player is in the queue.
     */
    includes(player) {
        return this.queue.includes(player)
    }

    /**
     * Gets the queue.
     */
    GetQueue() {
        return this.queue;
    }
}
module.exports = Queue;