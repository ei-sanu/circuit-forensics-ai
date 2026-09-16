import os
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (scaled by 2x for ultra-sharp presentation rendering)
SCALE = 2
WIDTH, HEIGHT = 920 * SCALE, 740 * SCALE

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
DARK_TEXT = (15, 23, 42)

# Create image
img = Image.new("RGBA", (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Try loading fonts
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18 * SCALE)
    font_h2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 16 * SCALE)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15 * SCALE)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 14 * SCALE)
    font_emoji = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 30 * SCALE)
except Exception:
    font_title = font_h2 = font_bold = font_sub = ImageFont.load_default()

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def draw_card(box, fill_hex, stroke_hex, stroke_width, radius=12):
    x1, y1, w, h = box
    x1 *= SCALE
    y1 *= SCALE
    x2 = x1 + w * SCALE
    y2 = y1 + h * SCALE
    fill = hex_to_rgb(fill_hex)
    stroke = hex_to_rgb(stroke_hex)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius * SCALE, fill=fill, outline=stroke, width=int(stroke_width * SCALE))

def draw_text_centered(box, text, font, fill_hex):
    x1, y1, w, h = box
    cx = (x1 + w / 2) * SCALE
    cy = (y1 + h / 2) * SCALE
    fill = hex_to_rgb(fill_hex)
    lines = text.split('\n')
    line_height = font.size + 4 * SCALE
    total_h = len(lines) * line_height
    start_y = cy - total_h / 2
    for i, line in enumerate(lines):
        bbox = font.getbbox(line)
        lw = bbox[2] - bbox[0]
        lx = cx - lw / 2
        ly = start_y + i * line_height
        draw.text((lx, ly), line, font=font, fill=fill)

def draw_bold_arrow(start_pt, end_pt, color_hex="#000000", width=5):
    sx, sy = start_pt[0] * SCALE, start_pt[1] * SCALE
    ex, ey = end_pt[0] * SCALE, end_pt[1] * SCALE
    color = hex_to_rgb(color_hex)
    w = int(width * SCALE)
    draw.line([(sx, sy), (ex, ey)], fill=color, width=w)
    
    # Arrow head
    import math
    angle = math.atan2(ey - sy, ex - sx)
    arrow_len = 14 * SCALE
    arrow_width = 8 * SCALE
    p1 = (ex, ey)
    p2 = (ex - arrow_len * math.cos(angle - 0.4), ey - arrow_len * math.sin(angle - 0.4))
    p3 = (ex - arrow_len * math.cos(angle + 0.4), ey - arrow_len * math.sin(angle + 0.4))
    draw.polygon([p1, p2, p3], fill=color)

# ================= DRAW WIRING FIRST (SO CARDS SIT ON TOP) =================
# 1. Top App -> Dashboard
draw_bold_arrow((465, 70), (465, 90))
# 2. Dashboard <-> Analytics
draw_bold_arrow((290, 150), (270, 150))
# 3. Dashboard <-> Security
draw_bold_arrow((640, 125), (660, 125))
# 4. Dashboard -> Email
draw_bold_arrow((640, 205), (660, 205))
# 5. Analytics -> Comms
draw_bold_arrow((142, 225), (142, 245))
# 6. Comms -> Data Layer
draw_bold_arrow((142, 335), (142, 355))
# 7. Dashboard -> Guidance Platform
draw_bold_arrow((465, 245), (465, 265))
# 8. Guidance Platform <-> Data Layer
draw_bold_arrow((290, 342), (270, 440))
# 9. Guidance Platform -> AI Engine
draw_bold_arrow((465, 420), (465, 440))
# 10. External Data -> AI Engine
draw_bold_arrow((660, 580), (640, 580))
# 11. External Data -> Dashboard (Orthogonal)
# draw orthogonal path
sx, sy = 660 * SCALE, 305 * SCALE
ex, ey = 640 * SCALE, 225 * SCALE
draw.line([(sx, sy), (650 * SCALE, sy), (650 * SCALE, ey), (ex, ey)], fill=BLACK, width=int(5 * SCALE))
draw_bold_arrow((650 / SCALE, 225), (640, 225))

