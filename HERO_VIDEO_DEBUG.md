# Hero Video Debug Guide

If the hero video scroll-to-scrub isn't working, check these:

## 1. Open Browser Console (F12)
Look for messages starting with "Hero video:" to see what's happening.

## 2. Check Video File
- Video should be at: `videos/hero-video.mp4`
- File exists: ✅ (confirmed)

## 3. Test Steps
1. Open the site locally: `npm run admin` then http://127.0.0.1:3333
2. Scroll down from hero section
3. When you reach the video section, you should see:
   - Console: "Hero video: Pinned at scrollY: X"
   - Scroll position locks to video section
   - Scrolling should scrub video (not move page)

## 4. Common Issues

**Issue: Video doesn't scrub**
- Check console for "Hero video: Initialized, duration: X"
- If duration is 0 or NaN, video file might be corrupted
- Try a different video file

**Issue: Page gets stuck**
- Press ESC to release pin
- Or wait 30 seconds for auto-release
- Or scroll far past video section

**Issue: Scroll doesn't lock**
- Check console for pinning messages
- Make sure you scrolled from above (not clicked a nav link)

## 5. Quick Fix
If nothing works, the video might not be loading. Check:
- Browser Network tab → see if `hero-video.mp4` loads (status 200)
- Video file size (very large files might not load)
- Browser console for video errors
