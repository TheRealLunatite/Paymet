import { Id } from "@common/id";
import { Uuid } from "@common/uuid";
import { PriceDBModule } from "@modules/priceDb";
import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { v4 as uuid } from "uuid"
import { SlashCommand } from "@discordbot/types"
import { Logger } from "tslog";

@autoInjectable()
export class DeletePriceCommand implements SlashCommand {
    name = "deleteprice"
    description = "Delete an enlisted item."
    options = [
        {
            name : "itemname",
            type : 3,
            description : "An item name.",
            required : true
        },
        {
            name : "placeid",   
            type : 4,
            description : "This item belongs to this placeId.",
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
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceDBModule
    ) {}
    

    async execute(interaction : CommandInteraction): Promise<void> {
        const itemName = interaction.options.getString("itemname")!
        const itemPlaceId = new Id(interaction.options.getInteger("placeid")!)
        
        const findEnlistedItem = await this.priceDb!.findOne({ itemName , itemPlaceId })

        if(!findEnlistedItem) {
            return interaction.reply({
                content : "This enlisted item does not exist.",
                ephemeral : true
            })
        }

        await this.priceDb!.deleteById(findEnlistedItem.id)

        return interaction.reply({
            content : `Successfully deleted enlisted item. ${itemName} <${itemPlaceId.value}>`,
            ephemeral : true
        })
    }
}