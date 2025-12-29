const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { fontRegister } = require("./fonts/fontRegister");
const path = require("path");
const fs = require('fs').promises;

class EnhancedMusicCard {
    constructor() {
        this.themes = {
            modern: {
                primaryColor: '#6366F1',
                secondaryColor: '#8B5CF6',
                accentColor: '#F59E0B',
                textPrimary: '#FFFFFF',
                textSecondary: '#D1D5DB',
                textMuted: '#9CA3AF',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                cardBg: 'rgba(0, 0, 0, 0.3)',
                badgeBg: '#10B981',
                watermarkColor: 'rgba(255, 255, 255, 0.1)',
                visualizerColor: '#FFD700' // Golden yellow
            },
            dark: {
                primaryColor: '#FF6B6B',
                secondaryColor: '#4ECDC4',
                accentColor: '#FFE66D',
                textPrimary: '#FFFFFF',
                textSecondary: '#E5E7EB',
                textMuted: '#9CA3AF',
                background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                cardBg: 'rgba(0, 0, 0, 0.4)',
                badgeBg: '#FF6B6B',
                watermarkColor: 'rgba(255, 255, 255, 0.08)',
                visualizerColor: '#FFD700'
            },
            neon: {
                primaryColor: '#00F5FF',
                secondaryColor: '#FF1493',
                accentColor: '#FFFF00',
                textPrimary: '#FFFFFF',
                textSecondary: '#E0E0E0',
                textMuted: '#B0B0B0',
                background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 50%, #16213E 100%)',
                cardBg: 'rgba(0, 0, 0, 0.6)',
                badgeBg: '#00F5FF',
                watermarkColor: 'rgba(0, 245, 255, 0.1)',
                visualizerColor: '#FFFF00'
            },
            spotify: {
                primaryColor: '#1DB954',
                secondaryColor: '#1ED760',
                accentColor: '#FFFFFF',
                textPrimary: '#FFFFFF',
                textSecondary: '#B3B3B3',
                textMuted: '#727272',
                background: 'linear-gradient(135deg, #191414 0%, #1DB954 100%)',
                cardBg: 'rgba(25, 20, 20, 0.8)',
                badgeBg: '#1DB954',
                watermarkColor: 'rgba(29, 185, 84, 0.15)',
                visualizerColor: '#FFD700'
            },
            lavalink: {
                primaryColor: '#DC92FF',
                secondaryColor: '#9333EA',
                accentColor: '#F59E0B',
                textPrimary: '#FFFFFF',
                textSecondary: '#E5E7EB',
                textMuted: '#A78BFA',
                background: 'linear-gradient(135deg, #DC92FF 0%, #9333EA 100%)',
                cardBg: 'rgba(0, 0, 0, 0.3)',
                badgeBg: '#7C3AED',
                watermarkColor: 'rgba(220, 146, 255, 0.12)',
                visualizerColor: '#FFD700' // Golden yellow for visualizer
            }
        };
    }

    async generateCard(options) {
        const config = this.validateAndParseOptions(options);
        
        // Initialize canvas
        const canvas = createCanvas(config.width, config.height);
        const ctx = canvas.getContext("2d");

        // Register custom fonts if provided
        if (config.fonts) {
            await this.registerFonts(config.fonts);
        }

        // Apply theme
        const theme = this.themes[config.theme] || this.themes.lavalink;

        try {
            // Draw background
            await this.drawBackground(ctx, config, theme);
            
            // Draw main content card
            await this.drawContentCard(ctx, config, theme);
            
            
            // Draw thumbnail with advanced effects
            await this.drawThumbnail(ctx, config, theme);
            
            // Draw enhanced visualizer bars (positioned lower with wave effect)
            this.drawEnhancedVisualizer(ctx, config, theme);
            
            // Draw text content with advanced typography
            await this.drawTextContent(ctx, config, theme);
            

            return canvas.toBuffer("image/png");
        } catch (error) {
            console.error('Error generating music card:', error);
            return this.generateErrorCard(canvas, ctx);
        }
    }

    validateAndParseOptions(options) {
        const defaults = {
            width: 900,
            height: 300,
            theme: 'lavalink',
            thumbnailURL: '',
            songTitle: 'Unknown Track',
            songArtist: 'Unknown Artist',
            songAlbum: '',
            trackRequester: 'Unknown',
            isPlaying: true,
            volume: 100,
            quality: 'HD',
            platform: 'Lavalink',
            showVisualizer: true,
            showWatermark: true,
            customElements: []
        };

        return { ...defaults, ...options };
    }

