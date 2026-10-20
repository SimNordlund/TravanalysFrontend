"""Render the illustrated Swedish guide with a synchronized Swedish voiceover.

This generates media assets only; it does not build or start the website.
First create chapter WAVs with create_tool_neural_narration.py. Then run:
python scripts/create_tool_walkthrough.py --ffmpeg /path/to/ffmpeg --narration-dir /path/to/audio
Use --add-narration-only to add the voiceover to the existing video without re-encoding it.
"""

import argparse
import io
import json
import math
import shutil
import subprocess
import wave
from html import escape
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
GUIDE = json.loads((ROOT / "src/data/toolWalkthrough.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "public/videos"
WIDTH, HEIGHT, FPS = 1280, 720, 20
INDIGO, NAVY, INK, MUTED = "#4f46e5", "#17233b", "#334155", "#64748b"
WHITE, LINE, PALE = "#ffffff", "#e2e8f0", "#eef2ff"
ORANGE, ORANGE_INK = "#fff7ed", "#9a3412"
HORSE_COLORS = ["#4157e2", "#d97706", "#e14c64", "#059669", "#94a3b8", "#334155"]
HORSES = [
    {"name": "Exempelhäst A", "analys": 88, "strength": 91, "speed": 83, "form": 76},
    {"name": "Exempelhäst B", "analys": 74, "strength": 78, "speed": 71, "form": 85},
    {"name": "Exempelhäst C", "analys": 88, "strength": 68, "speed": 92, "form": 87},
    {"name": "Exempelhäst D", "analys": 62, "strength": 61, "speed": 70, "form": 58},
    {"name": "Exempelhäst E", "analys": 49, "strength": 60, "speed": 48, "form": 53},
    {"name": "Exempelhäst F", "analys": 71, "strength": 84, "speed": 69, "form": 67},
]
FONT_DIR = Path("C:/Windows/Fonts")


@lru_cache(maxsize=100)
def font(size=18, bold=False):
    return ImageFont.truetype(str(FONT_DIR / ("segoeuib.ttf" if bold else "segoeui.ttf")), size)


def text(draw, position, content, size=18, color=INK, bold=False, anchor=None):
    draw.text(position, str(content), font=font(size, bold), fill=color, anchor=anchor)


def wrapped(draw, position, content, width, size=18, color=INK, bold=False, spacing=8):
    x, y = position
    line = ""
    for word in content.split():
        candidate = f"{line} {word}".strip()
        if line and draw.textlength(candidate, font=font(size, bold)) > width:
            text(draw, (x, y), line, size, color, bold)
            y += size + spacing
            line = word
        else:
            line = candidate
    if line:
        text(draw, (x, y), line, size, color, bold)
    return y + size + spacing


def card(draw, box, fill=WHITE, border=LINE, radius=20):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=border, width=1)


def pill(draw, x, y, label, active=False, tone="indigo", width=None, size=15):
    colors = {
        "indigo": (INDIGO, "#4338ca", "#eef2ff", "#c7d2fe"),
        "sky": ("#0369a1", "#075985", "#f0f9ff", "#bae6fd"),
        "teal": ("#0f766e", "#115e59", "#f0fdfa", "#99f6e4"),
        "amber": ("#b45309", "#92400e", "#fffbeb", "#fde68a"),
    }
    accent, ink, tint, border = colors[tone]
    width = width or int(draw.textlength(label, font=font(size, True))) + 28
    card(draw, (x, y, x + width, y + 34), accent if active else tint, accent if active else border, 10)
    text(draw, (x + width / 2, y + 16), label, size, WHITE if active else ink, True, "mm")
    return width


def smooth(value):
    value = max(0, min(1, value))
    return value * value * (3 - 2 * value)


def pointer(draw, position, click=False, phase=0):
    x, y = position
    if click:
        radius = 13 + 10 * (phase % 1)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline="#a5b4fc", width=3)
    draw.polygon([(x, y), (x + 2, y + 25), (x + 8, y + 19), (x + 14, y + 30), (x + 20, y + 27), (x + 14, y + 16), (x + 24, y + 15)], fill=WHITE, outline=NAVY, width=2)


