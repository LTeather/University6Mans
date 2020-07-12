/**
 * Handles all functionality for all registered 6mans lobbies
 */
class SixMansService {
    // sixMansInstances is a list of SixMansInstance;
    constructor(sixMansInstances) {
        this.sixMansInstances = sixMansInstances;
    }

    /**
     * Returns the instance of a sixMans server based on a channel Id. returns null if no instance exists within that channel.
     */
    GetInstanceFromId(channelId) {
        for(var i = 0; i<this.sixMansInstances.length;i++) {
            var instance = this.sixMansInstances[i];
            var channels = instance.channels;
            if(channels.queue == channelId || channels.report == channelId) {
                return instance;
            }
        }
        return null;
    }


    /**
     * Hack until we migrate all code to use this service. Retrieves all services from the instance.
     */
    GetAllServicesForInstance(channelId) {
        var sixMansInstance = this.GetInstanceFromId(channelId);
        if(sixMansInstance == null)
        {
            return null;
        }
        return [sixMansInstance.databaseService, sixMansInstance.gameService, sixMansInstance.queue, sixMansInstance.channels];
    }

    async SaveQueues() {
        return;
        for(var i = 0; i < this.sixMansInstances.length;i++) {
            var instance = this.sixMansInstances[i];
            await instance.databaseService.saveQueue(instance.queue);
        }
    }
}

module.exports = SixMansService;