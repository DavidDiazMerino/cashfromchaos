from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
BG = (7, 10, 18)
PANEL = (14, 21, 36)
TEXT = (239, 246, 255)
MUTED = (156, 171, 196)
GREEN = (52, 211, 153)
CYAN = (80, 210, 255)
PURPLE = (124, 92, 255)
YELLOW = (249, 200, 79)
STRIPE = (99, 91, 255)
NVIDIA = (118, 185, 0)
HERMES = (255, 210, 120)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def font(size: int, bold: bool = False, mono: bool = False):
    return ImageFont.truetype(FONT_MONO if mono else (FONT_BOLD if bold else FONT_REG), size)


def size(d: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont):
    b = d.textbbox((0, 0), text, font=f)
    return b[2] - b[0], b[3] - b[1]


def bg() -> Image.Image:
    img = Image.new("RGBA", (W, H), BG + (255,))
    pix = img.load(); assert pix is not None
    for y in range(H):
        for x in range(W):
            dx = (x - W * .72) / W; dy = (y - H * .18) / H
            g1 = max(0, 1 - math.sqrt(dx*dx + dy*dy) * 2.0)
            dx2 = (x - W * .20) / W; dy2 = (y - H * .88) / H
            g2 = max(0, 1 - math.sqrt(dx2*dx2 + dy2*dy2) * 1.7)
            pix[x, y] = (
                int(BG[0] + g1 * 28 + g2 * 8),
                int(BG[1] + g1 * 17 + g2 * 45),
                int(BG[2] + g1 * 70 + g2 * 40),
                255,
            )
    d = ImageDraw.Draw(img)
    for x in range(0, W, 54):
        d.line((x, 0, x, H), fill=(255, 255, 255, 12), width=1)
    for y in range(0, H, 54):
        d.line((0, y, W, y), fill=(255, 255, 255, 12), width=1)
    return img


def glow_rect(img: Image.Image, xy, r: int, outline, fill=PANEL, width=3):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle(xy, radius=r, outline=outline + (165,), width=8)
    layer = layer.filter(ImageFilter.GaussianBlur(16))
    img.alpha_composite(layer)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(xy, radius=r, fill=fill + (238,), outline=outline + (255,), width=width)


def centered(d, y: int, text: str, f, fill=TEXT):
    tw, _ = size(d, text, f)
    d.text(((W - tw) / 2, y), text, font=f, fill=fill + (255,))


def node(img: Image.Image, x: int, y: int, w: int, h: int, title: str, subtitle: str, bullets: list[str], accent):
    d = ImageDraw.Draw(img)
    glow_rect(img, (x, y, x+w, y+h), 34, accent)
    d.ellipse((x+30, y+34, x+58, y+62), fill=accent + (255,))
    d.text((x+78, y+24), title, font=font(36, True), fill=TEXT + (255,))
    d.text((x+78, y+72), subtitle, font=font(23), fill=MUTED + (255,))
    yy = y + 122
    for b in bullets:
        d.text((x+42, yy), "•", font=font(28, True), fill=accent + (255,))
        d.text((x+78, yy), b, font=font(25), fill=(216, 226, 240, 255))
        yy += 42


def arrow(d: ImageDraw.ImageDraw, start, end, color):
    x1, y1 = start; x2, y2 = end
    d.line((x1, y1, x2, y2), fill=color + (235,), width=6)
    ang = math.atan2(y2-y1, x2-x1); s = 18
    pts = [(x2, y2), (x2 - s*math.cos(ang-math.pi/6), y2 - s*math.sin(ang-math.pi/6)), (x2 - s*math.cos(ang+math.pi/6), y2 - s*math.sin(ang+math.pi/6))]
    d.polygon(pts, fill=color + (255,))


def pill(d, x, y, label, color, fs=30):
    f = font(fs, True)
    tw, _ = size(d, label, f)
    d.rounded_rectangle((x, y, x + tw + 42, y + 58), radius=29, fill=(13, 18, 30, 238), outline=color + (255,), width=2)
    d.text((x+21, y+13), label, font=f, fill=TEXT + (255,))
    return x + tw + 62


