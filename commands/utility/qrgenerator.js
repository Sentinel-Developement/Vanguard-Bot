/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, MessageFlags } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require('discord.js');
const qr = require('qrcode');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrgenerator')
        .setDescription(lang.generateQRDescription || '🔲 Generate a customizable QR code')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text or URL to encode into QR code')
                .setRequired(true)
                .setMaxLength(2000))
        .addStringOption(option =>
            option.setName('style')
                .setDescription('Choose a color style preset')
                .setRequired(false)
                .addChoices(
                    { name: '🖤 Classic (Black & White)', value: 'classic' },
                    { name: '🔵 Ocean Blue', value: 'ocean' },
                    { name: '🟢 Forest Green', value: 'forest' },
                    { name: '🟣 Royal Purple', value: 'royal' },
                    { name: '🔴 Fire Red', value: 'fire' },
                    { name: '🟡 Golden Sun', value: 'gold' },
                    { name: '🩷 Pink Sunset', value: 'pink' },
                    { name: '🤍 Minimal White', value: 'minimal' }
                ))
        .addStringOption(option =>
            option.setName('size')
                .setDescription('QR code size')
                .setRequired(false)
                .addChoices(
                    { name: '📱 Small (300px)', value: 'small' },
                    { name: '💻 Medium (500px)', value: 'medium' },
                    { name: '🖥️ Large (800px)', value: 'large' },
                    { name: '📺 Extra Large (1200px)', value: 'xlarge' }
                ))
        .addStringOption(option =>
            option.setName('error_correction')
                .setDescription('Error correction level (higher = more resistant to damage)')
                .setRequired(false)
                .addChoices(
                    { name: '🔍 Low (~7% resistance)', value: 'L' },
                    { name: '⚖️ Medium (~15% resistance)', value: 'M' },
                    { name: '🛡️ Quartile (~25% resistance)', value: 'Q' },
                    { name: '🔒 High (~30% resistance)', value: 'H' }
                ))
        .addStringOption(option =>
            option.setName('custom_dark')
                .setDescription('Custom dark color (hex format: #000000)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('custom_light')
                .setDescription('Custom light color (hex format: #FFFFFF)')
                .setRequired(false)),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            try {
                await interaction.deferReply();

            
                const textToEncode = interaction.options.getString('text');
                const style = interaction.options.getString('style') || 'classic';
                const size = interaction.options.getString('size') || 'medium';
                const errorCorrection = interaction.options.getString('error_correction') || 'M';
                const customDark = interaction.options.getString('custom_dark');
                const customLight = interaction.options.getString('custom_light');

             
                const colorPresets = {
                    classic: { dark: '#000000FF', light: '#FFFFFFFF', accent: 0x000000 },
                    ocean: { dark: '#0066CCFF', light: '#E6F3FFFF', accent: 0x0066CC },
                    forest: { dark: '#2E7D32FF', light: '#E8F5E8FF', accent: 0x2E7D32 },
                    royal: { dark: '#6A1B9AFF', light: '#F3E5F5FF', accent: 0x6A1B9A },
                    fire: { dark: '#D32F2FFF', light: '#FFEBEEFF', accent: 0xD32F2F },
                    gold: { dark: '#F57C00FF', light: '#FFF8E1FF', accent: 0xF57C00 },
                    pink: { dark: '#E91E63FF', light: '#FCE4ECFF', accent: 0xE91E63 },
                    minimal: { dark: '#424242FF', light: '#00000000', accent: 0x424242 }
                };

            
                const sizePresets = {
                    small: 300,
                    medium: 500,
                    large: 800,
                    xlarge: 1200
                };

             
                const colors = colorPresets[style];
                const darkColor = customDark || colors.dark;
                const lightColor = customLight || colors.light;
                const accentColor = colors.accent;

            
                const hexColorRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
                if (customDark && !hexColorRegex.test(customDark)) {
                    throw new Error('Invalid dark color format. Use hex format like #000000');
                }
                if (customLight && !hexColorRegex.test(customLight)) {
                    throw new Error('Invalid light color format. Use hex format like #FFFFFF');
                }

             
                const qrOptions = {
                    width: sizePresets[size],
                    margin: 2,
                    color: {
                        dark: darkColor,
                        light: lightColor
                    },
                    errorCorrectionLevel: errorCorrection
                };

               
                const qrCodeBuffer = await qr.toBuffer(textToEncode, qrOptions);
                const attachment = new AttachmentBuilder(qrCodeBuffer, { name: 'qrcode.png' });

              
                const qrContainer = new ContainerBuilder()
                    .setAccentColor(accentColor)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🔲 QR Code Generated Successfully\n## Custom QR Code Creation\n\n> Your QR code has been generated with your selected preferences\n> Scan with any QR code reader to access your content`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`## 📋 **QR Code Details**\n\n**Content**\n${textToEncode.length > 100 ? textToEncode.substring(0, 100) + '...' : textToEncode}\n\n**Style Theme**\n${style.charAt(0).toUpperCase() + style.slice(1)} color scheme\n\n**Specifications**\n• Size: ${sizePresets[size]}x${sizePresets[size]} pixels\n• Error Correction: ${errorCorrection} level\n• Colors: Dark ${darkColor} / Light ${lightColor}\n• Format: PNG with transparency support`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL('attachment://qrcode.png')
                                    .setDescription('Generated QR Code')
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📱 **Usage Instructions**\n\n**Scanning Your QR Code**\nOpen your camera app or QR scanner\nPoint camera at the QR code\nTap the notification to access content\n\n**Error Correction Levels**\n• **L (Low)**: ~7% damage resistance\n• **M (Medium)**: ~15% damage resistance  \n• **Q (Quartile)**: ~25% damage resistance\n• **H (High)**: ~30% damage resistance\n\n**Tips for Best Results**\nEnsure good lighting when scanning\nKeep steady focus on the entire code\nMaintain appropriate distance from code`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*🔲 QR Code generated by ${interaction.user.tag} • Custom ${style} theme • ${errorCorrection} error correction*`)
                    );

                await interaction.editReply({
                    components: [qrContainer],
                    files: [attachment],
                    flags: MessageFlags.IsComponentsV2
                });

            } catch (error) {
                console.error('Error generating QR code:', error);
                
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ QR Code Generation Failed\n## Error in Processing\n\n> ${error.message || 'An unexpected error occurred while generating your QR code'}\n> Please check your input and try again`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🔧 **Troubleshooting Tips**\n\n**Common Issues**\nText too long (max 2000 characters)\nInvalid hex color format (#000000)\nSpecial characters in content\n\n**Solutions**\nShorten your text content\nUse proper hex color codes\nTry with simpler text first\n\n**Need Help?**\nContact server administrators\nTry the basic /qrgenerator command\nCheck Discord's file size limits`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*❌ Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                    );

                await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        } else {
            const alertContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ⚠️ Slash Commands Only\n## Command Restriction\n\n> This command can only be used through slash commands\n> Please use /qrgenerator to access the QR code generator`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(cmdIcons.dotIcon)
                                .setDescription('Alert notification')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔲 **QR Generator Features**\n\n**Customization Options**\n8 beautiful color themes\n4 different size options\n4 error correction levels\nCustom color support\n\n**Usage Example**\n/qrgenerator text:https://example.com style:ocean size:large error_correction:H\n\n**Supported Content**\nWebsite URLs\nText messages\nContact information\nWiFi credentials\nAny text up to 2000 characters`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*⚠️ Alert notification • Discord slash command system*`)
                );

            await interaction.reply({
                components: [alertContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/