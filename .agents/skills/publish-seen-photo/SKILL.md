---
name: publish-seen-photo
description: Use this skill when Mager sends a photo via Telegram (message has image_path) and wants it published as a "seen" post on mager.co/seen/. Trigger on: photo with a caption, "publish this photo", "post this to seen", "add to seen", or any Telegram message that has an image_path and a location or caption.
version: 0.1.0
---

# Publish Seen Photo

## Purpose

Publishes a photo (typically received via Telegram) as a "seen" post on mager.co. The `seen` collection is Mager's photo log — concert shots, travel, food, moments. One photo, one location, one caption.

## Workflow

### 1. Read the photo

The Telegram message will have an `image_path` attribute pointing to the downloaded file. Read it to understand the subject before writing alt text.

### 2. Choose a slug

Format: `YYYY-MM-DD-<subject>` using today's date and 2–4 words from the caption/subject.

Examples:
- "Noah Kahan at Wrigley Field" → `2026-07-20-noah-kahan-wrigley`
- "Sunset over Lake Michigan" → `2026-07-20-montrose-sunset`

### 3. Upload to Vercel Blob

```bash
cd ~/Code/magerblog && bash scripts/upload-photo.sh <image_path> <slug> hero
```

The script compresses to 1600px JPEG and prints the public URL. Capture it.

### 4. Create the seen post

File: `~/Code/magerblog/src/content/seen/<slug>.md`

```yaml
---
title: "<Title from caption>"
location: "<Venue/neighborhood, City, State>"
photo: "<URL from upload script>"
pubDate: YYYY-MM-DD
alt: "<One descriptive sentence of what's in the photo>"
tags: ["<tag1>", "<tag2>"]
---

<Caption — one or two sentences max. First person, casual. Just what it is.>
```

**Location format:** specific first — venue or neighborhood before city. "Wrigley Field, Chicago, IL" not "Chicago".

**Alt text:** describe what's literally in the image for screen readers. Don't editorialize.

**Tags:** 2–4 tags. Common ones: music, concert, chicago, food, travel, baseball, nature.

**Caption:** Mager's words if he gave them. Otherwise one plain sentence. Not poetic, not marketing.

### 5. Commit and push

```bash
cd ~/Code/magerblog && git add src/content/seen/<slug>.md && git commit -m "seen: <title>" && git push
```

Vercel auto-deploys. Live in ~30 seconds at `mager.co/seen/`.

### 6. Reply via Telegram

Send the live URL confirmation: `mager.co/seen/<slug>/`

## Schema reference

The `seen` collection schema (from `src/content.config.ts`):

```ts
title: z.string()           // required
location: z.string()        // required
photo: z.string().url()     // required — Vercel Blob URL
pubDate: z.coerce.date()    // required
alt: z.string().optional()
tags: z.array(z.string()).optional()
draft: z.boolean().optional()
```

## Notes

- `scripts/upload-photo.sh` requires `BLOB_READ_WRITE_TOKEN` in `~/Code/magerblog/.env.local` and the `vercel` CLI.
- `sips` (macOS) handles compression — no ImageMagick needed.
- If Mager doesn't provide a caption, use the image title as the body, keep it plain.
- If no location is given, ask via Telegram reply before publishing.