def nav(draw, active="Analys", y=192):
    x = 65
    for label in ["Analys", "Ranking", "Spel & ROI"]:
        pill(draw, x, y, label, active == label, width=252)
        x += 270


def bars(draw, box, progress=1, labels=True):
    x1, y1, x2, y2 = box
    for value in range(0, 101, 25):
        y = y2 - (y2 - y1) * value / 100
        draw.line((x1, y, x2, y), fill="#e8edf5", width=1)
        if labels:
            text(draw, (x1 - 12, y), value, 12, MUTED, anchor="rm")
    width = (x2 - x1) / 6
    for index, horse in enumerate(HORSES):
        left = x1 + width * index + width * 0.23
        right = left + width * 0.54
        top = y2 - (y2 - y1) * horse["analys"] / 100 * smooth(progress)
        draw.rounded_rectangle((left, top, right, y2), radius=7, fill=HORSE_COLORS[index])
        if labels:
            text(draw, ((left + right) / 2, top - 14), horse["analys"], 15, INK, True, "mm")
            text(draw, ((left + right) / 2, y2 + 18), str(index + 1), 14, MUTED, anchor="mm")


def radar(image, draw, center, radius, progress=1, count=2, labels=True):
    cx, cy = center
    angles = [-math.pi / 2 + i * 2 * math.pi / 7 for i in range(7)]

    def points(values, scale=1):
        return [(cx + math.cos(a) * radius * v / 100 * scale, cy + math.sin(a) * radius * v / 100 * scale) for a, v in zip(angles, values)]

    for value in [25, 50, 75, 100]:
        coords = points([value] * 7)
        draw.line(coords + [coords[0]], fill="#dce3ee", width=1)
    for x, y in points([100] * 7):
        draw.line((cx, cy, x, y), fill="#dce3ee", width=1)
    labels_text = ["Prestation", "Placering", "Skrik", "Motstånd", "Klass", "Form", "Fart"]
    if labels:
        for angle, label in zip(angles, labels_text):
            x = cx + math.cos(angle) * (radius + 35)
            y = cy + math.sin(angle) * (radius + 28)
            text(draw, (x, y), label, 14, INK, True, "mm")
    values = [[91, 79, 60, 75, 68, 76, 83], [78, 65, 83, 58, 88, 85, 71], [68, 90, 78, 88, 75, 87, 92]]
    for i in range(count):
        polygon = points(values[i], smooth(progress))
        overlay = Image.new("RGBA", image.size)
        color = tuple(int(HORSE_COLORS[i][n:n+2], 16) for n in (1, 3, 5))
        ImageDraw.Draw(overlay).polygon(polygon, fill=(*color, 24))
        image.paste(Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB"))
        draw.line(polygon + [polygon[0]], fill=HORSE_COLORS[i], width=3)
        for x, y in polygon:
            draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=WHITE, outline=HORSE_COLORS[i], width=2)


def overview(image, draw, time):
    nav(draw)
    text(draw, (70, 255), "Ett verktyg. Flera perspektiv.", 27, NAVY, True)
    boxes = [(68, 315, 319, 535), (339, 315, 590, 535), (610, 315, 861, 535)]
    for box in boxes:
        card(draw, box, "#f8faff", "#e6eaf2", 18)
    bars(draw, (91, 347, 295, 454), smooth(time / 1.2), False)
    radar(image, draw, (465, 404), 61, smooth(time / 1.2), labels=False)
    for i, length in enumerate([140, 116, 150, 96]):
        y = 352 + i * 27
        draw.rounded_rectangle((635, y, 657, y + 20), radius=5, fill=PALE)
        draw.rounded_rectangle((670, y + 5, 670 + length, y + 14), radius=4, fill="#c7d2fe" if i == 0 else "#e2e8f0")
    for x, title, subtitle in [(88, "Analys", "Läs loppet"), (359, "Hästprofil", "Jämför hästar"), (630, "Ranking & ROI", "Följ upp")]:
        text(draw, (x, 476), title, 20, NAVY, True)
        text(draw, (x, 507), subtitle, 15, MUTED)
    text(draw, (70, 563), "Samma lopp följer med mellan vyerna.", 17, MUTED)


