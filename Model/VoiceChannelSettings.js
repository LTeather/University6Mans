/**
 * Contains default settings for created voice channels
 */
class VoiceChannelSettings {
    constructor(parent) {
        this.bitrate = 96000
        this.userLimit = 3
        this.parent = parent
        this.type = "voice"
    }
}
module.exports = VoiceChannelSettings;