# ================= TOP APPLICATION =================
draw_card((290, 10, 350, 60), "#EFF6FF", "#1D4ED8", 3.5, 14)
draw_text_centered((290, 10, 350, 60), "Web-Based Investigative Application\n(Next.js 14 Web Portal • Port 8080 • Station PC)", font_h2, "#1E3A8A")

# ================= CENTER: DASHBOARD =================
draw_card((290, 90, 350, 155), "#FAF5FF", "#7C3AED", 3.5, 12)
draw_text_centered((290, 93, 350, 28), "Web Portal & Intelligence Dashboard", font_title, "#5B21B6")
draw_card((300, 126, 102, 74), "#DBEAFE", "#2563EB", 2.5, 12)
draw_text_centered((300, 126, 102, 74), "Case Portal\n(Active FIRs)", font_bold, "#1E40AF")
draw_card((414, 126, 102, 74), "#D1FAE5", "#059669", 2.5, 12)
draw_text_centered((414, 126, 102, 74), "Entity Search\n(Cross-Station)", font_bold, "#065F46")
draw_card((528, 126, 102, 74), "#FEF3C7", "#D97706", 2.5, 12)
draw_text_centered((528, 126, 102, 74), "Graph View\n(Topology)", font_bold, "#92400E")
draw_text_centered((290, 206, 350, 30), "Role-Based Crime Analytics & Topology Explorer", font_bold, "#6D28D9")

# ================= CENTER: GUIDANCE PLATFORM =================
draw_card((290, 265, 350, 155), "#FEFCE8", "#CA8A04", 3.5, 12)
draw_text_centered((290, 270, 350, 28), "Personalized Guidance Platform", font_title, "#713F12")
draw_text_centered((290, 300, 350, 50), "Investigator & Officer Workspace", font_bold, "#854D0E")
draw_card((305, 358, 320, 48), "#10B981", "#059669", 2.5, 20)
draw_text_centered((305, 358, 320, 48), "Investigator Support Interface", font_h2, "#FFFFFF")

# ================= CENTER: AI ENGINE =================
draw_card((290, 440, 350, 290), "#FFF7ED", "#EA580C", 3.5, 12)
draw_text_centered((290, 446, 350, 30), "AI Recommendation Engine", font_title, "#9A3412")
draw_text_centered((290, 474, 350, 24), "Investigation & Graph Intelligence Profiling", font_bold, "#C2410C")
pills = [
    (508, "Case Suggestion Engine (Prioritization)"),
    (562, "24/7 Forensic & Statutory Law Advisor"),
    (616, "Anomaly & Modus Operandi Pattern Mapping"),
    (670, "Syndicate Graph Network Mapping")
]
for py, ptxt in pills:
    draw_card((305, py, 320, 46), "#FFEDD5", "#F97316", 2.5, 18)
    draw_text_centered((305, py, 320, 46), ptxt, font_bold, "#9A3412")

# ================= LEFT COLUMN =================
# Analytics
draw_card((15, 90, 255, 135), "#FFF1F2", "#E11D48", 3.5, 12)
draw_text_centered((15, 95, 255, 26), "Analytics & Monitoring", font_title, "#9F1239")
draw_card((25, 126, 112, 85), "#FFE4E6", "#E11D48", 2.5, 14)
draw_text_centered((25, 126, 112, 85), "User Activity\nTracking", font_bold, "#881337")
draw_card((147, 126, 112, 85), "#FFE4E6", "#E11D48", 2.5, 14)
draw_text_centered((147, 126, 112, 85), "Performance\nDashboard", font_bold, "#881337")

