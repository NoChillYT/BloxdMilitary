const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ChannelType, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Initialize the Discord client with required intents
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Load and register commands from the commands folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Register slash commands (Loader)
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Clear global commands to avoid duplicates
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] },
        );

        // Register guild-specific commands
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, '1306711923353452645'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Load settings from settings.json for antifeatures
const settingsFilePath = path.join(__dirname, 'settings.json');
function loadSettings() {
    if (fs.existsSync(settingsFilePath)) {
        return JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
    } else {
        return { antilink: false, antiinvite: false, antispam: false, antinuke: false };
    }
}

function saveSettings(settings) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

// Helper function to send DM and log to channel
async function sendDMWithLogging(user, message, context = '') {
    const LOG_CHANNEL = '1500163709404971210';
    try {
        await user.send(message);
        const logChannel = await client.channels.fetch(LOG_CHANNEL);
        await logChannel.send({
            content: `**[DM SENT]**\n**To:** ${user.tag} (${user.id})\n**Content:** ${message}${context ? `\n**Context:** ${context}` : ''}`
        });
    } catch (error) {
        console.error('Failed to send DM:', error);
    }
}

// Make this function accessible to commands
client.sendDMWithLogging = sendDMWithLogging;

// Event: Ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event: Interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Permission check
    const STAFF_ROLE_ID = '1361310506232578128';
    const PUBLIC_COMMANDS = ['report', 'help'];
    
    const hasStaffRole = interaction.member.roles.cache.has(STAFF_ROLE_ID);
    const isPublicCommand = PUBLIC_COMMANDS.includes(interaction.commandName);
    
    if (!hasStaffRole && !isPublicCommand) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Anti-Link and Anti-Invite logic
client.on('messageCreate', async (message) => {
    // Ignore messages from the bot itself to prevent infinite loops
    if (message.author.bot) return;

    // Check if the message was sent in a DM
    if (message.channel.type === ChannelType.DM) {
        console.log(`Received DM from ${message.author.tag}: ${message.content}`);
        
        // Check for slash command usage in DMs
        if (message.content.startsWith('/')) {
            const args = message.content.slice(1).split(' ');
            const commandName = args.shift().toLowerCase();
            const command = client.commands.get(commandName);
            
            if (command) {
                try {
                    // Create a mock interaction object for DM commands
                    const mockInteraction = {
                        commandName: commandName,
                        options: {
                            getUser: (name) => {
                                // For DMs, we can't easily resolve users, so return null for now
                                return null;
                            },
                            getString: (name) => {
                                // Simple argument parsing - return the next arg
                                return args.shift() || null;
                            },
                            getInteger: (name) => {
                                const arg = args.shift();
                                return arg ? parseInt(arg) : null;
                            }
                        },
                        reply: async (options) => {
                            if (typeof options === 'string') {
                                await message.reply(options);
                            } else {
                                await message.reply(options.content || 'Command executed');
                            }
                        },
                        editReply: async (options) => {
                            // For DMs, we can't edit, so just send another message
                            if (typeof options === 'string') {
                                await message.reply(options);
                            } else {
                                await message.reply(options.content || 'Updated');
                            }
                        },
                        followUp: async (options) => {
                            if (typeof options === 'string') {
                                await message.reply(options);
                            } else {
                                await message.reply(options.content || 'Follow up');
                            }
                        },
                        user: message.author,
                        guild: guild, // Provide guild context if available
                        member: member, // Provide member if available
                        client: client
                    };
                    
                    await command.execute(mockInteraction);
                    return;
                } catch (error) {
                    console.error('Error executing DM command:', error);
                    await message.reply('There was an error executing that command in DMs.');
                    return;
                }
            }
        }
        
        // Check for reply command
        const guild = client.guilds.cache.get('1306711923353452645');
        if (guild) {
            const member = await guild.members.fetch(message.author.id).catch(() => null);
            if (member && member.roles.cache.has('1361310506232578128')) {
                if (message.content.startsWith('mrp! reply ')) {
                    const content = message.content.slice(11);
                    const firstSpace = content.indexOf(' ');
                    if (firstSpace !== -1) {
                        const username = content.slice(0, firstSpace);
                        const msg = content.slice(firstSpace + 1).trim();
                        if (msg) {
                            const targetMembers = await guild.members.fetch({ query: username });
                            const targetMember = targetMembers.first();
                            if (targetMember) {
                                await sendDMWithLogging(targetMember.user, msg, `Replied by ${message.author.tag}`);
                                await message.reply('DM sent successfully!');
                                return;
                            } else {
                                await message.reply('User not found.');
                                return;
                            }
                        }
                    }
                }
            }
        }
        
        try {
            // Respond back to the user with an embedded message
            const embed = new EmbedBuilder()
                .setDescription("Please wait, someone will get back to you very soon!")
                .setColor(0x0099ff)
                .setTimestamp();
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to process DM:', error);
        }
        return;
    }
    
    const settings = loadSettings();

    // Antilink: Delete messages containing links
    if (settings.antilink && message.content.includes('http')) {
        await message.delete();
        message.channel.send(`${message.author}, links are not allowed.`);
    }

    // Antiinvite: Delete messages containing Discord invites
    if (settings.antiinvite && message.content.includes('discord.gg')) {
        await message.delete();
        message.channel.send(`${message.author}, Discord invite links are not allowed.`);
    }

    // Antispam: Prevent spam (5 consecutive identical messages)
    if (settings.antispam) {
        if (!client.messageCache) client.messageCache = new Map();
        const userMessages = client.messageCache.get(message.author.id) || [];
        userMessages.push(message.content);

        if (userMessages.length > 5) userMessages.shift();  // Keep only last 5 messages

        client.messageCache.set(message.author.id, userMessages);

        // Check if user is spamming the same message
        const isSpamming = userMessages.every(msg => msg === userMessages[0]);

        if (isSpamming) {
            await message.delete();
            message.channel.send(`${message.author}, please stop spamming.`);
        }
    }
});

// Anti-Nuke Protection: Monitor for mass role and channel deletions
client.on('roleDelete', async (role) => {
    const settings = loadSettings();
    if (settings.antinuke) {
        console.log(`Role ${role.name} deleted, checking for mass deletions...`);
        // Add logic to handle potential nuke actions, such as preventing further deletions or taking action
    }
});

client.on('channelDelete', async (channel) => {
    const settings = loadSettings();
    if (settings.antinuke) {
        console.log(`Channel ${channel.name} deleted, checking for mass deletions...`);
        // Similar to roleDelete, logic to handle mass deletion detection
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);