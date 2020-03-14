const commando = require('discord.js-commando');
const discord  = require('discord.js');

class CaptainsVote extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'c',
            group: 'vote',
            memberName: 'captains',
            description: 'Voting: Vote for captains to be picked.'
        });
    }

    async run(message, args) {
        var instance = sixMansService.GetInstanceFromId(message.channel.id);
        
        if(message.channel.id == instance.channels.queue) {
            var [success, error] = await instance.ProcessNewVote(message, "c");
            if(!success) {
                message.reply(error)
            }
        }
    }
}

module.exports = CaptainsVote;