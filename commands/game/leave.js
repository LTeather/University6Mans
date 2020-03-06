const commando = require('discord.js-commando');
const discord  = require('discord.js');

class LeaveGame extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'l',
            aliases: ['leave'],
            group: 'game',
            memberName: 'leave',
            description: 'remove yourself from the queue.'
        });
    }

    /**
     *  Called when a 'leave' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;

        if(message.channel.id == channels.queue) {
            // Try leave the queue
            var[success, error] = queue.TryRemoveFromQueue(message.author);
            if(!success) {
                message.reply(error);
                return;
            }

            var queueString = queue.toDiscordString();

            var leaveMsg = new discord.RichEmbed()
                .addField("Player left the queue", message.author + " has left the queue.")
                .addField("Players in queue: " + queue.length, queueString)
                .setColor(embedColor2)
                .setFooter(footer, footerImage)

            message.channel.send(leaveMsg);
        }
    }
}

module.exports = LeaveGame;