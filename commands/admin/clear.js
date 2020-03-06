const commando = require('discord.js-commando');
const discord  = require('discord.js');

class ClearQueue extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'clear',
            group: 'admin',
            memberName: 'clear',
            description: 'Clear players from the active queue'
        });
    }

    /**
     *  Called when a 'clear' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if (!message.member.hasPermission("ADMINISTRATOR")  || !message.member.hasPermission('MANAGE_MESSAGES')) {
            message.reply("Only admins/mods can use this command! Nice try... :wink:");
            return;
        }
        else {
            if(message.channel.id == channels.queue) {
                queue.EndVoting();
                
                var clearReply = new discord.RichEmbed()
                .addField("**Queue Cleared!**", "All players have been removed from the queue by an admin.")
                .setColor(adminColor)
                .setFooter(footer, footerImage)
        
                message.channel.send(clearReply);  
            }
        }
    }
}
module.exports = ClearQueue;