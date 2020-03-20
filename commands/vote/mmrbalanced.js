const commando = require('discord.js-commando');
const discord  = require('discord.js');

class MMRBalancedVote extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'mb',
            group: 'vote',
            memberName: 'mmrbalanced',
            description: 'Voting: Vote for teams to be balanced by real MMR.'
        });
    }

    async run(message, args) {
        var instance = sixMansService.GetInstanceFromId(message.channel.id);
        
        if(message.channel.id == instance.channels.queue) {
            var [success, error] = await instance.ProcessNewVote(message, "mb");
            if(!success) {
                message.reply(error)
            }
        }
    }
}

module.exports = MMRBalancedVote;