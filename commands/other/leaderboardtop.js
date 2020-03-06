const commando = require('discord.js-commando');
const discord = require('discord.js');

class RulesNiceMsg extends commando.Command {

    constructor(client) {
        super(client, {
            name: 'leaderboardtop',
            group: 'other',
            memberName: 'leaderboardtop',
            description: 'Auto give roles to the top 3 players at the end of the month.'
        });
        this.dateOptions = { month: "long", year: "numeric" };
    }

    async run(message, args) {
        var instance = sixMansService.GetInstanceFromId(message.channel.id);
        if (instance == null) {
            return;
        }
        var databaseService = instance.databaseService;

        if (message.member.hasPermission("ADMINISTRATOR")) {
            var top_users = [];

            var today = new Date();
            today = today.toLocaleDateString("en-UK", this.dateOptions);
            var rows = await databaseService.GetOrderedMmr();

            if (rows.length > 0) {
                for (var i = 0; i < 3; ++i) {
                    top_users.push(rows[i].discordID);
                }
            }

            this.giveRoles(message, top_users);

            var LeaderboardStatsMsg = new discord.RichEmbed()
                .setTitle(`${instance.name} University 6Mans - Monthly Standings (${today})`)
                .addField("**1st**", "<@" + top_users[0] + ">")
                .addField("**2nd**", "<@" + top_users[1] + ">")
                .addField("**3rd**", "<@" + top_users[2] + ">")
                .setColor(embedColor)
                .setFooter(footer, footerImage)

            message.channel.send(LeaderboardStatsMsg);
        }
    }

    giveRoles(message, top_users) {
        var roles = []
        roles.push(message.guild.roles.find(role => role.name === "Leaderboard 1st"));
        roles.push(message.guild.roles.find(role => role.name === "Leaderboard 2nd"));
        roles.push(message.guild.roles.find(role => role.name === "Leaderboard 3rd"));
        for (var i = 0; i < top_users.length; ++i) {
            var user = message.guild.members.get(top_users[i]);
            // If no user found in the server.
            if (user == undefined) {
                continue;
            }
            user.addRole(roles[i]);
        }
    }
}

module.exports = RulesNiceMsg;