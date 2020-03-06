const commando = require('discord.js-commando');
const discord  = require('discord.js');

class ConfirmSub extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'confirm',
            group: 'game',
            memberName: 'confirm',
            description: '!confirm : Confirm a substitution (requires 3 people).'
        });
    }

    /**
     *  Called when a 'confirm' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;

        if(message.channel.id == channels.queue) {

            var [success, error] = await gameService.TryConfirmSub(message.author.id);
            // If confirm was not added to the count successfully, then lets exit with the reason.
            if(!success) {
                message.reply(error);
                return;
            }
            var sub = await gameService.TryCommitSubstitution();
            // If we did not commit the substitution
            if(sub == null) {
                return;
            }
            var subConfirmation = new discord.RichEmbed()
                .addField(`Substitution confirmed for: Match #${sub.game.id}`, `<@${sub.originalPlayer}> For: <@${sub.substitutePlayer}>`)
                .addField("MMR for the substituted player will not be affected", "Continue with the game as normal!")
                .setColor(embedColor)
                .setFooter(footer, footerImage)
    
            message.channel.send(subConfirmation);
        }
    }
}

module.exports = ConfirmSub;