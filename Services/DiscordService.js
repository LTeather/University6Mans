require('discord.js');

/**
 * Handles all commands relating to the discord API.
 */
class DiscordService {
    constructor(bot, voiceChannelSettings, serverId) {
        this.bot = bot;
        this.voiceChannelSettings = voiceChannelSettings;
        this.serverId = serverId;
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
    async SendDirectMessage(userId, text) {
        var user = await this.bot.fetchUser(userId, false);
        return user.send(text);
    }

    async LogGame(embed) {
        var guild = this.bot.guilds.get(this.serverId);
        var channel = guild.channels.find(c => c.name === "game-logs");
        channel.send(embed);
    }
}
module.exports = DiscordService;
