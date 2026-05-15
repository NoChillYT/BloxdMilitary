const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit a message sent by the bot')
        .addStringOption(option =>
            option.setName('message_id')
            .setDescription('The ID of the message to edit')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('new_content')
            .setDescription('The new content for the message')
            .setRequired(true)),
    async execute(interaction) {
        // Check if user has the required role
        if (!interaction.member.roles.cache.has('1361314492419539024')) {
            await interaction.reply('You do not have permission to use this command.');
            return;
        }

        const messageId = interaction.options.getString('message_id');
        const newContent = interaction.options.getString('new_content');

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            if (message.author.id !== interaction.client.user.id) {
                await interaction.reply('You can only edit messages sent by the bot.');
                return;
            }

            await message.edit(newContent);
            await interaction.reply('Message edited successfully.');
        } catch (error) {
            console.error(error);
            if (error.code === 10008) {
                await interaction.reply('Message not found. Make sure the message ID is correct and the message is in this channel.');
            } else {
                await interaction.reply('An error occurred while editing the message.');
            }
        }
    },
};