# Comms
draw_card((15, 245, 255, 90), "#EFF6FF", "#2563EB", 3.5, 12)
draw_text_centered((15, 250, 255, 24), "Communication Services", font_title, "#1E40AF")
draw_card((25, 278, 235, 46), "#DBEAFE", "#2563EB", 2.5, 16)
draw_text_centered((25, 278, 235, 46), "SMS & Station Dispatch Alert", font_bold, "#1E3A8A")

# Data Management Layer
draw_card((15, 355, 255, 375), "#F0F9FF", "#0284C7", 3.5, 12)
draw_text_centered((15, 360, 255, 26), "Data Management Layer", font_title, "#0369A1")
draw_card((25, 394, 112, 88), "#BAE6FD", "#0284C7", 2.5, 12)
draw_text_centered((25, 394, 112, 88), "PostgreSQL\nMaster DB", font_bold, "#0C4A6E")
draw_card((147, 394, 112, 88), "#BAE6FD", "#0284C7", 2.5, 12)
draw_text_centered((147, 394, 112, 88), "SQLite Offline\nEdge Sync", font_bold, "#0C4A6E")
draw_card((25, 494, 235, 68), "#E0F2FE", "#0284C7", 2.5, 12)
draw_text_centered((25, 494, 235, 68), "Police FIR Case Catalog\n(Colleges, Universities & Stations)", font_bold, "#0369A1")
draw_card((25, 574, 235, 62), "#E0F2FE", "#0284C7", 2.5, 12)
draw_text_centered((25, 574, 235, 62), "Encrypted Audit Trails\n(AES-256 Merkle Chain)", font_bold, "#0369A1")
draw_card((25, 646, 235, 70), "#FEF08A", "#CA8A04", 2.5, 16)
draw_text_centered((25, 646, 235, 70), "FEEDBACK & AUDIT TRAILS\n(Inspector Digital Sign-Off)", font_bold, "#854D0E")

# ================= RIGHT COLUMN =================
# Security
draw_card((660, 90, 245, 75), "#2563EB", "#1E40AF", 3.0, 14)
draw_text_centered((660, 90, 245, 75), "Blockchain & Biometric\nSecurity Vault (SHA-256)", font_bold, "#FFFFFF")

# Email
draw_card((660, 175, 245, 65), "#374151", "#1F2937", 2.5, 14)
draw_text_centered((660, 175, 245, 65), "E-Mail & Station Alert Dispatch\n(Priority Crime Escalation)", font_bold, "#FFFFFF")

# External Data Integration
draw_card((660, 260, 245, 470), "#F0FDF4", "#059669", 3.5, 12)
draw_text_centered((660, 266, 245, 26), "External Data Integration", font_title, "#065F46")
ext_cards = [
    (300, "Government Directory\n(CCTNS Police FIR Records)", "#EFF6FF", "#2563EB", "#1E40AF"),
    (378, "Industry & Court Registry\n(ICJS Inter-Agency Network)", "#F0FDF4", "#059669", "#065F46"),
    (456, "Telecom & Station APIs\n(TAFCOP CDR & Tower Feeds)", "#FFFBEB", "#D97706", "#92400E"),
    (534, "FIU-IND Banking Trails\n(RTGS / Mule Account Graph)", "#FAF5FF", "#7C3AED", "#5B21B6")
]
for cy, ctxt, cfill, cstroke, ccolor in ext_cards:
    draw_card((670, cy, 225, 68), cfill, cstroke, 2.5, 12)
    draw_text_centered((670, cy, 225, 68), ctxt, font_bold, ccolor)

draw_card((670, 616, 225, 102), "#DCFCE7", "#16A34A", 3.0, 20)
draw_text_centered((670, 616, 225, 102), "Sec 63 BSA 2023 Certified\nCryptographically Signed\nCourt-Admissible Evidence", font_bold, "#15803D")

# Save high-res image
out_path = "/Users/somesh/Projects/CIRCUIT-2.0/CIRCUIT_Technical_Approach_Architecture.png"
img.save(out_path, "PNG", dpi=(300, 300))
print(f"Generated high-res diagram: {out_path} ({img.size[0]}x{img.size[1]})")