def race(image, draw, time):
    nav(draw)
    text(draw, (70, 252), "Välj lopp", 25, NAVY, True)
    card(draw, (665, 247, 865, 289), WHITE, LINE, 11)
    text(draw, (765, 267), "Exempeldatum  >", 15, INK, True, "mm")
    rows = [
        ("BANA", ["Gävle", "Solvalla"], "sky", 1),
        ("SPELFORM", ["Vinnare", "V85"], "teal", 3),
        ("LOPP", ["Lopp 5", "Lopp 6", "Lopp 7", "Lopp 8"], "amber", 5),
        ("UNDERLAG", ["Analys", "01", "02", "03", "04"], "indigo", 7),
    ]
    for i, (label, items, tone, threshold) in enumerate(rows):
        y = 320 + i * 61
        text(draw, (70, y + 10), label, 12, MUTED, True)
        x = 215
        for j, item in enumerate(items):
            selected = (j == 3 if i == 2 else j == 0)
            width = pill(draw, x, y, item, selected and time >= threshold, tone)
            x += width + 8
    text(draw, (70, 581), "Datum  →  Bana  →  Spelform  →  Lopp", 16, MUTED)
    targets = [(750, 265), (257, 337), (267, 398), (513, 459), (260, 520)]
    segment = min(int(time / 2), 4)
    old = targets[max(0, segment - 1)]
    new = targets[segment]
    progress = smooth((time % 2) / 0.7)
    pointer(draw, (old[0] + (new[0] - old[0]) * progress, old[1] + (new[1] - old[1]) * progress), time % 2 > 0.8, time)


def analysis(image, draw, time):
    nav(draw)
    text(draw, (70, 248), "Gävle  /  Vinnare  /  Lopp 8", 16, MUTED)
    text(draw, (70, 290), "Total analys", 24, NAVY, True)
    text(draw, (70, 323), "Jämför hästarnas samlade analysvärden", 15, MUTED)
    bars(draw, (110, 383, 861, 552), time / 1.2)
    text(draw, (485, 590), "Hästnummer", 13, MUTED, anchor="mm")
    if time > 3:
        progress = smooth((time - 3) / 1.5)
        x, y = 792 - 615 * progress, 582 - 157 * progress
        if time > 5:
            card(draw, (145, 350, 465, 389), NAVY, NAVY, 10)
            text(draw, (305, 369), "1. Exempelhäst A  ·  Analys 88", 15, WHITE, True, "mm")
            draw.rounded_rectangle((135, 392, 209, 558), radius=10, outline=INDIGO, width=3)
        pointer(draw, (x, y), time > 5, time)


def profile(image, draw, time):
    nav(draw)
    text(draw, (70, 249), "Hästprofil", 25, NAVY, True)
    text(draw, (70, 283), "Sju perspektiv till en total analys", 15, MUTED)
    count = 1 if time < 4 else 2 if time < 8 else 3
    radar(image, draw, (345, 451), 113, time / 1.1, count)
    card(draw, (623, 260, 879, 587), "#fbfcff", LINE, 16)
    text(draw, (641, 278), "Jämför hästar", 18, NAVY, True)
    for index, label in enumerate(["Visa topp 3", "Visa topp 5", "Visa alla"]):
        pill(draw, 638 + index * 77, 321, label, index == (0 if time >= 8 else 2), width=72, size=10)
    for i in range(6):
        y = 378 + i * 30
        if i < count:
            card(draw, (638, y - 3, 862, y + 25), "#f1f5f9", "#f1f5f9", 7)
        draw.ellipse((648, y + 5, 658, y + 15), fill=HORSE_COLORS[i] if i < count else "#cbd5e1")
        text(draw, (670, y), f"{i+1}. {HORSES[i]['name']}", 14, INK if i < count else "#94a3b8")
    if time > 3:
        pos = (750, 415) if time < 8 else (674, 340)
        pointer(draw, pos, (4 < time < 6) or time > 8.5, time)


