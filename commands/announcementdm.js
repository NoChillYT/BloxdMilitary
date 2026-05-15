const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcementdm')
        .setDescription('Send an embedded announcement message to a user')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('The user to message')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
            .setDescription('The description of the embed')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
            .setDescription('The color of the embed (hex code, e.g. #0099ff)')
            .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const title = interaction.options.getString('title') || 'Announcement';
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#FA0000';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();

        try {
            await target.send({ embeds: [embed] });
            await interaction.reply(`Embedded message sent to ${target.tag}.`);
        } catch (error) {
            await interaction.reply('Failed to send embedded message. User may have DMs disabled.');
        }
    },
};