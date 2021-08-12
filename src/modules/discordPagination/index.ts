import { CommandInteraction, MessageActionRow as MsgActionRow , MessageActionRowComponentOptions, MessageEmbed } from "discord.js";
import { TOKENS } from "src/di";
import { autoInjectable, inject, injectable, singleton } from "tsyringe";
import { Pagination } from "./types";

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
    
    execute(interaction : CommandInteraction , embeds : MessageEmbed[]) {
        this.embeds = embeds

        if(embeds.length <= 1) {
            this.isNextButtonDisabled = true
        }

        const collector = interaction.channel!.createMessageComponentCollector({
            filter : (collectorInteraction) => (collectorInteraction.user.id === interaction.user.id) && (collectorInteraction.customId === "next" || collectorInteraction.customId === "previous"),
            time : 1000 * 30,
            idle : 5000,
            componentType : "BUTTON"
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
            
            await collectorInteraction.update({ 
                ...this.getMessageContent()
            })
        })

        collector.on("end" , async () => {
            this.isNextButtonDisabled = true
            this.isPreviousButtonDisabled = true 

            await interaction.editReply({
                ...this.getMessageContent()
            })
        })

        return interaction.reply({
            ...this.getMessageContent(),
            ephemeral : true
        })
    }
}
