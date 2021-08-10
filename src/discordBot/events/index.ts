import { DiscordInteractionCreateEvent } from "./interactionCreate";
import { DiscordReadyEvent } from "./ready";

export default [
    new DiscordInteractionCreateEvent(),
    new DiscordReadyEvent()
]