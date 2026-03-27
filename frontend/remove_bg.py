"""
Remove background from Baymax images using flood-fill from corners.
Works well for images where the background is a light/checkered color
surrounding a cartoon character.
"""
from PIL import Image
import os
from collections import deque

def flood_fill_transparent(img_rgba, start_pixels, tolerance=40):
    """Flood-fill from given start pixels, making similar-colored regions transparent."""
    width, height = img_rgba.size
    pixels = img_rgba.load()
    visited = set()
    queue = deque(start_pixels)

    # Seed color = average of corner pixels
    corner_colors = [pixels[p] for p in start_pixels if pixels[p][3] > 0]
    if not corner_colors:
        return
    seed_r = sum(c[0] for c in corner_colors) // len(corner_colors)
    seed_g = sum(c[1] for c in corner_colors) // len(corner_colors)
    seed_b = sum(c[2] for c in corner_colors) // len(corner_colors)

    def color_close(c, tol):
        if c[3] == 0:  # already transparent
            return True
        return (abs(int(c[0]) - seed_r) +
                abs(int(c[1]) - seed_g) +
                abs(int(c[2]) - seed_b)) <= tol * 3

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        visited.add((x, y))
        pixel = pixels[x, y]
        if not color_close(pixel, tolerance):
            continue
        # Make transparent
        pixels[x, y] = (pixel[0], pixel[1], pixel[2], 0)
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x+dx, y+dy
            if (nx, ny) not in visited:
                queue.append((nx, ny))

def remove_bg(input_path, output_path, tolerance=45):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size

    # Start from all 4 corners and all edge pixels
    start_pixels = []
    # Corners
    for px, py in [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]:
        start_pixels.append((px, py))
    # Also add top/bottom edge pixels every 5 pixels
    for x in range(0, w, 5):
        start_pixels.append((x, 0))
        start_pixels.append((x, h-1))
    for y in range(0, h, 5):
        start_pixels.append((0, y))
        start_pixels.append((w-1, y))

    flood_fill_transparent(img, start_pixels, tolerance=tolerance)
    img.save(output_path, "PNG")
    print(f"  Saved: {output_path}")

images_dir = r"C:\Users\Harsh Pawar\Desktop\baymax\frontend\public\images"
images = ["baymax_wave.png", "baymax_stand.png", "baymax_armor.png", "baymax_friendly.png"]

print("Removing backgrounds from Baymax images...")
for name in images:
    path = os.path.join(images_dir, name)
    if os.path.exists(path):
        try:
            remove_bg(path, path, tolerance=50)
            print(f"  ✓ {name}")
        except Exception as e:
            print(f"  ✗ {name}: {e}")
    else:
        print(f"  ✗ Not found: {name}")

print("\nDone!")