def ranking(image, draw, time):
    nav(draw, "Ranking")
    text(draw, (70, 246), "Ranking", 25, NAVY, True)
    text(draw, (70, 280), "Visa kolumner", 13, MUTED, True)
    x = 200
    form_center = x
    for label in ["#", "Häst", "Analys", "Prestation", "Fart", "Form"]:
        active = not (label == "Form" and time > 10)
        width = pill(draw, x, 275, label, active, size=12)
        if label == "Form":
            form_center = x + width / 2
        x += width + 6
    x, top = 65, 330
    widths = [48, 258, 112, 136, 126, 126]
    positions = [x]
    for width in widths:
        positions.append(positions[-1] + width)
    headers = ["#", "Häst", "Analys", "Prestation", "Fart", "Form"]
    card(draw, (65, top, 871, top + 252), WHITE, LINE, 12)
    for col, heading in enumerate(headers):
        if heading == "Form" and time > 10:
            continue
        label = heading + (" ↓" if (col == 3 and time > 5) or (col == 2 and time <= 5) else "")
        text(draw, (positions[col] + 12, top + 11), label, 14, INDIGO if col == 2 else MUTED, True)
    initial = sorted(range(6), key=lambda i: -HORSES[i]["analys"])
    target = sorted(range(6), key=lambda i: -HORSES[i]["strength"])
    move = smooth((time - 5) / 1)
    for index, horse in enumerate(HORSES):
        row = initial.index(index) * (1 - move) + target.index(index) * move
        y = top + 39 + row * 35
        is_top = horse["analys"] == 88
        draw.rectangle((66, y, 870, y + 34), fill=ORANGE if is_top else WHITE if int(row) % 2 else "#fafbfe")
        if is_top:
            draw.rectangle((66, y, 70, y + 34), fill="#f97316")
        values = [index + 1, horse["name"], horse["analys"], horse["strength"], horse["speed"], horse["form"]]
        for col, value in enumerate(values):
            if col == 5 and time > 10:
                continue
            color = ORANGE_INK if is_top and col < 3 else INDIGO if col == 2 else INK
            text(draw, (positions[col] + 12, y + 7), value, 15, color, is_top or col == 1)
    if time > 3:
        pointer(draw, (545, 350) if time < 10 else (form_center, 294), (5 < time < 7) or time > 10, time)


def roi(image, draw, time):
    nav(draw, "Spel & ROI")
    text(draw, (70, 248), "Spel & ROI", 25, NAVY, True)
    pill(draw, 70, 289, "Gävle", True, "sky")
    pill(draw, 160, 289, "ROI V&P", True, "teal")
    pill(draw, 285, 289, "ROI Trio", False, "teal")
    positions = [65, 105, 315, 393, 477, 565, 670, 770, 872]
    headers = ["#", "Häst", "Analys", "Placering", "ROI Lopp", "Odds Vinnare", "Odds Plats", "ROI Totalt"]
    top = 344
    card(draw, (65, top, 872, 587), WHITE, LINE, 12)
    for col, heading in enumerate(headers):
        wrapped(draw, (positions[col] + 7, top + 10), heading, positions[col + 1] - positions[col] - 12, 12, INDIGO if col == 2 else MUTED, True, 2)
    for i, horse in enumerate(HORSES):
        y = top + 48 + i * 31
        fill = PALE if i == 2 and time > 5 else WHITE if i % 2 else "#fafbfe"
        draw.rectangle((66, y, 871, y + 30), fill=fill)
        values = [i + 1, horse["name"], horse["analys"], [2, 4, 1, 6, 5, 3][i], ["−1", "−1", "3,80", "−1", "−1", "−1"][i], ["3,20", "5,60", "4,80", "9,10", "12,50", "6,20"][i], ["1,50", "2,10", "1,90", "3,20", "4,10", "2,40"][i], ["0,12", "−0,18", "0,24", "−0,32", "−0,16", "0,08"][i]]
        for col, value in enumerate(values):
            text(draw, (positions[col] + 7, y + 6), value, 13, INDIGO if col == 2 else INK, col in [1, 2])
    if time > 3:
        pointer(draw, (227, 467), time > 6, time)


