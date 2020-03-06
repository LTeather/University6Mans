const commando = require('discord.js-commando');
const discord  = require('discord.js');

class RulesNiceMsg extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'rulesnice',
            group: 'other',
            memberName: 'rulesnice',
            description: 'Makes the rules look nice for the rules channel!'
        });
    }

    async run(message, args) {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            var RulesNice = new discord.RichEmbed()
            .setTitle("University 6Mans Rules")
            .addField("**1.**", "Matches are a BO5 and must be played on standard maps.")
            .addField("**2.**", "Games must start within 15 minutes of creation, otherwise a forfeit win is granted.")
            .addField("**3.**", "If a player cannot make the match for which they are queued for, then the game can be cancelled if it is agreed with the remaining players.")
            .addField("**4.**", "If a player disconnects because of a technical issue before the halfway point of the game (2:30), then the game should be restarted as soon as the issue is resolved.")
            .addField("**5.**", "If a player disconnects because of a technical issue and doesn't re-join within a reasonable time period, then the game is cancelled.")
            .addField("**6.**", "If a player forfeits (or leaves because of tilt), then a subsequent ban will be issued. (24+ Hour)")
            .addField("**7.**", "If a match is reported before the series has concluded, then a subsequent ban will be issued. (24+ Hour)")
            .addField("**8.**", "All players are required to have a microphone and be in the team lobby at all times during the series.")
            .addField("**9.**", "No re-rolls of the teams after they've been generated are allowed. Anyone found queue dodging will recieve a subsequent ban. (24+ Hour)")
            .addField("**10.**", "Any toxicity or hostility towards others will be tolerated, you will be warned and or muted.")
            .addField("**11.**", "Have fun! No seriously, this is what this server is here for!")
            .addField("**Still unsure?**", "Don't hesitate to contact or @admin for any questions or issues that you may be having.")
            .setColor(embedColor)
            .setFooter(footer, footerImage)

            message.channel.send(RulesNice);
        }  
    }
}

module.exports = RulesNiceMsg;