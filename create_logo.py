import math
import random
from PIL import Image, ImageDraw, ImageFilter
import os

def generate_voice_logo(size=512):
    # Create high-res image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size / 2.0
    radius = size * 0.48
    
    # Layer 1: Base diagonal sky gradient
    base = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx*dx + dy*dy)
            if dist <= radius:
                # Diagonal coordinate from bottom-left to top-right
                # t = 0 is bottom-left, t = 1 is top-right
                t = (x - y + size) / (2.0 * size)
                t = max(0.0, min(1.0, t))
                
                # Colors:
                # Deep Azure Blue: #0076fe -> #1da1f2 -> Light Sky: #e0f2fe -> White Cloud: #ffffff
                if t < 0.35:
                    f = t / 0.35
                    r = int(0 + f * (29 - 0))
                    g = int(118 + f * (161 - 118))
                    b = int(254 + f * (242 - 254))
                elif t < 0.65:
                    f = (t - 0.35) / 0.30
                    r = int(29 + f * (224 - 29))
                    g = int(161 + f * (242 - 161))
                    b = int(242 + f * (254 - 242))
                else:
                    f = (t - 0.65) / 0.35
                    r = int(224 + f * (255 - 224))
                    g = int(242 + f * (255 - 242))
                    b = int(254 + f * (255 - 254))
                
                base.putpixel((x, y), (r, g, b, 255))
    
    # Layer 2: Cloud mist & atmospheric feathered billows
    cloud_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cloud_draw = ImageDraw.Draw(cloud_layer)
    
    random.seed(42)
    for _ in range(80):
        # Place soft cloud puffs along the diagonal dividing band
        t = random.uniform(0.38, 0.72)
        offset = random.gauss(0, size * 0.08)
        
        # Position along diagonal
        cx = t * size + offset
        cy = (1.0 - t) * size + offset
        
        cradius = random.uniform(size * 0.08, size * 0.22)
        alpha = int(random.uniform(30, 90))
        
        # Cloud color: Soft white to slight warm sunlight glow
        color = (255, 255, 255, alpha) if random.random() > 0.3 else (255, 250, 235, alpha)
        
        cloud_draw.ellipse(
            (cx - cradius, cy - cradius, cx + cradius, cy + cradius),
            fill=color
        )
    
    # Gaussian blur cloud layer for soft billowy mist texture
    cloud_layer = cloud_layer.filter(ImageFilter.GaussianBlur(radius=size * 0.04))
    
    # Composite layers
    composite = Image.alpha_composite(base, cloud_layer)
    
    # Mask to perfect anti-aliased circle
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((center - radius, center - radius, center + radius, center + radius), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.2))
    
    final_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final_img.paste(composite, (0, 0), mask=mask)
    
    os.makedirs('assets', exist_ok=True)
    final_img.save('assets/voice_logo.png', 'PNG')
    print("SAVED: assets/voice_logo.png")

if __name__ == '__main__':
    generate_voice_logo(512)
