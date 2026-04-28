const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hidedm')
        .setDescription('Hide/delete messages saying "Message from Bloxd.io Officials"')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('Number of messages to check (default: 10)')
            .setRequired(false)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount') || 10;

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            let deletedCount = 0;

            for (const message of messages.values()) {
                if (message.content.includes('Message from Bloxd.io Officials')) {
                    const author = message.author;
                    await message.delete();
                    
                    try {
                        await author.send('Your message containing "Message from Bloxd.io Officials" has been deleted.');
                    } catch (dmError) {
                        console.log(`Could not DM ${author.tag}`);
                    }
                    
                    deletedCount++;
                }
            }

            await interaction.reply(`Deleted ${deletedCount} message(s) containing "Message from Bloxd.io Officials".`);
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while hiding messages.');
        }
    },
};