def save_architecture():
    img = bg(); d = ImageDraw.Draw(img)
    centered(d, 92, "CashFromChaos", font(68, True))
    centered(d, 176, "simple architecture used in the demo", font(29), MUTED)

    node(img, 90, 300, 900, 210, "Seller / phone", "photo + one-line clue", ["the user says: I don’t want this", "minimal intake, no long form"], GREEN)
    node(img, 90, 610, 900, 245, "Next.js demo app", "App Router · TypeScript · Tailwind", ["intake, dashboard, item view", "buyer marketplace sandbox", "in-memory demo store"], CYAN)
    node(img, 90, 955, 900, 245, "Hermes Operator", "core agent runtime", ["analyzes item and prices it", "chooses marketplace route", "negotiates under policy"], PURPLE)
    node(img, 90, 1300, 900, 210, "Stripe payment flow", "test-mode or simulated held payment", ["buyer checkout", "release payout after delivery"], STRIPE)

    # Policy rail: deliberately simple and visible.
    glow_rect(img, (130, 1592, 950, 1710), 34, GREEN, (11, 28, 25), 3)
    centered(d, 1618, "Policy layer", font(34, True), TEXT)
    centered(d, 1664, "floor price · allowed channels · max spend · escalation", font(23), (213, 246, 235))

    arrow(d, (540, 510), (540, 610), CYAN)
    arrow(d, (540, 855), (540, 955), PURPLE)
    arrow(d, (540, 1200), (540, 1300), STRIPE)
    arrow(d, (540, 1510), (540, 1592), GREEN)

    centered(d, 1808, "Physical item → autonomous sale → held payment → payout", font(25), MUTED)
    out = OUT / "cashfromchaos-architecture-vertical.png"
    img.convert("RGB").save(out, quality=96)
    return out


