import { InstanceModule, InventoryItem } from "@modules/instances/types"
import { CommandInteraction, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { DiscordPagination } from "@modules/discordPagination";
import { Uuid } from "@common/uuid";

@autoInjectable()
export class GetInstancesCommand implements SlashCommand {
    name = "getinventory"
    description = "Get the inventory of a connected socket instance."
    options = [
        {
            name : "socketid",
            type : 3,
            description : "The socket instance uuid.",
            required : true
        }
    ]
    defaultPermission = false
    permissions = [
        {
            id : '573639162733789197',
            type : 2,
            permission : true
        }
    ]   

    constructor(
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.modules.discordPagination) private pagination? : typeof DiscordPagination,
        @inject(TOKENS.values.discordMessageEmbed) private embed? : typeof MessageEmbed,
    ) {}
    
    // Split an array to <num> in length.
    private splitArray<T>(arr : T[] , num : number) : T[][] {
        const amountOfSections = Math.floor(arr.length / num)
    
        const sections = []

        for(let i = 0; i < amountOfSections; i++) {
            sections.push(arr.splice(0,num))
        }

        // Sections var should contain arrays that equal <num> array length.
        // The array var should be left with the items that couldn't be seperated into an array of length <num>.
        return [...sections , arr]
    }

    async execute(interaction : CommandInteraction): Promise<void> {
        let socketId : Uuid

        try {
            socketId = new Uuid(interaction.options.getString("socketid")!)
        } catch {
            return interaction.reply({
                content : "socketId parameter is not a valid uuid.",
                ephemeral : true
            })
        }

        const socketInstance = await this.instanceDb!.findOne({ socketId })

        if(!socketInstance) {
            return interaction.reply({
                content : "Instance cannot be found.",
                ephemeral : true
            })
        }

        const sections = this.splitArray<InventoryItem>(socketInstance.inventory , 5)

        const embeds = sections.map((data , index) => {
            let description = ``

            data.forEach(({ itemStock , itemName , itemRawName , itemRarity , itemType }) => {
                (itemRawName === itemName) ? description += `Name : **${itemName}**` : description += `Name : **${itemName}** \n Raw Name : **${itemRawName}**`
                
                description += `
                    Rarity : **${itemRarity}**
                    Stock : **${itemStock}**
                    Type : **${itemType}** \n
                `
            })

            return new this.embed!()
            .setDescription(description)
            .setFooter(`Page : ${index + 1} / ${sections.length}`)
            .setTimestamp()
            .setColor("RANDOM")
            .setTitle(`${socketInstance.username.value}'s Inventory`)
        })

        new this.pagination!().execute({
            interaction,
            embeds,
            timeInSeconds : 30,
            idleInSeconds : 10        
        })
    }
}