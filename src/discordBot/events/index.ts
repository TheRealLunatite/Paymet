import { DiscordInteractionCreateEvent } from "./interactionCreate";
import { DiscordReadyEvent } from "./ready";
import { DiscordMessageCreateEvent } from "./messageCreate";

export default [
    new DiscordInteractionCreateEvent(),
    new DiscordReadyEvent(),
    new DiscordMessageCreateEvent
]