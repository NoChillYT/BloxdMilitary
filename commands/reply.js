const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Reply to a specific message using its ID')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message to reply to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('content')
                .setDescription('What you want to reply with')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const content = interaction.options.getString('content');

        try {
            // Get current channel
            const channel = interaction.channel;

            // Fetch the target message
            const targetMessage = await channel.messages.fetch(messageId);

            if (!targetMessage) {
                return interaction.reply({
                    content: 'Message not found.',
                    ephemeral: true
                });
            }

            // Reply to the message
            await targetMessage.reply({
                content: content
            });

            // Confirm to user
            await interaction.reply({
                content: 'Reply sent successfully.',
                ephemeral: true
            });

        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: 'Failed to reply. Make sure the message ID is valid and in this channel.',
                ephemeral: true
            });
        }
    }
};