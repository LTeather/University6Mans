const commando = require('discord.js-commando');
const discord  = require('discord.js');

class QueueStatus extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'status',
            aliases: ['s'],
            group: 'game',
            memberName: 'status',
            description: 'Shows the current queue status.'
        });
    }

    /**
     *  Called when a 'status' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if(message.channel.id == channels.queue) {

            var queueReply = new discord.RichEmbed()
                .addField("Players in queue: " + queue.length, queue.toDiscordString())
                .setColor(embedColor2)
                .setFooter(footer, footerImage)

            message.channel.send(queueReply);
        }        
    }


}

module.exports = QueueStatus;