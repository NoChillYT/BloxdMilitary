const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const CHANNEL_ID = '1501237067139780688';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('endevent')
        .setDescription('End the current event')

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            const channel = await interaction.guild.channels.fetch(CHANNEL_ID);

            if (!channel) {
                return interaction.reply({
                    content: '❌ Event channel not found.',
                    ephemeral: true
                });
            }

            const message =
`📢 **EVENT UPDATE**

# ❌ EVENT IS NOW OVER ❌

Thank you to everyone who participated!`;

            await channel.send({ content: message });

            await interaction.reply({
                content: '✅ Event ended.',
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to end event.',
                ephemeral: true
            });
        }
    }
};