def finish(image, draw, time):
    text(draw, (483, 245), "Från överblick till egen analys", 28, NAVY, True, "mm")
    for index, (title, description) in enumerate([
        ("01  Välj lopp", "Datum, bana och spelform"),
        ("02  Jämför hästar", "Analys, hästprofil och ranking"),
        ("03  Följ upp", "Resultat, odds och ROI"),
    ]):
        y = 295 + index * 72
        card(draw, (100, y, 830, y + 57), "#f8faff", "#e0e7ff", 12)
        text(draw, (121, y + 16), title, 18, INDIGO, True)
        text(draw, (372, y + 18), description, 16, MUTED)
    card(draw, (264, 536, 666, 582), INDIGO, INDIGO, 12)
    text(draw, (465, 558), "Öppna Analys på sidan  →", 18, WHITE, True, "mm")


RENDERERS = [overview, race, analysis, profile, ranking, roi, finish]


def background():
    y, x = np.mgrid[0:HEIGHT, 0:WIDTH]
    glow = np.exp(-((x - 100) ** 2 / 430000 + (y - 40) ** 2 / 200000))
    rgb = np.empty((HEIGHT, WIDTH, 3), dtype=np.uint8)
    for channel, (base, tint) in enumerate([(248, 235), (250, 239), (253, 255)]):
        rgb[:, :, channel] = base + (tint - base) * glow
    return Image.fromarray(rgb)


BACKGROUND = background()


def render_frame(second):
    index = next((i for i, chapter in enumerate(GUIDE["chapters"]) if second < chapter["end"]), 6)
    chapter = GUIDE["chapters"][index]
    image = BACKGROUND.copy()
    draw = ImageDraw.Draw(image)
    for i, height in enumerate([10, 17, 25]):
        draw.rounded_rectangle((40 + i * 10, 48 - height, 46 + i * 10, 48), radius=2, fill=INDIGO)
    text(draw, (82, 25), "travanalys.se", 22, NAVY, True)
    text(draw, (911, 34), "SÅ FUNGERAR DET", 12, MUTED, True)
    pill(draw, 1090, 22, "EXEMPELDATA", False, "amber", width=150, size=12)
    text(draw, (40, 78), chapter["heading"], 33, NAVY, True)
    text(draw, (40, 125), chapter["description"], 18, MUTED)
    card(draw, (40, 174, 905, 618), border="#e6eaf2", radius=24)
    card(draw, (930, 174, 1240, 618), border="#e0e7ff", radius=24)
    text(draw, (954, 198), f"STEG {index+1:02d} / 07", 12, INDIGO, True)
    next_y = wrapped(draw, (954, 236), chapter["title"], 260, 25, NAVY, True, 7)
    wrapped(draw, (954, next_y + 22), chapter["instruction"], 259, 18, MUTED, spacing=10)
    card(draw, (954, 562, 1216, 596), "#f8faff", "#eef2ff", 9)
    text(draw, (1085, 578), "Illustrerad guide · Svensk text", 12, INDIGO, anchor="mm")
    RENDERERS[index](image, draw, second - chapter["start"])
    draw.rounded_rectangle((40, 644, 1240, 649), radius=2, fill="#dfe5f0")
    progress = max(1, 1200 * second / GUIDE["duration"])
    draw.rounded_rectangle((40, 644, 40 + progress, 649), radius=2, fill=INDIGO)
    for i, item in enumerate(GUIDE["chapters"]):
        text(draw, (40 + i * 174, 661), item["title"], 13, INDIGO if i == index else MUTED, i == index)
    text(draw, (40, 696), "Illustration av verktyget med exempeldata. Värdena är inte aktuella loppresultat.", 12, MUTED)
    duration = GUIDE["duration"]
    text(draw, (1240, 696), f"{int(second)//60}:{int(second)%60:02d} / {duration//60}:{duration%60:02d}", 12, MUTED, anchor="ra")
    return image


