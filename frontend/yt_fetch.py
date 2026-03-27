import urllib.request
import urllib.parse
import re
import json

categories = {
  "Self Help books": [
    ("As a Man Thinketh full audiobook public domain", "James Allen (Public Domain)"), 
    ("The Science of Getting Rich audiobook public domain", "Wallace D. Wattles (Public Domain)"), 
    ("The Art of War full audiobook public domain", "Sun Tzu (Public Domain)"), 
    ("Meditations Marcus Aurelius audiobook public domain", "Marcus Aurelius (Public Domain)"), 
    ("Think and Grow Rich full audiobook public domain", "Napoleon Hill (Public Domain)"), 
    ("Acres of Diamonds audiobook public domain", "Russell Conwell (Public Domain)"), 
    ("The Prophet Kahlil Gibran audiobook public domain", "Kahlil Gibran (Public Domain)"), 
    ("Tao Te Ching audiobook public domain", "Lao Tzu (Public Domain)"), 
    ("Self Reliance Ralph Waldo Emerson audiobook public domain", "Ralph Waldo Emerson (Public Domain)"),
    ("The Game of Life and How to Play It audiobook public domain", "Florence Scovel Shinn (Public Domain)")
  ],
  "Motivational Podcasts": [
    ("No copyright motivational speech audio", "Free Motivation"), 
    ("Creative commons motivational podcast", "CC Motivation"), 
    ("Free to use motivational speech", "Public Domain Motivation"), 
    ("No copyright inspiration podcast", "Inspire Free"), 
    ("Public domain motivational audio", "PD Audio"), 
    ("Non copyrighted motivational podcast speech", "Free Mindset"), 
    ("Royalty free motivational podcast speech", "Royalty Free"), 
    ("Creative commons mindset podcast", "CC Mindset"), 
    ("Free motivational speech no copyright", "Free To Use"), 
    ("No copyright daily motivation podcast", "Daily Free Motivation")
  ],
  "Meditation Videos": [
    ("No copyright guided meditation video", "Free Meditation"), 
    ("Creative commons meditation video", "CC Meditation"), 
    ("Free guided meditation no copyright", "Free To Use Guided"), 
    ("Mindfulness meditation creative commons", "CC Mindfulness"), 
    ("No copyright soothing meditation video", "Soothing No Copyright"), 
    ("Public domain guided meditation", "PD Meditation"), 
    ("Royalty free meditation video", "Royalty Free"), 
    ("Creative commons sleep meditation", "CC Sleep"), 
    ("No copyright morning meditation video", "Morning No Copyright"), 
    ("Free to use meditation video", "Free To Use")
  ],
  "Therapy Videos": [
    ("Creative commons psychology educational video", "CC Psychology"), 
    ("No copyright mental health educational video", "Mental Health Free"), 
    ("Free mental health awareness video", "Awareness No Copyright"), 
    ("Creative commons cognitive behavioral therapy video", "CC CBT"), 
    ("No copyright psychology facts video", "Psychology Facts Free"), 
    ("Public domain mental health video", "PD Mental Health"), 
    ("Creative commons psychological therapy explanation", "CC Therapy"), 
    ("No copyright mental wellness video", "Wellness Free"), 
    ("Free educational therapy video", "Education Free"), 
    ("Creative commons emotional regulation educational video", "CC Emotions")
  ],
  "Relaxation Music": [
    ("No copyright relaxation music", "Free Relaxation"), 
    ("Creative commons relaxing music", "CC Relaxing Music"), 
    ("Royalty free meditation music", "Royalty Free Meditation"), 
    ("No copyright sleep music", "Sleep Music Free"), 
    ("Free relaxing ambient music", "Ambient Free"), 
    ("Creative commons nature sounds music", "CC Nature Sounds"), 
    ("No copyright studying music", "Study Music Free"), 
    ("Royalty free calming music", "Calming Royalty Free"), 
    ("No copyright piano relaxation music", "Piano Free"), 
    ("Free copyright calm music", "Calm Music Free")
  ]
}

results = {}
for cat, items in categories.items():
    results[cat] = []
    for q, subtitle in items:
        try:
            url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req).read().decode('utf-8')
            video_ids = re.findall(r'"videoId":"([^"]{11})"', html)
            
            unique_vids = []
            for v in video_ids:
                if v not in unique_vids:
                    unique_vids.append(v)
            
            target_vid = unique_vids[0] if unique_vids else "dQw4w9WgXcQ"
            
            results[cat].append({
                "title": q.replace(" Animated", "").replace(" Summary", "").title(),
                "subtitle": subtitle,
                "desc": "Curated therapeutic content.",
                "action": "Watch on YouTube",
                "icon": "▶️",
                "link": f"https://www.youtube.com/watch?v={target_vid}"
            })
        except Exception as e:
            results[cat].append({
                "title": q.title(),
                "subtitle": subtitle,
                "desc": "Curated therapeutic content.",
                "action": "Watch on YouTube",
                "icon": "▶️",
                "link": f"https://www.youtube.com/results?search_query={urllib.parse.quote(q)}"
            })

with open('yt_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Done generating yt_results.json")
