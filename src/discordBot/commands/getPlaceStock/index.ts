import { Id } from "@common/id";
import { RobloxUniverse } from "@common/robloxUniverse";
import { InstanceModule } from "@modules/instanceDb/types";
import { PriceModule } from "@modules/priceDb/types";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { SlashCommand } from "@discordbot/types"
import { DiscordPagination } from "@modules/discordPagination";

@autoInjectable()
export class GetPlaceStockCommand implements SlashCommand {
    name = "getplacestock"
    description = "Get the item stock of a active placeId."
    options = [
        {
            name : "placeid",   
            type : 4,
            description : "An active placeId.",
            required : true
        }
    ]
    defaultPermission = true
    permissions = []

    constructor(
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceModule,
        @inject(TOKENS.modules.instanceDb) private instanceDb? : InstanceModule,
        @inject(TOKENS.modules.discordPagination) private pagination? : typeof DiscordPagination,
        @inject(TOKENS.values.discordMessageEmbed) private embed? : typeof MessageEmbed
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
        const itemPlaceId = new Id(interaction.options.getInteger("placeid")!)
        const instances = await this.instanceDb!.findAll({ placeId : itemPlaceId })
        
        if(!instances) {
            return await interaction.reply(`There is currently no active instance with a placeid of ${itemPlaceId.value}.`)
        }

        // Get all of the enlisted prices for this specific place.
        const enlistedItems = await this.priceDb!.findAll({ itemPlaceId })

        if(!enlistedItems) {
            return await interaction.reply(`The owner did not enlist a price for any item at the moment. Please try again later.`)
        }

        const inventory = instances
        .flatMap(({ inventory }) => inventory)
        .filter((item1 , index , array) => { // Merge all duplicated items into one if found.
            const findIndex = array.findIndex((item2) => (item1.itemRawName === item2.itemRawName && item1.itemRarity === item2.itemRarity && item1.itemType === item2.itemType))

            // If the findIndex doesn't equal the index then it's a duplicate or didn't pass the test.
            if(findIndex !== index) {
                array[findIndex].itemStock += item1.itemStock
                return false
            }

            return true
        }) // Filter all of the inventory items that aren't enlisted.
        .filter((inventoryItem) => enlistedItems.some((enlistedItem) => enlistedItem.itemName === inventoryItem.itemRawName))
        
        if(inventory.length === 0) {
            return await interaction.reply("The owner has enlisted items for sale but currently does not have the items in stock.")
        }

        const data = inventory.map((inventoryItem) => ({
            ...inventoryItem,
            price : +enlistedItems.find((enlistedItem) => enlistedItem.itemName === inventoryItem.itemRawName)!.priceInRobux
        }))

        const sections = this.splitArray(data , 10)

        const embeds = sections.map((data , index) => {
            let description = ``

            data.forEach(({ itemName , itemStock , itemType , price , itemRawName }) => {
                (itemRawName === itemName) ? description += `Name : **${itemName}** | Type : **${itemType}**\n` : description += `Name : **${itemName}** | Raw Name : **${itemRawName}** | Type : **${itemType}**\n`

                description += `**Stock : __${itemStock}__** [**[⏣ ${price}]**](https://www.youtube.com/watch?v=9bDPAOuizsQ)
                This item is purchasable for ${price} Robux.\n\n`
            })

            return new this.embed!()
            .setTitle(`${RobloxUniverse[itemPlaceId.value] ?? itemPlaceId.value} Item Shop.`)
            .setColor("RANDOM")
            .setDescription(description)
            .setFooter(`Page ${index + 1} / ${sections.length}`)
            .setTimestamp()
        })

        new this.pagination!().execute({
            interaction,
            embeds
        })
    }
}