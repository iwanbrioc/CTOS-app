# CTOS Meditation Assets

This package contains all meditation content for the CTOS app:
- Guided meditation audio recordings
- Week-specific background images
- CTOS emblem and branding
- Practice illustrations

## 📁 What's Included

### Audio Files (8 recordings)
- Grounding practice (10 min)
- Four pillars practice
- Sense of being alive (20 min)
- Seven stations of the spine
- Turning towards the difficult (15 min)
- What if all there is is this? (10 min)
- And more...

### Images (35 files)
- Week-specific background images
- Practice illustrations (dropping the balloon, five elements, etc.)
- CTOS emblem logo
- Guide cover images

### Additional Materials
- CTOS Course Guide (PDF)
- Content markdown files

## 🎯 Usage in Your App

### Audio Files
Place in: `attached_assets/`
```tsx
import audioUrl from '@assets/Grounding 10min_1751647354223.mp3'

<audio src={audioUrl} controls />
```

### Images
Place in: `attached_assets/`
```tsx
import imageUrl from '@assets/CTOS Emblem_1751662222205.png'

<img src={imageUrl} alt="CTOS" />
```

## 📦 File Structure

```
attached_assets/
├── *.mp3                    # Audio meditations
├── *.png                    # Images & illustrations
├── *.jpg                    # CTOS emblem
├── *.pdf                    # Course guides
└── content-*.md             # Content descriptions
```

## 🔧 Setup

1. Extract this zip to your project root
2. Ensure Vite is configured with @assets alias:
   ```ts
   // vite.config.ts
   resolve: {
     alias: {
       '@assets': path.resolve(__dirname, 'attached_assets')
     }
   }
   ```
3. Import and use in your React components

## 📊 Total Size

All meditation assets: ~272 MB
- Audio files: ~161 MB
- Images: ~95 MB
- PDFs: ~16 MB

## 🎨 Asset Organization by Week

Week 1: Grounding practices
Week 2: Body awareness
Week 3: Breath work
Week 4: Thoughts and emotions
Week 5: Difficult feelings
Week 6: Connection
Week 7: Being alive
Week 8: Integration

Each week has associated:
- Background image
- Audio meditation
- Practice illustrations

## ✅ Verify Assets

After extracting, check you have:
- [ ] 8 MP3 audio files
- [ ] 35 PNG/JPG images
- [ ] 2-3 PDF guides
- [ ] Content markdown files

## 🚀 Ready to Use!

These assets are already optimized for web and iOS use.
No additional processing needed.

---

**Part of the CTOS Mindfulness Meditation App**