def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    hours, milliseconds = divmod(milliseconds, 3600000)
    minutes, milliseconds = divmod(milliseconds, 60000)
    seconds, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"


def write_assets(preview_dir=None, narration_dir=None):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    render_frame(5).save(OUTPUT / "travanalys-guide-poster.jpg", quality=93, optimize=True)
    cues = ["WEBVTT", ""]
    for chapter in GUIDE["chapters"]:
        boundaries = narration_dir / f"{chapter['id']}.boundaries.jsonl" if narration_dir else None
        if boundaries and boundaries.is_file():
            for line in boundaries.read_text(encoding="utf-8").splitlines():
                event = json.loads(line)
                if event.get("type") != "SentenceBoundary":
                    continue
                start = chapter["start"] + 0.25 + event["offset"] / 10000000
                end = min(start + event["duration"] / 10000000, chapter["end"] - 0.1)
                if end > start:
                    cues.extend([f"{timestamp(start)} --> {timestamp(end)}", escape(event["text"]), ""])
            continue
        spoken_text = chapter.get("narration", chapter["instruction"])
        cues.extend([f"{timestamp(chapter['start'])} --> {timestamp(chapter['end'])}", escape(spoken_text), ""])
    (OUTPUT / "travanalys-guide.sv.vtt").write_text("\n".join(cues) + "\n", encoding="utf-8")
    if preview_dir:
        preview_dir.mkdir(parents=True, exist_ok=True)
        sheet = Image.new("RGB", (1280, 1440), "#e2e8f0")
        for i, chapter in enumerate(GUIDE["chapters"]):
            frame = render_frame(chapter["start"] + min(8, chapter["end"] - chapter["start"] - 1))
            frame.save(preview_dir / f"{i+1:02d}-{chapter['id']}.png")
            sheet.paste(frame.resize((640, 360), Image.Resampling.LANCZOS), ((i % 2) * 640, (i // 2) * 360))
        sheet.save(preview_dir / "contact-sheet.jpg", quality=94)


def prepare_narration(ffmpeg, narration_dir):
    sample_rate = 24000
    combined = np.zeros(GUIDE["duration"] * sample_rate, dtype="<i2")
    for chapter in GUIDE["chapters"]:
        source = narration_dir / f"{chapter['id']}.wav"
        if not source.is_file():
            raise FileNotFoundError(f"Berättarröst saknas: {source}")
        with wave.open(str(source), "rb") as audio:
            speech_duration = audio.getnframes() / audio.getframerate()
        available = chapter["end"] - chapter["start"] - 0.6
        if speech_duration > available:
            raise ValueError(f"Talmanuset för {chapter['title']} är för långt. Korta texten eller förläng kapitlet; rösten snabbas inte upp.")
        fitted = narration_dir / f"{chapter['id']}-fitted.wav"
        subprocess.run([
            ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(source),
            "-af", f"afade=t=in:d=0.008,afade=t=out:st={max(0, speech_duration - 0.008):.6f}:d=0.008",
            "-ac", "1", "-ar", str(sample_rate),
            "-c:a", "pcm_s16le", str(fitted),
        ], check=True)
        with wave.open(str(fitted), "rb") as audio:
            speech = np.frombuffer(audio.readframes(audio.getnframes()), dtype="<i2")
        start_sample = round((chapter["start"] + 0.25) * sample_rate)
        if len(speech) > round(available * sample_rate) + round(sample_rate * 0.1):
            raise ValueError(f"Berättarrösten för {chapter['title']} ryms inte i kapitlet.")
        combined[start_sample:start_sample + len(speech)] = speech
        print(f"Synkad röst: {chapter['title']} ({len(speech)/sample_rate:.1f} sek)", flush=True)
    destination = narration_dir / "narration.wav"
    with wave.open(str(destination), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(sample_rate)
        audio.writeframes(combined.tobytes())
    return destination


def audio_options():
    return ["-c:a", "libopus", "-b:a", "96k", "-af", "loudnorm=I=-16:TP=-1.5:LRA=7"]


def add_narration(ffmpeg, narration):
    destination = OUTPUT / "travanalys-guide.webm"
    temporary = OUTPUT / "travanalys-guide-with-voice.webm"
    if not destination.is_file():
        raise FileNotFoundError("Skapa videon innan du använder --add-narration-only")
    subprocess.run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(destination),
        "-i", str(narration), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        *audio_options(), "-t", str(GUIDE["duration"]), str(temporary),
    ], check=True)
    temporary.replace(destination)
    print(f"Videon har nu svensk berättarröst: {destination}", flush=True)


def encode(ffmpeg, narration=None):
    destination = OUTPUT / "travanalys-guide.webm"
    command = [ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "pipe:0"]
    if narration:
        command += ["-i", str(narration), "-map", "0:v:0", "-map", "1:a:0", *audio_options()]
    else:
        command += ["-an"]
    command += ["-c:v", "libvpx", "-b:v", "1500k", "-crf", "12", "-deadline", "realtime", "-cpu-used", "4", "-threads", "4", "-g", "60", "-pix_fmt", "yuv420p", "-t", str(GUIDE["duration"]), str(destination)]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for frame_number in range(GUIDE["duration"] * FPS):
            frame = render_frame(frame_number / FPS)
            buffer = io.BytesIO()
            frame.save(buffer, format="JPEG", quality=95, subsampling=0)
            process.stdin.write(buffer.getvalue())
            if frame_number % (FPS * 10) == 0:
                print(f"Video: {frame_number//FPS} / {GUIDE['duration']} sek", flush=True)
        process.stdin.close()
        if process.wait() != 0:
            raise RuntimeError("FFmpeg kunde inte skapa videon")
    except BaseException:
        if process.stdin and not process.stdin.closed:
            process.stdin.close()
        if process.poll() is None:
            process.terminate()
        process.wait()
        raise
    print(f"Skapad: {destination} ({destination.stat().st_size / 1024 / 1024:.1f} MB)", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"))
    parser.add_argument("--font-dir", type=Path, default=FONT_DIR)
    parser.add_argument("--preview-dir", type=Path)
    parser.add_argument("--stills-only", action="store_true")
    parser.add_argument("--narration-dir", type=Path)
    parser.add_argument("--add-narration-only", action="store_true")
    parser.add_argument("--silent", action="store_true", help="Skapa uttryckligen en version utan berättarröst")
    args = parser.parse_args()
    FONT_DIR = args.font_dir
    if args.stills_only:
        write_assets(args.preview_dir, args.narration_dir)
    else:
        if not args.ffmpeg:
            parser.error("Ange --ffmpeg med sökvägen till FFmpeg")
        if not args.narration_dir and not args.silent:
            parser.error("Ange --narration-dir eller välj uttryckligen --silent")
        if args.add_narration_only and not args.narration_dir:
            parser.error("--add-narration-only behöver --narration-dir")
        narration = prepare_narration(args.ffmpeg, args.narration_dir) if args.narration_dir else None
        if args.add_narration_only:
            add_narration(args.ffmpeg, narration)
        else:
            encode(args.ffmpeg, narration)
        write_assets(args.preview_dir, args.narration_dir)
