const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send a direct message to a user')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('The user to message')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message to send')
            .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const message = interaction.options.getString('message');

        try {
            await target.send(message);
            await interaction.reply(`Message sent to ${target.tag}.`);
        } catch (error) {
            await interaction.reply('Failed to send message. User may have DMs disabled.');
        }
    },
};
