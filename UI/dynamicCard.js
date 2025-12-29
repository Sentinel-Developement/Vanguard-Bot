const { EnhancedMusicCard } = require('./enhancedMusicCard');

// Function wrapper to maintain backward compatibility
async function dynamicCard(options) {
    try {
        const musicCard = new EnhancedMusicCard();
        
        // Map your current options to the enhanced card format
        const enhancedOptions = {
            theme: 'modern',
            width: 800,
            height: 250,
            thumbnailURL: options.thumbnailURL,
            songTitle: options.songTitle,
            songArtist: options.songArtist,
            trackRequester: options.trackRequester,
            customBackground: options.backgroundColor ? null : undefined,
            fonts: options.fontPath ? {
                'CustomFont': options.fontPath
            } : undefined,
            // Add default values for enhanced features
            duration: '0:00',
            currentTime: '0:00',
            progress: 0,
            isPlaying: true,
            volume: 100,
            quality: 'HD',
            platform: 'Music',
            queuePosition: 1,
            totalQueue: 1,
            showVisualizer: true
        };

        return await musicCard.generateCard(enhancedOptions);
    } catch (error) {
        console.error('Enhanced card generation failed, falling back to simple card:', error);
        return await generateSimpleCard(options);
    }
}

// Fallback simple card generator
async function generateSimpleCard(options) {
    const { createCanvas, loadImage } = require("@napi-rs/canvas");
    const { fontRegister } = require("./fonts/fontRegister");
    
    const cardWidth = 800;
    const cardHeight = 250;
    const canvas = createCanvas(cardWidth, cardHeight);
    const ctx = canvas.getContext("2d");

    try {
        // Register font if provided
        if (options.fontPath) {
            await fontRegister(options.fontPath, "CustomFont");
        }

        // Background
        ctx.fillStyle = options.backgroundColor || '#DC92FF';
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, options.backgroundColor || '#DC92FF');
        gradient.addColorStop(1, '#9333EA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Load and draw thumbnail
        try {
            const thumbnailImage = await loadImage(options.thumbnailURL);
            const thumbnailSize = cardHeight - 40;
            const thumbnailX = cardWidth - thumbnailSize - 20;
            const thumbnailY = 20;

            // Rounded thumbnail
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, 15);
            ctx.clip();
            ctx.drawImage(thumbnailImage, thumbnailX, thumbnailY, thumbnailSize, thumbnailSize);
            ctx.restore();

            // Thumbnail border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, 15);
            ctx.stroke();
        } catch (thumbError) {
            console.warn('Failed to load thumbnail, using placeholder');
            // Draw placeholder
            const thumbnailSize = cardHeight - 40;
            const thumbnailX = cardWidth - thumbnailSize - 20;
            const thumbnailY = 20;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(thumbnailX, thumbnailY, thumbnailSize, thumbnailSize, 15);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎵', thumbnailX + thumbnailSize/2, thumbnailY + thumbnailSize/2 + 15);
        }

        // Text content
        const maxWidth = cardWidth - (cardHeight - 40) - 60; // Account for thumbnail and padding

        // Song title
        ctx.fillStyle = 'white';
        ctx.font = options.fontPath ? "bold 32px 'CustomFont'" : "bold 32px Arial";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        let truncatedTitle = options.songTitle;
        while (ctx.measureText(truncatedTitle).width > maxWidth && truncatedTitle.length > 0) {
            truncatedTitle = truncatedTitle.slice(0, -1);
        }
        if (truncatedTitle.length < options.songTitle.length) {
            truncatedTitle = truncatedTitle.slice(0, -3) + '...';
        }
        
        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(truncatedTitle, 30, 40);

        // Song artist
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#E5E7EB';
        ctx.font = options.fontPath ? "24px 'CustomFont'" : "24px Arial";
        
        let truncatedArtist = options.songArtist;
        while (ctx.measureText(truncatedArtist).width > maxWidth && truncatedArtist.length > 0) {
            truncatedArtist = truncatedArtist.slice(0, -1);
        }
        if (truncatedArtist.length < options.songArtist.length) {
            truncatedArtist = truncatedArtist.slice(0, -3) + '...';
        }
        
        ctx.fillText(truncatedArtist, 30, 85);

        // Requester
        ctx.fillStyle = '#D1D5DB';
        ctx.font = options.fontPath ? "18px 'CustomFont'" : "18px Arial";
        ctx.fillText(`Requested by: ${options.trackRequester}`, 30, cardHeight - 40);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        return canvas.toBuffer("image/png");

    } catch (error) {
        console.error('Simple card generation failed:', error);
        
        // Ultra-basic fallback
        ctx.fillStyle = '#DC92FF';
        ctx.fillRect(0, 0, cardWidth, cardHeight);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Music Player', cardWidth/2, cardHeight/2);
        
        return canvas.toBuffer("image/png");
    }
}

module.exports = { dynamicCard };