    async registerFonts(fonts) {
        for (const [name, path] of Object.entries(fonts)) {
            try {
                await fontRegister(path, name);
            } catch (error) {
                console.warn(`Failed to register font ${name}:`, error);
            }
        }
    }

    // ENHANCED BACKGROUND - More professional and clean
    async drawBackground(ctx, config, theme) {
        const { width, height } = config;

        // Create sophisticated gradient base
        const primaryGradient = ctx.createLinearGradient(0, 0, width, height);
        primaryGradient.addColorStop(0, theme.primaryColor);
        primaryGradient.addColorStop(0.4, theme.secondaryColor);
        primaryGradient.addColorStop(1, theme.primaryColor);

        ctx.fillStyle = primaryGradient;
        ctx.fillRect(0, 0, width, height);

        // Add subtle radial overlay for depth
        const radialOverlay = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        radialOverlay.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        radialOverlay.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
        radialOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.15)');

        ctx.fillStyle = radialOverlay;
        ctx.fillRect(0, 0, width, height);

        // Professional texture overlay
        this.addProfessionalTexture(ctx, width, height);

        // Refined geometric pattern
        this.drawRefinedPattern(ctx, config, theme);
    }

    // Professional texture instead of harsh noise
    addProfessionalTexture(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 12; // Reduced for subtlety
            data[i] = noise;
            data[i + 1] = noise;
            data[i + 2] = noise;
            data[i + 3] = 6; // Very subtle
        }

        ctx.save();
        ctx.globalCompositeOperation = 'soft-light'; // Softer blend mode
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
    }

    // Refined pattern - cleaner and more professional
    drawRefinedPattern(ctx, config, theme) {
        const { width, height } = config;
        
        // Create elegant connection pattern
        const numNodes = 35;
        const maxDistance = 120;
        const minDistance = 60;
        
        ctx.save();
        
        // Generate nodes with better distribution
        const nodes = [];
        for (let i = 0; i < numNodes; i++) {
            // Create more organic distribution
            const angle = (i / numNodes) * Math.PI * 2 + Math.random() * 0.5;
            const radius = (Math.random() * 0.3 + 0.4) * Math.min(width, height) * 0.4;
            
            nodes.push({
                x: width/2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
                y: height/2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 60,
                radius: Math.random() * 1.2 + 0.8,
                opacity: Math.random() * 0.4 + 0.3
            });
        }
        
        // Draw elegant connections
        this.drawElegantConnections(ctx, nodes, theme, maxDistance, minDistance);
        
        // Draw refined nodes
        this.drawRefinedNodes(ctx, nodes, theme);
        
        ctx.restore();
    }

    // More elegant connection drawing
    drawElegantConnections(ctx, nodes, theme, maxDistance, minDistance) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > minDistance && distance < maxDistance) {
                    const strength = 1 - (distance / maxDistance);
                    const alpha = strength * 0.15; // More subtle
                    
                    // Create smooth gradient line
                    const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * n1.opacity})`);
                    gradient.addColorStop(0.5, `rgba(220, 146, 255, ${alpha * 0.6})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * n2.opacity})`);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = strength * 0.8;
                    
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }
    }

    // Refined node rendering
    drawRefinedNodes(ctx, nodes, theme) {
        nodes.forEach(node => {
            ctx.save();
            
            // Subtle glow
            const glowGradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 3
            );
            glowGradient.addColorStop(0, `rgba(255, 255, 255, ${node.opacity * 0.2})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Main node
            const nodeGradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius
            );
            nodeGradient.addColorStop(0, `rgba(255, 255, 255, ${node.opacity * 0.8})`);
            nodeGradient.addColorStop(1, `rgba(220, 146, 255, ${node.opacity * 0.3})`);
            
            ctx.fillStyle = nodeGradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    // ENHANCED VISUALIZER - Moved down slightly
    drawEnhancedVisualizer(ctx, config, theme) {
        if (!config.showVisualizer) return;

        const barCount = 32;
        const barWidth = 8;
        const barSpacing = 4;
        const maxBarHeight = 70;
        const minBarHeight = 15;
        const startX = 50;
        const baseY = config.height - 40; // MOVED DOWN by 20px (was -60)

        ctx.save();
        
        // Create wave pattern with multiple sine waves for complex motion
        for (let i = 0; i < barCount; i++) {
            const wavePhase1 = (i / barCount) * Math.PI * 4;
            const wavePhase2 = (i / barCount) * Math.PI * 2.5;
            const wavePhase3 = (i / barCount) * Math.PI * 6;
            
            // Combine multiple sine waves for complex motion
            const wave1 = Math.sin(wavePhase1) * 0.5;
            const wave2 = Math.sin(wavePhase2) * 0.3;
            const wave3 = Math.sin(wavePhase3) * 0.2;
            
            // Add random variation for organic feel
            const randomFactor = (Math.random() - 0.5) * 0.3;
            const combinedWave = wave1 + wave2 + wave3 + randomFactor;
            
            // Calculate bar height based on playing state and wave
            const playingMultiplier = config.isPlaying ? 1 : 0.3;
            const normalizedWave = (combinedWave + 1) / 2;
            const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedWave * playingMultiplier;
            
            const x = startX + i * (barWidth + barSpacing);
            
            // Create gradient for each bar (golden yellow glow)
            const barGradient = ctx.createLinearGradient(0, baseY - barHeight, 0, baseY);
            barGradient.addColorStop(0, theme.visualizerColor);
            barGradient.addColorStop(0.7, '#FFA500');
            barGradient.addColorStop(1, '#FF6B00');
            
            // Draw main bar
            ctx.fillStyle = barGradient;
            ctx.beginPath();
            ctx.roundRect(x, baseY - barHeight, barWidth, barHeight, barWidth/2);
            ctx.fill();
            
            // Add glow effect
            ctx.save();
            ctx.shadowColor = theme.visualizerColor;
            ctx.shadowBlur = 15;
            ctx.globalCompositeOperation = 'screen';
            ctx.fill();
            
            // Additional outer glow
            ctx.shadowBlur = 25;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
            ctx.fill();
            ctx.restore();
            
            // Add reflection effect at the bottom
            ctx.save();
            ctx.globalAlpha = 0.3;
            const reflectionGradient = ctx.createLinearGradient(0, baseY, 0, baseY + barHeight * 0.4);
            reflectionGradient.addColorStop(0, theme.visualizerColor);
            reflectionGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = reflectionGradient;
            ctx.beginPath();
            ctx.roundRect(x, baseY, barWidth, barHeight * 0.4, barWidth/2);
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    }

    async drawContentCard(ctx, config, theme) {
        const { width, height } = config;
        const cardMargin = 20;
        const cardRadius = 20;

        ctx.save();
        
        // Glass morphism card
        ctx.beginPath();
        ctx.roundRect(cardMargin, cardMargin, width - cardMargin * 2, height - cardMargin * 2, cardRadius);
        
        const cardGradient = ctx.createLinearGradient(0, 0, 0, height);
        cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        ctx.fillStyle = cardGradient;
        ctx.fill();
        
        // Border glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;
        ctx.fill();
        
        ctx.restore();
    }

    async drawThumbnail(ctx, config, theme) {
        const { height } = config;
        const thumbnailSize = height - 80;
        const thumbnailX = config.width - thumbnailSize - 40;
        const thumbnailY = 40;
        const radius = 15;

        try {
            const thumbnailImage = await loadImage(config.thumbnailURL);
            
            ctx.save();
            
            // Rounded thumbnail
            ctx.beginPath();
            ctx.roundRect(thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, radius);
            ctx.clip();
            ctx.drawImage(thumbnailImage, thumbnailX, thumbnailY, thumbnailSize, thumbnailSize);
            ctx.restore();
            
            // Glow border
            ctx.save();
            ctx.shadowColor = theme.primaryColor;
            ctx.shadowBlur = 12;
            ctx.strokeStyle = theme.primaryColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, radius);
            ctx.stroke();
            ctx.restore();
            
        } catch (error) {
            this.drawThumbnailPlaceholder(ctx, thumbnailX, thumbnailY, thumbnailSize, theme);
        }
    }

    drawThumbnailPlaceholder(ctx, x, y, size, theme) {
        ctx.save();
        
        // Background
        ctx.fillStyle = theme.cardBg;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 15);
        ctx.fill();
        
        // Music note icon
        ctx.fillStyle = theme.textMuted;
        ctx.font = `${size * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎵', x + size/2, y + size/2);
        
        ctx.restore();
    }

    // Enhanced visualizer - positioned lower with prolonged wave-like bars
    drawEnhancedVisualizer(ctx, config, theme) {
        if (!config.showVisualizer) return;

        const barCount = 32; // More bars for smoother wave effect
        const barWidth = 8;  // Wider bars
        const barSpacing = 4; // Closer spacing
        const maxBarHeight = 70; // Taller bars
        const minBarHeight = 15; // Minimum height
        const startX = 50;
        const baseY = config.height - 60; // Positioned lower as requested

        ctx.save();
        
        // Create wave pattern with multiple sine waves for complex motion
        for (let i = 0; i < barCount; i++) {
            const wavePhase1 = (i / barCount) * Math.PI * 4; // Primary wave
            const wavePhase2 = (i / barCount) * Math.PI * 2.5; // Secondary wave
            const wavePhase3 = (i / barCount) * Math.PI * 6; // High frequency detail
            
            // Combine multiple sine waves for complex motion
            const wave1 = Math.sin(wavePhase1) * 0.5;
            const wave2 = Math.sin(wavePhase2) * 0.3;
            const wave3 = Math.sin(wavePhase3) * 0.2;
            
            // Add random variation for organic feel
            const randomFactor = (Math.random() - 0.5) * 0.3;
            const combinedWave = wave1 + wave2 + wave3 + randomFactor;
            
            // Calculate bar height based on playing state and wave
            const playingMultiplier = config.isPlaying ? 1 : 0.3;
            const normalizedWave = (combinedWave + 1) / 2; // Normalize to 0-1
            const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * normalizedWave * playingMultiplier;
            
            const x = startX + i * (barWidth + barSpacing);
            
            // Create gradient for each bar (golden yellow glow)
            const barGradient = ctx.createLinearGradient(0, baseY - barHeight, 0, baseY);
            barGradient.addColorStop(0, theme.visualizerColor); // Golden yellow top
            barGradient.addColorStop(0.7, '#FFA500'); // Orange middle
            barGradient.addColorStop(1, '#FF6B00'); // Orange-red bottom
            
            // Draw main bar
            ctx.fillStyle = barGradient;
            ctx.beginPath();
            ctx.roundRect(x, baseY - barHeight, barWidth, barHeight, barWidth/2);
            ctx.fill();
            
            // Add intense glow effect
            ctx.save();
            ctx.shadowColor = theme.visualizerColor;
            ctx.shadowBlur = 15;
            ctx.globalCompositeOperation = 'screen';
            ctx.fill();
            
            // Additional outer glow
            ctx.shadowBlur = 25;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
            ctx.fill();
            ctx.restore();
            
            // Add reflection effect at the bottom
            ctx.save();
            ctx.globalAlpha = 0.3;
            const reflectionGradient = ctx.createLinearGradient(0, baseY, 0, baseY + barHeight * 0.4);
            reflectionGradient.addColorStop(0, theme.visualizerColor);
            reflectionGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = reflectionGradient;
            ctx.beginPath();
            ctx.roundRect(x, baseY, barWidth, barHeight * 0.4, barWidth/2);
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    }

    async drawTextContent(ctx, config, theme) {
        const maxWidth = config.width - 320; // Account for thumbnail space
        
        // Song title
        ctx.save();
        ctx.fillStyle = theme.textPrimary;
        ctx.font = 'bold 38px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const truncatedTitle = this.truncateText(ctx, config.songTitle, maxWidth);
        
        // Text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(truncatedTitle, 50, 60);
        
        ctx.restore();

        // Song artist
        ctx.save();
        ctx.fillStyle = theme.textSecondary;
        ctx.font = '26px Inter, Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;
        
        const truncatedArtist = this.truncateText(ctx, config.songArtist, maxWidth);
        ctx.fillText(truncatedArtist, 50, 115);
        ctx.restore();
    }

    
    

    truncateText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }

        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }

    generateErrorCard(canvas, ctx) {
        const { width, height } = canvas;
        
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Error generating music card', width/2, height/2);
        
        return canvas.toBuffer("image/png");
    }
}

module.exports = { EnhancedMusicCard };
