from PIL import Image, ImageDraw, ImageFont
import random
from pathlib import Path
import os

def generate_initials_avatar(name: str, output_path: Path, size: int = 400):
    """Generate an avatar image with initials"""
    # Extract initials
    name = name or "User"
    parts = name.strip().split()
    if len(parts) >= 2:
        initials = (parts[0][0] + parts[-1][0]).upper()
    elif len(parts) == 1 and parts[0]:
        initials = parts[0][:2].upper()
    else:
        initials = "U"

    # Generate random background color
    colors = [
        (30, 64, 175), # Blue 800
        (22, 163, 74), # Green 600
        (220, 38, 38), # Red 600
        (234, 88, 12), # Orange 600
        (147, 51, 234), # Purple 600
        (13, 148, 136), # Teal 600
        (79, 70, 229), # Indigo 600
        (219, 39, 119), # Pink 600
    ]
    # Deterministic color based on name
    color_index = sum(ord(c) for c in name) % len(colors)
    bg_color = colors[color_index]
    text_color = (255, 255, 255)

    # Create image
    img = Image.new('RGB', (size, size), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Load font
    font = None
    try:
        # Try some common font paths (Windows/Linux)
        font_paths = [
            "arial.ttf",
            "C:\\Windows\\Fonts\\arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/arial.ttf"
        ]
        
        font_size = int(size / 2.5)
        
        for path in font_paths:
            try:
                if os.path.exists(path) or (os.name == 'nt' and 'Windows' in path):
                    font = ImageFont.truetype(path, size=font_size)
                    break
            except:
                continue
                
        if not font:
            # Try loading by name only (works if in system path)
            try:
                font = ImageFont.truetype("arial.ttf", size=font_size)
            except:
                pass
    except:
        pass
        
    if not font:
        # Final fallback
        font = ImageFont.load_default()

    # Calculate text position
    try:
        # Pillow >= 9.2.0
        left, top, right, bottom = draw.textbbox((0, 0), initials, font=font)
        text_width = right - left
        text_height = bottom - top
        
        # Center exact
        x = (size - text_width) / 2 - left
        y = (size - text_height) / 2 - top
        
    except AttributeError:
        # Older Pillow
        text_width, text_height = draw.textsize(initials, font=font)
        x = (size - text_width) / 2
        y = (size - text_height) / 2

    # Draw text
    draw.text((x, y), initials, fill=text_color, font=font)

    # Save
    img.save(output_path, format='PNG')
    return True
