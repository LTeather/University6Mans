/**
 * Represents a substitution for a game.
 */
class Sub {
    /**
     * Creates a Sub.
     */
    constructor(originalPlayer, substitutePlayer, game) {
        this.originalPlayer = originalPlayer;
        this.substitutePlayer = substitutePlayer;
        this.game = game;
    }
}
module.exports = Sub;