def save_closing_card():
    img = bg(); d = ImageDraw.Draw(img)
    # ambient rings
    ring = Image.new("RGBA", img.size, (0,0,0,0)); rd = ImageDraw.Draw(ring)
    for r, col, a in [(420, GREEN, 70), (305, STRIPE, 55), (190, CYAN, 42)]:
        rd.ellipse((W//2-r, 670-r, W//2+r, 670+r), outline=col + (a,), width=5)
    img.alpha_composite(ring.filter(ImageFilter.GaussianBlur(2)))

    centered(d, 470, "CashFromChaos", font(78, True))
    centered(d, 575, "Point your camera at things", font(34), (205, 216, 235))
    centered(d, 622, "you don’t want.", font(34), (205, 216, 235))
    centered(d, 682, "Hermes sells them.", font(42, True), GREEN)

    glow_rect(img, (86, 850, 994, 1118), 42, GREEN, (13, 20, 35), 3)
    centered(d, 900, "github.com/DavidDiazMerino/cashfromchaos", font(28, False, True), (220, 255, 239))
    centered(d, 984, "X / Twitter: @davddiazm", font(31, False, True), (221, 225, 255))

    start_x = 186
    x = pill(d, start_x, 1260, "HERMES", HERMES, 29)
    x = pill(d, x + 22, 1260, "NVIDIA", NVIDIA, 29)
    pill(d, x + 22, 1260, "stripe", STRIPE, 29)

    centered(d, 1510, "Autonomous recommerce operator", font(31, True), TEXT)
    centered(d, 1560, "Hermes Agent Accelerated Business Hackathon", font(25), MUTED)

    out = OUT / "cashfromchaos-closing-card-vertical.png"
    img.convert("RGB").save(out, quality=96)
    return out


def save_svgs():
    # Editable compact SVG companions for README/repo use. PNGs are the video renders.
    arch = '''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="#070a12"/><text x="540" y="150" text-anchor="middle" fill="#eff6ff" font-size="68" font-weight="700" font-family="DejaVu Sans">CashFromChaos</text><text x="540" y="205" text-anchor="middle" fill="#9cabc4" font-size="29" font-family="DejaVu Sans">simple architecture used in the demo</text><g font-family="DejaVu Sans"><rect x="90" y="300" width="900" height="210" rx="34" fill="#0e1524" stroke="#34d399" stroke-width="3"/><text x="168" y="360" fill="#eff6ff" font-size="36" font-weight="700">Seller / phone</text><text x="168" y="408" fill="#9cabc4" font-size="23">photo + one-line clue</text><rect x="90" y="610" width="900" height="245" rx="34" fill="#0e1524" stroke="#50d2ff" stroke-width="3"/><text x="168" y="670" fill="#eff6ff" font-size="36" font-weight="700">Next.js demo app</text><text x="168" y="718" fill="#9cabc4" font-size="23">App Router · TypeScript · Tailwind</text><rect x="90" y="955" width="900" height="245" rx="34" fill="#0e1524" stroke="#7c5cff" stroke-width="3"/><text x="168" y="1015" fill="#eff6ff" font-size="36" font-weight="700">Hermes Operator</text><text x="168" y="1063" fill="#9cabc4" font-size="23">core agent runtime</text><rect x="90" y="1300" width="900" height="210" rx="34" fill="#0e1524" stroke="#635bff" stroke-width="3"/><text x="168" y="1360" fill="#eff6ff" font-size="36" font-weight="700">Stripe payment flow</text><text x="168" y="1408" fill="#9cabc4" font-size="23">test-mode or simulated held payment</text><rect x="130" y="1592" width="820" height="118" rx="34" fill="#0b1c19" stroke="#34d399" stroke-width="3"/><text x="540" y="1654" text-anchor="middle" fill="#eff6ff" font-size="34" font-weight="700">Policy layer</text><text x="540" y="1696" text-anchor="middle" fill="#d5f6eb" font-size="23">floor price · allowed channels · max spend · escalation</text></g></svg>'''
    close = '''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="#070a12"/><circle cx="540" cy="670" r="420" fill="none" stroke="#34d399" opacity=".32" stroke-width="5"/><circle cx="540" cy="670" r="305" fill="none" stroke="#635bff" opacity=".28" stroke-width="5"/><text x="540" y="545" text-anchor="middle" fill="#eff6ff" font-size="78" font-weight="700" font-family="DejaVu Sans">CashFromChaos</text><text x="540" y="618" text-anchor="middle" fill="#cdd8eb" font-size="34" font-family="DejaVu Sans">Point your camera at things</text><text x="540" y="665" text-anchor="middle" fill="#cdd8eb" font-size="34" font-family="DejaVu Sans">you don’t want.</text><text x="540" y="735" text-anchor="middle" fill="#34d399" font-size="42" font-weight="700" font-family="DejaVu Sans">Hermes sells them.</text><rect x="86" y="850" width="908" height="268" rx="42" fill="#0d1423" stroke="#34d399" stroke-width="3"/><text x="540" y="932" text-anchor="middle" fill="#dcffef" font-size="28" font-family="DejaVu Sans Mono">github.com/DavidDiazMerino/cashfromchaos</text><text x="540" y="1017" text-anchor="middle" fill="#dde1ff" font-size="31" font-family="DejaVu Sans Mono">X / Twitter: @davddiazm</text><g font-family="DejaVu Sans" font-size="29" font-weight="700" fill="#eff6ff"><rect x="186" y="1260" width="171" height="58" rx="29" fill="#0d121e" stroke="#ffd278" stroke-width="2"/><text x="271" y="1298" text-anchor="middle">HERMES</text><rect x="403" y="1260" width="171" height="58" rx="29" fill="#0d121e" stroke="#76b900" stroke-width="2"/><text x="489" y="1298" text-anchor="middle">NVIDIA</text><rect x="620" y="1260" width="135" height="58" rx="29" fill="#0d121e" stroke="#635bff" stroke-width="2"/><text x="688" y="1298" text-anchor="middle">stripe</text></g><text x="540" y="1545" text-anchor="middle" fill="#eff6ff" font-size="31" font-weight="700" font-family="DejaVu Sans">Autonomous recommerce operator</text><text x="540" y="1595" text-anchor="middle" fill="#9cabc4" font-size="25" font-family="DejaVu Sans">Hermes Agent Accelerated Business Hackathon</text></svg>'''
    (OUT / "cashfromchaos-architecture-vertical.svg").write_text(arch, encoding="utf-8")
    (OUT / "cashfromchaos-closing-card-vertical.svg").write_text(close, encoding="utf-8")


if __name__ == "__main__":
    print(save_architecture())
    print(save_closing_card())
    save_svgs()
    print(OUT / "cashfromchaos-architecture-vertical.svg")
    print(OUT / "cashfromchaos-closing-card-vertical.svg")
