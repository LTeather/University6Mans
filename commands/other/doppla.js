const commando = require('discord.js-commando');
const discord  = require('discord.js');

class Doppla extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'doppla',
            group: 'other',
            memberName: 'doppla',
            description: 'Doppla #1 Memer.'
        });
    }

    async run(message, args) {
        var DopplaReply = new discord.RichEmbed()
        .addField("Doppla", "Doppla, Doppla'ing, to Doppla, Doppla'ed.\nTo Doppla or not to Doppla, that is the question...\n\nEnjoying the server/bot? Then consider donating! !donate")
        .setThumbnail("https://i.imgur.com/Bjthqaw.png")
        .setColor(embedColor)
        .setFooter(footer, footerImage)

        message.channel.send(DopplaReply); 
    }
}

module.exports = Doppla;