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
const { SlashCommandBuilder } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('Ultimate hacking simulation (100% FAKE - for fun only!)')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to hack (fake simulation)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Hacking method to use')
                .addChoices(
                    { name: 'Script Kiddie (Basic)', value: 'basic' },
                    { name: 'Advanced Hacker', value: 'advanced' },
                    { name: 'Elite Black Hat', value: 'elite' },
                    { name: 'Government Level', value: 'government' },
                    { name: 'Matrix Mode', value: 'matrix' }
                )),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const method = interaction.options.getString('method') || 'advanced';
        
        if (target.id === interaction.user.id) {
            return interaction.reply({ content: '🤔 You cannot hack yourself! Try someone else.', ephemeral: true });
        }

        if (target.bot) {
            return interaction.reply({ content: '🤖 Bots have quantum encryption! Choose a human target.', ephemeral: true });
        }

        await interaction.deferReply();
        
        await this.executeHackingSimulation(interaction, target, method);
    },

    async executeHackingSimulation(interaction, target, method) {
        const hackConfig = this.getHackConfig(method);
        const phases = this.getHackingPhases(target, hackConfig);


        const startContainer = new ContainerBuilder()
            .setAccentColor(0xff0000);

        startContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚡ HACKING INITIATED\n## Target: ${target.displayName}\n\n> **METHOD:** ${hackConfig.name}\n> **DIFFICULTY:** ${hackConfig.difficulty}\n> **SUCCESS RATE:** ${hackConfig.successRate}%\n\n🔴 **INITIALIZING ATTACK VECTORS...**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(target.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setDescription(`${target.displayName} - Target`)
                )
        );

        await interaction.editReply({
            components: [startContainer],
            flags: MessageFlags.IsComponentsV2
        });

    
        for (let i = 0; i < phases.length; i++) {
  
            await wait(hackConfig.timing);
            
            const phase = phases[i];
            const components = [];

      
            const phaseContainer = new ContainerBuilder()
                .setAccentColor(phase.color);

            phaseContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ${phase.icon} ${phase.title}\n## ${phase.subtitle}\n\n> ${phase.description}\n\n**STATUS:** ${phase.status}\n**PROGRESS:** ${Math.round((i + 1) / phases.length * 100)}%`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(target.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setDescription(phase.thumbnailDesc)
                    )
            );

            components.push(phaseContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            if (hackConfig.level >= 3) {
                const techContainer = new ContainerBuilder()
                    .setAccentColor(0x00ff41);

                techContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 💻 **Technical Output**',
                            '',
                            phase.techOutput,
                            '```',
                            '',
                            `**🎯 Attack Vector:** ${phase.vector}`,
                            `**🛡️ Security Bypass:** ${phase.bypass}`,
                            `**📡 Connection:** ${phase.connection}`
                        ].join('\n'))
                );

                components.push(techContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            }

       
            await interaction.editReply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
        }


        await wait(3000); 
        await this.showHackResults(interaction, target, hackConfig);
    },

    async showHackResults(interaction, target, hackConfig) {
        const fakeData = this.generateAdvancedFakeData(target, hackConfig);
        const components = [];

   
        const successContainer = new ContainerBuilder()
            .setAccentColor(0x00ff00);

        successContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ✅ HACK SUCCESSFUL!\n## ${target.displayName} - COMPROMISED\n\n> **TARGET FULLY PENETRATED**\n> All systems breached using ${hackConfig.name}\n> Data extraction complete - ${fakeData.totalFiles.toLocaleString()} files stolen\n\n🔥 **WELCOME TO THE MATRIX** 🔥`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(target.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setDescription('TARGET COMPROMISED')
                )
        );

        components.push(successContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

   
        const personalContainer = new ContainerBuilder()
            .setAccentColor(0xff6b35);

        personalContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 👤 **PERSONAL INFORMATION EXTRACTED**',
                    '',
                    `**🎯 Target Identity**`,
                    `Name: ${fakeData.realName}`,
                    `Username: ${target.username}`,
                    `Discord ID: ${target.id}`,
                    `Account Age: ${fakeData.accountAge}`,
                    '',
                    `**📧 Email Intelligence**`,
                    `Primary: ${fakeData.email}`,
                    `Recovery: ${fakeData.recoveryEmail}`,
                    '',
                    `**🎂 Personal Details**`,
                    `Date of Birth: ${fakeData.dob}`,
                    `Phone: ${fakeData.phone}`,
                    `Address: ${fakeData.address}`
                ].join('\n'))
        );

        components.push(personalContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

  
        const deviceContainer = new ContainerBuilder()
            .setAccentColor(0x3498db);

        deviceContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 💻 **DEVICE & NETWORK INTELLIGENCE**',
                    '',
                    `**🖥️ Primary Device**`,
                    `OS: ${fakeData.os}`,
                    `Device Name: ${fakeData.deviceName}`,
                    `Login Password: \`${fakeData.devicePassword}\``,
                    `PIN Code: \`${fakeData.pinCode}\``,
                    '',
                    `**📶 Network Access**`,
                    `WiFi Name: ${fakeData.wifiName}`,
                    `WiFi Password: \`${fakeData.wifiPassword}\``,
                    `Router Admin: \`${fakeData.routerPassword}\``,
                    `IP Address: ${fakeData.ipAddress}`,
                    '',
                    `**🔐 Security Status**`,
                    `Firewall: ${fakeData.firewall}`,
                    `Antivirus: ${fakeData.antivirus}`,
                    `VPN Status: ${fakeData.vpnStatus}`
                ].join('\n'))
        );

        components.push(deviceContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

    
        const financialContainer = new ContainerBuilder()
            .setAccentColor(0xf39c12);

        financialContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 💳 **FINANCIAL DATA COMPROMISED**',
                    '',
                    `**💰 Banking Information**`,
                    `Bank: ${fakeData.bank}`,
                    `Account: \`****${fakeData.bankAccount}\``,
                    `Balance: $${fakeData.balance.toLocaleString()}`,
                    '',
                    `**💳 Credit Cards**`,
                    `Primary: \`****-****-****-${fakeData.creditCard1}\``,
                    `Backup: \`****-****-****-${fakeData.creditCard2}\``,
                    `CVV: \`${fakeData.cvv}\` | Exp: \`${fakeData.expiry}\``,
                    '',
                    `**🏪 Crypto Wallets**`,
                    `Bitcoin: ${fakeData.bitcoinWallet.substring(0, 20)}...`,
                    `Ethereum: ${fakeData.ethWallet.substring(0, 20)}...`,
                    `Total Value: $${fakeData.cryptoValue.toLocaleString()}`
                ].join('\n'))
        );

        components.push(financialContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

   
        const passwordContainer = new ContainerBuilder()
            .setAccentColor(0x9b59b6);

        passwordContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 🔑 **PASSWORD VAULT CRACKED**',
                    '',
                    `**🌐 Social Media**`,
                    `Discord: \`${fakeData.passwords.discord}\``,
                    `Instagram: \`${fakeData.passwords.instagram}\``,
                    `Twitter/X: \`${fakeData.passwords.twitter}\``,
                    '',
                    `**📧 Email & Cloud**`,
                    `Gmail: \`${fakeData.passwords.gmail}\``,
                    `Apple ID: \`${fakeData.passwords.apple}\``,
                    `Microsoft: \`${fakeData.passwords.microsoft}\``,
                    '',
                    `**🎮 Gaming**`,
                    `Steam: \`${fakeData.passwords.steam}\``,
                    `Epic Games: \`${fakeData.passwords.epic}\``,
                    `PlayStation: \`${fakeData.passwords.playstation}\``
                ].join('\n'))
        );

        components.push(passwordContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

  
        const summaryContainer = new ContainerBuilder()
            .setAccentColor(hackConfig.level >= 4 ? 0x000000 : 0x34495e);

        summaryContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    `## ${hackConfig.level >= 4 ? '🏴‍☠️' : '📊'} **HACK SUMMARY**`,
                    '',
                    `**🎯 Operation Details**`,
                    `Method Used: ${hackConfig.name}`,
                    `Time Elapsed: ${hackConfig.duration}`,
                    `Success Rate: ${hackConfig.successRate}%`,
                    `Data Stolen: ${fakeData.totalFiles.toLocaleString()} files`,
                    '',
                    `**⚡ Capabilities Demonstrated**`,
                    hackConfig.capabilities.map(cap => `• ${cap}`).join('\n'),
                    '',
                    `**⚠️ DISCLAIMER**`,
                    `This is 100% FAKE simulation for entertainment!`,
                    `No real hacking occurred. All data is randomly generated.`,
                    `Real hacking is illegal and unethical.`,
                    '',
                    `*Simulation completed by ${interaction.user.displayName}*`
                ].join('\n'))
        );

        components.push(summaryContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },

    getHackConfig(method) {
        const configs = {
            basic: {
                name: 'Script Kiddie Attack',
                difficulty: 'Beginner',
                successRate: 45,
                level: 1,
                timing: 2500, 
                duration: '2 minutes',
                capabilities: ['Basic password cracking', 'Simple malware', 'Social engineering']
            },
            advanced: {
                name: 'Advanced Penetration Testing',
                difficulty: 'Intermediate',
                successRate: 78,
                level: 3,
                timing: 3500, 
                duration: '8 minutes',
                capabilities: ['SQL injection', 'Buffer overflow', 'Network sniffing', 'Privilege escalation']
            },
            elite: {
                name: 'Elite Black Hat Operations',
                difficulty: 'Expert',
                successRate: 92,
                level: 4,
                timing: 4000, 
                duration: '15 minutes',
                capabilities: ['Zero-day exploits', 'Advanced persistent threats', 'Rootkit deployment', 'Steganography']
            },
            government: {
                name: 'State-Sponsored Cyber Warfare',
                difficulty: 'Nation-State',
                successRate: 98,
                level: 5,
                timing: 4500, 
                duration: '45 minutes',
                capabilities: ['Quantum decryption', 'Satellite hijacking', 'Infrastructure disruption', 'Deep cover operations']
            },
            matrix: {
                name: 'Matrix-Level Reality Hack',
                difficulty: 'Neo',
                successRate: 100,
                level: 6,
                timing: 1500, 
                duration: '0.1 seconds',
                capabilities: ['Reality manipulation', 'Time dilation', 'Consciousness transfer', 'Digital transcendence']
            }
        };

        return configs[method];
    },

    getHackingPhases(target, config) {
        const phases = [
            {
                icon: '🔍',
                title: 'RECONNAISSANCE',
                subtitle: 'Intelligence Gathering',
                description: `Scanning ${target.displayName} digital footprint across all platforms`,
                status: 'OSINT data collection in progress...',
                color: 0x3498db,
                thumbnailDesc: 'Scanning target',
                techOutput: `nmap -sS -O ${target.id}.target.local\nPort 22: SSH - OPEN\nPort 80: HTTP - OPEN\nPort 443: HTTPS - OPEN\nOS Detection: Complete`,
                vector: 'Social Media Analysis',
                bypass: 'Public Information Mining',
                connection: 'Anonymous Proxy Chain'
            },
            {
                icon: '⚡',
                title: 'VULNERABILITY SCANNING',
                subtitle: 'Weakness Detection',
                description: `Probing ${target.displayName} systems for security vulnerabilities`,
                status: 'Critical vulnerabilities detected!',
                color: 0xf39c12,
                thumbnailDesc: 'Analyzing weaknesses',
                techOutput: `nikto -h ${target.username}.local\n+ Server: Apache/2.4.41\n+ OSVDB-3268: /admin/: Admin login found\n+ OSVDB-3092: /passwords/: Passwords directory\n+ CVE-2023-0001: Buffer overflow detected`,
                vector: 'Web Application Testing',
                bypass: 'CVE-2023-0001 Exploit',
                connection: 'Tor Hidden Service'
            },
            {
                icon: '💥',
                title: 'EXPLOITATION',
                subtitle: 'System Penetration',
                description: `Executing exploit chain against ${target.displayName} infrastructure`,
                status: 'BREACH SUCCESSFUL - Shell access obtained!',
                color: 0xe74c3c,
                thumbnailDesc: 'Infiltrating systems',
                techOutput: `msfconsole\nuse exploit/multi/handler\nset payload windows/meterpreter/reverse_tcp\nexploit\n[*] Sending stage (175174 bytes)\n[*] Meterpreter session 1 opened\nmeterpreter > shell`,
                vector: 'Metasploit Framework',
                bypass: 'Windows Defender Evasion',
                connection: 'Encrypted C2 Channel'
            },
            {
                icon: '🗃️',
                title: 'DATA EXFILTRATION',
                subtitle: 'Information Harvesting',
                description: `Extracting sensitive data from ${target.displayName} compromised systems`,
                status: 'Terabytes of data being transferred...',
                color: 0x00ff41,
                thumbnailDesc: 'Stealing data',
                techOutput: `7z a -p"hack2023!" stolen_data.7z C:\\Users\\*\\*\nwinrar a -hp"encrypt" data.rar D:\\Documents\\*\nFileZilla.exe -upload darknet.onion/drop/\n[████████████████] 100% Complete\n2.3 TB transferred`,
                vector: 'Automated Data Mining',
                bypass: 'Encrypted Compression',
                connection: 'Dark Web Drop Zone'
            },
            {
                icon: '👻',
                title: 'PERSISTENCE & CLEANUP',
                subtitle: 'Covering Tracks',
                description: `Installing backdoors and erasing evidence of breach`,
                status: 'Ghost mode activated - completely undetectable!',
                color: 0x34495e,
                thumbnailDesc: 'Erasing traces',
                techOutput: `schtasks /create /tn "WindowsUpdate" /tr "C:\\Windows\\system32\\backdoor.exe"\nwevtutil cl System\nwevtutil cl Security\nwevtutil cl Application\n[+] Event logs cleared\n[+] Rootkit installed\n[+] Completely invisible`,
                vector: 'Rootkit Deployment',
                bypass: 'Anti-Forensics Techniques',
                connection: 'Dormant Until Activated'
            }
        ];

        return phases.slice(0, Math.min(config.level + 1, phases.length));
    },

    generateAdvancedFakeData(target, config) {
        const firstNames = ['Alex', 'Jordan', 'Casey', 'Riley', 'Avery', 'Morgan', 'Quinn', 'Sage', 'Rowan', 'Blake'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'hotmail.com'];
        const banks = ['Chase Bank', 'Wells Fargo', 'Bank of America', 'Citibank', 'Capital One'];
        const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
        
        const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        return {
            realName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
            accountAge: `${randomNumber(1, 8)} years`,
            email: `${target.username}${randomNumber(10, 99)}@${randomChoice(domains)}`,
            recoveryEmail: `${target.username}.recovery@${randomChoice(domains)}`,
            dob: `${randomNumber(1990, 2005)}-${String(randomNumber(1, 12)).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
            phone: `+1 (${randomNumber(200, 999)}) ${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
            address: `${randomNumber(100, 9999)} ${randomChoice(['Oak', 'Maple', 'Pine', 'Elm', 'Cedar'])} ${randomChoice(['St', 'Ave', 'Dr', 'Ln', 'Ct'])}, ${randomChoice(cities)}`,
            
            os: randomChoice(['Windows 11 Pro', 'macOS Ventura', 'Ubuntu 22.04 LTS', 'Windows 10 Home']),
            deviceName: `${target.username}-${randomChoice(['Desktop', 'Laptop', 'Gaming-PC', 'MacBook'])}`,
            devicePassword: `${target.username}${randomNumber(100, 999)}!`,
            pinCode: String(randomNumber(1000, 9999)),
            
            wifiName: `${randomChoice(['NETGEAR', 'Linksys', 'TP-Link', 'ASUS'])}_${randomNumber(1000, 9999)}`,
            wifiPassword: `${randomChoice(['WiFi', 'Network', 'Internet'])}${randomNumber(100, 999)}!`,
            routerPassword: `admin${randomNumber(100, 999)}`,
            ipAddress: `192.168.${randomNumber(1, 255)}.${randomNumber(1, 255)}`,
            
            firewall: randomChoice(['Disabled', 'Windows Defender', 'Norton', 'McAfee', 'Bitdefender']),
            antivirus: randomChoice(['None', 'Windows Defender', 'AVG', 'Avast', 'Kaspersky']),
            vpnStatus: randomChoice(['Not Using VPN', 'ExpressVPN', 'NordVPN', 'Surfshark', 'CyberGhost']),
            
            bank: randomChoice(banks),
            bankAccount: String(randomNumber(1000, 9999)),
            balance: randomNumber(50, 50000),
            creditCard1: String(randomNumber(1000, 9999)),
            creditCard2: String(randomNumber(1000, 9999)),
            cvv: String(randomNumber(100, 999)),
            expiry: `${String(randomNumber(1, 12)).padStart(2, '0')}/${String(randomNumber(25, 30))}`,
            
            bitcoinWallet: `1${Array(33).fill().map(() => randomChoice('ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789')).join('')}`,
            ethWallet: `0x${Array(40).fill().map(() => randomChoice('0123456789abcdef')).join('')}`,
            cryptoValue: randomNumber(100, 10000),
            
            passwords: {
                discord: `${target.username}${randomNumber(100, 999)}!`,
                instagram: `Insta${randomNumber(1000, 9999)}!`,
                twitter: `Tweet${randomNumber(100, 999)}$`,
                gmail: `Gmail${randomNumber(100, 999)}@`,
                apple: `Apple${randomNumber(1000, 9999)}!`,
                microsoft: `MS${randomNumber(100, 999)}$`,
                steam: `Steam${randomNumber(1000, 9999)}`,
                epic: `Epic${randomNumber(100, 999)}!`,
                playstation: `PS${randomNumber(1000, 9999)}#`
            },
            
            totalFiles: randomNumber(50000, 500000)
        };
    }
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