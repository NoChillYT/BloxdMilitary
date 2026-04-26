const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to a channel')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The announcement message')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the announcement to (defaults to current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Check if the bot has permission to send messages in the target channel
        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            await interaction.reply({ content: '❌ I don\'t have permission to send messages in that channel.', ephemeral: true });
            return;
        }

        // Create announcement embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📢 Announcement')
            .setDescription(message)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .setFooter({ text: 'BloxdRanks Announcement' });

        // Send the announcement
        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: `✅ Announcement sent to ${channel}!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error sending announcement:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while sending the announcement.', 
                ephemeral: true 
            });
        }
    },
};
