const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alldm')
        .setDescription('Send a DM to everyone in the server')
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message to send to everyone')
            .setRequired(true)),
    async execute(interaction) {
        const ownerID = '1335247328478498916';
        
        // Check if user is the owner
        if (interaction.user.id !== ownerID) {
            await interaction.reply('You do not have permission to use this command.');
            return;
        }

        const message = interaction.options.getString('message');

        try {
            const members = await interaction.guild.members.fetch();
            let successCount = 0;
            let failCount = 0;

            for (const member of members.values()) {
                if (!member.user.bot) {
                    try {
                        await member.user.send(message);
                        successCount++;
                    } catch (error) {
                        failCount++;
                    }
                }
            }

            await interaction.reply(`Message sent to ${successCount} members. Failed to send to ${failCount} members (DMs disabled).`);
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while sending messages.');
        }
    },
};
