import { CommandInteraction, Message, MessageActionRow as MsgActionRow , MessageActionRowComponentOptions, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject } from "tsyringe";
import { DiscordPaginationOpts, Pagination } from "./types";

@autoInjectable()
export class DiscordPagination implements Pagination {
    private currentPage = 1
    
    private isPreviousButtonDisabled = true //  Because we start on the first page of pagination.
    private isNextButtonDisabled = false
    
    private embeds : MessageEmbed[]

    private previousButtonOpts : MessageActionRowComponentOptions = {
        type : "BUTTON",
        customId : "previous",
        style : "DANGER",
        label : "Previous"
    }
    private nextButtonOpts : MessageActionRowComponentOptions = {
        type : "BUTTON",
        customId : "next",
        style : "SUCCESS",
        label : "Next"
    }

    constructor(
        @inject(TOKENS.values.discordMessageActionRow) private MessageActionRow? : typeof MsgActionRow
    ) {}

    private getComponents() {
        return new this.MessageActionRow!().addComponents([
            {
                ...this.previousButtonOpts,
                disabled : this.isPreviousButtonDisabled
            },
            {
                ...this.nextButtonOpts,
                disabled : this.isNextButtonDisabled
            }
        ])
    }

    private getMessageContent() {
        return {
            embeds : [ this.embeds [this.currentPage - 1] ],
            components : [ this.getComponents() ]
        }
    }
    
    async execute(opts : DiscordPaginationOpts) {
        const { interaction , embeds , timeInSeconds , idleInSeconds } = opts

        if(!interaction) {
            throw new DiscordPaginationError("Interaction property is missing.")
        }

        if(!embeds) {
            throw new DiscordPaginationError("Embeds property is missing.")
        }

        if(embeds.length <= 0) {
            throw new DiscordPaginationError("Embeds property is an empty array.")
        }

        this.embeds = embeds
        
        if(embeds.length <= 1) {
            this.isNextButtonDisabled = true
        }

        const message = await interaction.reply({
            ...this.getMessageContent(),
            fetchReply : true        
        }) as Message

        const collector = message.createMessageComponentCollector({
            filter : (collectorInteraction) => (collectorInteraction.user.id === interaction.user.id) && (collectorInteraction.customId === "next" || collectorInteraction.customId === "previous"),
            time : timeInSeconds ? timeInSeconds * 1000 : 1000 * 10,
            idle : idleInSeconds ? idleInSeconds * 1000 : 1000 * 10,
            componentType : "BUTTON",
            dispose : true
        })

        collector.on("collect" , async (collectorInteraction) => {
            const { customId } = collectorInteraction
            switch(customId) {
                case "previous":
                    this.currentPage = this.currentPage > 1 ? --this.currentPage : this.currentPage                    
                    break
                case "next":
                    this.currentPage = this.currentPage + 1 <= embeds.length ? ++this.currentPage : this.currentPage
                    break
                default:
                    break
            }

            this.isPreviousButtonDisabled = this.currentPage > 1 ? false : true
            this.isNextButtonDisabled = this.currentPage + 1 <= embeds.length ? false : true

            await collectorInteraction.deferUpdate()
            await collectorInteraction.editReply({ 
                ...this.getMessageContent()
            })
            
            collector.resetTimer()
        })

        collector.on("end" , async () => {
            this.isNextButtonDisabled = true
            this.isPreviousButtonDisabled = true 

            await interaction.editReply({
                ...this.getMessageContent()
            })
        })
    }
}

export class DiscordPaginationError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}