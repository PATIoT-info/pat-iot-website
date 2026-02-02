# Video Setup Guide

This guide explains how to add video backgrounds and transitions to your website.

## Video File Structure

Create a `videos` folder in your project root and add your video files:

```
whitelion/
├── videos/
│   ├── hero-video.mp4          (Main hero section video)
│   ├── hero-video.webm         (WebM format for better compatibility)
│   ├── services-video.mp4      (Services section video - optional)
│   ├── services-video.webm
│   ├── about-video.mp4         (About section video - optional)
│   ├── about-video.webm
│   ├── solutions-video.mp4     (Solutions section video - optional)
│   └── solutions-video.webm
```

## Video Requirements

### Recommended Specifications:
- **Format**: MP4 (H.264) and WebM for best browser compatibility
- **Resolution**: 1920x1080 (Full HD) or higher
- **Aspect Ratio**: 16:9
- **Duration**: 10-30 seconds (will loop automatically)
- **File Size**: Keep under 10MB per video for fast loading
- **Frame Rate**: 24-30 fps
- **Codec**: H.264 for MP4, VP9 for WebM

### Video Optimization Tips:
1. **Compress videos** using tools like HandBrake or FFmpeg
2. **Use WebM format** for smaller file sizes (better compression)
3. **Keep videos short** - they loop automatically
4. **Use muted videos** - autoplay requires muted audio
5. **Optimize for web** - reduce bitrate while maintaining quality

## How to Add Videos

### Method 1: Enable Existing Video Placeholders

1. Open `script.js`
2. Find the `videoConfig` object (around line 120)
3. Set `enabled: true` for the sections where you want videos:

```javascript
const videoConfig = {
    hero: {
        enabled: true,  // Already enabled
        videoId: 'heroVideo',
        fadeOnScroll: true
    },
    services: {
        enabled: true,  // Change to true to enable
        videoId: 'servicesVideo',
        fadeOnScroll: true
    },
    about: {
        enabled: true,  // Change to true to enable
        videoId: 'aboutVideo',
        fadeOnScroll: true
    },
    solutions: {
        enabled: true,  // Change to true to enable
        videoId: 'solutionsVideo',
        fadeOnScroll: true
    }
};
```

4. Add your video files to the `videos/` folder with the correct names:
   - `hero-video.mp4` and `hero-video.webm`
   - `services-video.mp4` and `services-video.webm`
   - `about-video.mp4` and `about-video.webm`
   - `solutions-video.mp4` and `solutions-video.webm`

### Method 2: Add Custom Video Paths

1. Open `index.html`
2. Find the video element you want to customize
3. Update the `src` attribute:

```html
<video class="hero-video" id="heroVideo" autoplay muted loop playsinline>
    <source src="videos/your-custom-video.mp4" type="video/mp4">
    <source src="videos/your-custom-video.webm" type="video/webm">
</video>
```

## Video Transition Features

### 1. Hero Video Fade on Scroll
- The hero video fades out as you scroll down
- Automatically enabled when `fadeOnScroll: true`
- Can be disabled in `videoConfig`

### 2. Section Video Fade In/Out
- Videos fade in when section enters viewport
- Videos fade out when section leaves viewport
- Automatically pauses when not visible (saves bandwidth)

### 3. Smooth Transitions
- All video transitions use CSS animations
- 1.5 second fade duration for smooth effect
- Opacity transitions for professional look

## Customizing Video Overlays

### Hero Section Overlay
Edit in `styles.css`:

```css
.hero-overlay {
    background: rgba(0, 0, 0, 0.4); /* Adjust opacity (0-1) */
}
```

### Section Overlays
Edit in `styles.css`:

```css
.section-video-overlay {
    background: rgba(255, 255, 255, 0.85); /* Adjust for lighter/darker */
}
```

## Video Opacity Settings

### Hero Video
- Full opacity by default
- Fades on scroll (controlled by JavaScript)

### Section Videos
- 30% opacity by default (subtle background effect)
- Can be adjusted in `styles.css`:

```css
.section-video {
    opacity: 0.3; /* Change to 0.1-0.5 for different effects */
}
```

## Testing Videos

1. **Check Browser Console**: Open DevTools (F12) and check for video errors
2. **Test Autoplay**: Some browsers block autoplay - videos should still work
3. **Test Mobile**: Check on mobile devices for performance
4. **Test Loading**: Use slow network throttling to test loading behavior

## Troubleshooting

### Video Not Playing
- Check file paths are correct
- Ensure videos are in the `videos/` folder
- Check browser console for errors
- Verify video format (MP4 H.264 recommended)

### Video Too Large/Slow Loading
- Compress videos using HandBrake or similar
- Use WebM format for better compression
- Consider using lower resolution (1280x720)
- Implement lazy loading (already included)

### Video Not Visible
- Check `enabled: true` in `videoConfig`
- Verify overlay opacity isn't too high
- Check z-index in CSS

### Autoplay Blocked
- Videos are set to `muted` (required for autoplay)
- Some browsers may still block - this is normal
- Videos will play when user interacts with page

## Video Sources (Free Stock Videos)

If you need stock videos for home automation:

1. **Pexels Videos**: https://www.pexels.com/videos/
2. **Pixabay**: https://pixabay.com/videos/
3. **Coverr**: https://coverr.co/
4. **Videvo**: https://www.videvo.net/

Search terms: "smart home", "home automation", "technology", "modern home"

## Advanced: Custom Video Controls

To add play/pause controls, add this to `script.js`:

```javascript
// Add video control button
function addVideoControls() {
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        const controlBtn = document.createElement('button');
        controlBtn.innerHTML = '⏸️';
        controlBtn.className = 'video-control-btn';
        controlBtn.onclick = () => {
            if (heroVideo.paused) {
                heroVideo.play();
                controlBtn.innerHTML = '⏸️';
            } else {
                heroVideo.pause();
                controlBtn.innerHTML = '▶️';
            }
        };
        document.querySelector('.hero').appendChild(controlBtn);
    }
}
```

## Performance Optimization

1. **Lazy Loading**: Videos load when section is visible (already implemented)
2. **Pause When Hidden**: Videos pause when not in viewport (saves resources)
3. **Compression**: Always compress videos before uploading
4. **CDN**: Consider using a CDN for video hosting for better performance

## Notes

- Videos must be muted for autoplay to work in most browsers
- Mobile devices may have different autoplay policies
- Large video files will slow down page loading
- Always provide fallback (gradient background) if video fails to load

