const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Generate a Bloxd Military quote card from a message ID')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Message ID to quote')
                .setRequired(true)
        ),

    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');

        try {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(messageId);

            if (!message) {
                return interaction.reply({
                    content: 'Message not found.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(message.author.id).catch(() => null);
            const nickname = member?.displayName || message.author.username;

            const text = message.content || 'No message content available';
            const avatarURL = message.author.displayAvatarURL({ extension: 'png', size: 256 });

            // ===== CANVAS =====
            const width = 1000;
            const height = 350;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#0b0f14');
            gradient.addColorStop(0.5, '#111827');
            gradient.addColorStop(1, '#05070a');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Gold stripe
            ctx.fillStyle = '#b08d2a';
            ctx.fillRect(0, 0, width, 6);

            // Avatar
            const avatar = await loadImage(avatarURL);

            ctx.save();
            ctx.beginPath();
            ctx.arc(110, 170, 65, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 45, 105, 130, 130);
            ctx.restore();

            ctx.strokeStyle = '#b08d2a';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(110, 170, 65, 0, Math.PI * 2);
            ctx.stroke();

            // Header
            ctx.fillStyle = '#b08d2a';
            ctx.font = 'bold 26px Arial';
            ctx.fillText('BLOXD MILITARY QUOTE', 220, 60);

            // Nickname
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(nickname.toUpperCase(), 220, 120);

            // Divider
            ctx.strokeStyle = '#2a3441';
            ctx.beginPath();
            ctx.moveTo(220, 135);
            ctx.lineTo(950, 135);
            ctx.stroke();

            // Text
            ctx.fillStyle = '#d1d5db';
            ctx.font = '24px Arial';

            const words = text.split(' ');
            let line = '';
            let y = 180;
            const maxWidth = 720;

            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && i > 0) {
                    ctx.fillText(line, 220, y);
                    line = words[i] + ' ';
                    y += 38;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 220, y);

            // Footer
            ctx.fillStyle = '#6b7280';
            ctx.font = 'italic 18px Arial';
            ctx.fillText('“Created By Bloxd Military Bot”', 220, height - 25);

            ctx.fillStyle = '#b08d2a';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('#BLOXD-MILLITARY', width - 200, height - 25);

            // IMAGE BUFFER
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'quote.png' });

            // 🔒 PRIVATE CONFIRMATION (only command user sees this)
            await interaction.reply({
                content: '✅ Quote generated and sent to channel.',
                ephemeral: true
            });

            // 📢 PUBLIC POST (everyone sees image, no command user shown)
            await channel.send({
                files: [attachment]
            });

        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: 'Failed to generate quote image. Make sure the message ID is valid.',
                ephemeral: true
            });
        }
    }
};