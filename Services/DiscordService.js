require('discord.js');

/**
 * Handles all commands relating to the discord API.
 */
class DiscordService {
    constructor(bot, voiceChannelSettings) {
        this.bot = bot;
        this.voiceChannelSettings = voiceChannelSettings;
    }

    /**
     * Sends a reply to the message.
     */
    async Reply(message, replyText) {
        message.reply(replyText);
    }

    /**
     * Sends a message to a channel
     */
    async Send(message, messageText) {
        message.channel.send(messageText)
    }

    /**
     * Creates a team channel.
     */
    CreateChannel(message, channelName) {
        message.guild.createChannel(channelName, this.voiceChannelSettings)
            .then(channel => channel.lockPermissions())
            .catch(console.error);
    }

    /**
     * Sends a DM to a user 
     */
    SendDirectMessage(userId, text) {
        this.bot.fetchUser(userId, false).then(user => {
            user.send(text);
        });
    }
}
module.exports = DiscordService;
