const commando = require('discord.js-commando');
const discord  = require('discord.js');

class ResetLeaderboard extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'resetleaderboard',
            group: 'admin',
            memberName: 'resetleaderboard',
            description: 'Resets the leaderboard for the new season'
        });
    }

    /**
     *  Called when a 'resetleaderboard' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;
        
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.reply("Only admins can use this command! Nice try... :wink:");
            return;
        }
        else {
            await databaseService.SoftResetAllMMR();
            
            var clearReply = new discord.RichEmbed()
            .addField("**Leaderboards Reset!**", "Welcome to the new month! Get queueing!")
            .setColor(adminColor)
            .setFooter(footer, footerImage)
    
            message.channel.send(clearReply);  

            console.log('[Leaderboards] Leaderboard has been soft reset!');
        }
    }
}
module.exports = ResetLeaderboard;