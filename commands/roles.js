const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Send an announcement as another user')

        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to announce as')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('message')
                .setDescription('The announcement message')
                .setRequired(true)
        )

        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the announcement to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Check bot permissions
        const botMember = interaction.guild.members.me;

        if (!channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({
                content: '❌ I don’t have permission to send messages in that channel.',
                ephemeral: true
            });
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📢 Announcement')
            .setDescription(message) // FIXED: now uses the input properly
            .setAuthor({
                name: targetUser.username,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setFooter({ text: 'Bloxd Military Announcement' });

        try {
            await channel.send({ embeds: [embed] });

            await interaction.reply({
                content: `✅ Announcement sent as **${targetUser.username}** in ${channel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: '❌ Failed to send announcement.',
                ephemeral: true
            });
        }
    },
};