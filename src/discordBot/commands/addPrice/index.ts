import { Id } from "@common/id";
import { Uuid } from "@common/uuid";
import { PriceDBModule } from "@modules/prices";
import { CommandInteraction } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { v4 as uuid } from "uuid"
import { SlashCommand } from "@discordbot/types"

@autoInjectable()
export class AddPriceCommand implements SlashCommand {
    name = "addprice"
    description = "Adding a price to an item enables customers to purchase that specific item."
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
        },
        {
            name : "priceinrobux",
            type : 4,
            description : "Set a price in robux for this item.",
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
        @inject(TOKENS.modules.priceDb) private priceDb? : PriceDBModule,
        @inject(TOKENS.values.uuid) private v4? : typeof uuid
    ) {}
    

    async execute(interaction : CommandInteraction): Promise<void> {
        const itemName = interaction.options.getString("itemname")!
        const itemPlaceId = new Id(interaction.options.getInteger("placeid")!)
        const priceInRobux = interaction.options.getInteger("priceinrobux")!
        
        const findPrice = await this.priceDb!.findOne({ itemName , itemPlaceId })

        if(findPrice) {
            return await interaction.reply({
                content : "You\'ve already enlisted this item.",
                ephemeral : true
            })
        }

        await this.priceDb!.add({
            id : new  Uuid(this.v4!()),
            itemName,
            itemPlaceId,
            priceInRobux
        })

        return await interaction.reply({
            content : `Successfully enlisted ${itemName} <${itemPlaceId.value}> for ${priceInRobux} robux.`,
            ephemeral : true
        })
    }
}