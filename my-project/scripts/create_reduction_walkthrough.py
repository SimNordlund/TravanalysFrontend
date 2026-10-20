"""Create the illustrated reduction guide using the existing video authoring tools.

Generate narration with create_tool_neural_narration.py --guide src/data/reductionWalkthrough.json.
Then run this script with --ffmpeg and --narration-dir. This only authors media.
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import ImageDraw

sys.dont_write_bytecode = True
import create_tool_walkthrough as video


GUIDE = json.loads((video.ROOT / "src/data/reductionWalkthrough.json").read_text(encoding="utf-8"))
ACCENT, DARK, TINT, BORDER = "#047857", "#065f46", "#ecfdf5", "#a7f3d0"
EXAMPLE_SELECTIONS = ["4, 7, 1", "2, 5", "3, 8"]


def field(draw, x, y, label, value, width=240, highlighted=False):
    video.text(draw, (x, y), label, 15, video.MUTED, True)
    video.card(draw, (x, y + 29, x + width, y + 77), video.WHITE, ACCENT if highlighted else video.LINE, 9)
    video.text(draw, (x + 14, y + 41), value, 20, video.INK, True)


def button(draw, box, label, primary=True):
    video.card(draw, box, ACCENT if primary else video.WHITE, ACCENT if primary else video.LINE, 10)
    x1, y1, x2, y2 = box
    video.text(draw, ((x1 + x2) / 2, (y1 + y2) / 2), label, 18, video.WHITE if primary else DARK, True, "mm")


def note(draw, y, content):
    video.card(draw, (72, y, 873, y + 60), TINT, BORDER, 12)
    video.wrapped(draw, (88, y + 12), content, 765, 17, DARK, spacing=5)


def overview(draw, elapsed):
    for i, (title, detail) in enumerate([
        ("01  Välj omgång", "Spelform, datum, bana och startlopp"),
        ("02  Ranka och reducera", "Dina hästval och dina villkor"),
        ("03  Granska och spara", "Resultat, XML-fil eller nedladdningslänk"),
    ]):
        y = 216 + i * 105
        video.card(draw, (72, y, 873, y + 83), TINT if elapsed > i * 1.4 else "#f8fafc", BORDER, 14)
        video.text(draw, (95, y + 13), title, 23, DARK, True)
        video.text(draw, (95, y + 49), detail, 18, video.MUTED)
    video.text(draw, (473, 567), "Exemplet använder V3 med tre avdelningar", 17, video.MUTED, anchor="mm")


def setup(draw, elapsed):
    for i, (label, value) in enumerate([
        ("Spelform", "V3"), ("Datum", "2026-10-21"),
        ("Bana", "Solvalla"), ("Startlopp", "1"),
    ]):
        x, y = 80 + (i % 2) * 405, 220 + (i // 2) * 125
        field(draw, x, y, label, value, 370, elapsed > i * 1.5)
    note(draw, 495, "V3 ger tre avdelningar. Startlopp anger första avdelningens loppnummer.")
    video.pointer(draw, (810, 395), elapsed > 6, elapsed)


def selections(draw, elapsed):
    for i, value in enumerate(EXAMPLE_SELECTIONS):
        field(draw, 78 + i * 272, 218, f"Avdelning {i+1}", value if elapsed > i else "", 246, i == 0)
    video.text(draw, (80, 333), "Avdelning 1:  4, 7, 1", 23, video.NAVY, True)
    for i, number in enumerate([4, 7, 1]):
        x = 80 + i * 272
        video.card(draw, (x, 383, x + 246, 484), TINT, BORDER, 14)
        video.text(draw, (x + 123, 413), f"Häst {number}", 24, DARK, True, "mm")
        video.text(draw, (x + 123, 456), f"Rank {i+1}", 19, ACCENT, True, "mm")
    note(draw, 517, "Samma hästnummer får olika rank beroende på sin plats i din lista.")
    video.pointer(draw, (270, 276), 1 < elapsed < 4, elapsed)


def autofill(draw, elapsed):
    video.card(draw, (72, 210, 873, 568), TINT, BORDER, 15)
    video.card(draw, (91, 234, 115, 258), ACCENT, ACCENT, 5)
    draw.line([(97, 246), (102, 251), (110, 240)], fill=video.WHITE, width=3)
    video.text(draw, (131, 233), "Autofyll från analysrankingen", 23, DARK, True)
    for i, count in enumerate([3, 2, 2]):
        field(draw, 93 + i * 258, 295, f"Antal för avdelning {i+1}", count, 230)
    button(draw, (93, 397, 438, 444), "Autofyll avdelningar")
    if elapsed > 4:
        video.text(draw, (96, 468), "Högst analysvärde först:", 18, DARK, True)
        for i, value in enumerate(EXAMPLE_SELECTIONS):
            video.text(draw, (96 + i * 258, 509), f"Avd {i+1}:  {value}", 19, video.INK, True)
    video.pointer(draw, (389, 426), 2 < elapsed < 5, elapsed)


def filters(draw, elapsed):
    field(draw, 80, 213, "Min rank", "3", 370, True)
    field(draw, 485, 213, "Max rank", "4", 370, True)
    video.card(draw, (80, 319, 855, 390), TINT, BORDER, 12)
    video.text(draw, (104, 341), "Rank 1 + rank 2 + rank 1 = Sum rank 4", 23, DARK, True)
    video.card(draw, (80, 412, 103, 435), ACCENT, ACCENT, 5)
    draw.line([(85, 423), (90, 428), (99, 417)], fill=video.WHITE, width=3)
    video.text(draw, (118, 412), "Två förstarankade = minst två rank 1 i raden", 20, video.INK, True)
    field(draw, 80, 464, "Exkludera textrad (kopiera från resultatet)", "Valfritt – klistra in en textrad", 775)
    video.text(draw, (81, 562), "Gränserna gäller summan, inte ett enskilt hästnummer.", 16, video.MUTED)
    video.pointer(draw, (824, 274), 1 < elapsed < 4, elapsed)


def preview(draw, elapsed):
    button(draw, (76, 206, 235, 250), "Reducera", False)
    progress = video.smooth((elapsed - 1) / 1.5)
    for i, (label, count) in enumerate([("Genererade", 12), ("Efter filter", 4), ("Saknar streck", 0)]):
        x = 76 + i * 268
        video.card(draw, (x, 271, x + 247, 353), TINT if i == 1 else "#f8fafc", BORDER if i == 1 else video.LINE, 12)
        video.text(draw, (x + 15, 283), label, 15, video.MUTED, True)
        video.text(draw, (x + 15, 307), round(count * progress), 30, DARK, True)
    headers = [(93, "Hästar"), (294, "Rank"), (495, "Sum rank"), (644, "Textrad")]
    video.card(draw, (76, 375, 859, 573), border=video.LINE, radius=10)
    for x, label in headers:
        video.text(draw, (x, 386), label, 15, video.MUTED, True)
    rows = [
        ("4, 2, 3", "1, 1, 1", "3", "0402030000000000"),
        ("7, 2, 3", "2, 1, 1", "4", "0702030000000000"),
        ("4, 5, 3", "1, 2, 1", "4", "0405030000000000"),
        ("4, 2, 8", "1, 1, 2", "4", "0402080000000000"),
    ]
    for i, row in enumerate(rows):
        y = 420 + i * 36
        draw.line((86, y - 5, 849, y - 5), fill=video.LINE)
        if elapsed > 2 + i * 0.4:
            for (x, _), value in zip(headers, row):
                video.text(draw, (x, y), value, 13 if x == 644 else 17, video.INK)
    video.pointer(draw, (203, 234), elapsed < 2, elapsed)


def export(draw, elapsed):
    button(draw, (77, 222, 460, 272), "Ladda ner spelfil")
    button(draw, (483, 222, 866, 272), "Kopiera länk", False)
    video.card(draw, (166, 310, 778, 480), TINT, BORDER, 18)
    video.text(draw, (472, 341), "XML", 34, ACCENT, True, "mm")
    video.text(draw, (472, 393), "Ditt reducerade system", 25, DARK, True, "mm")
    video.text(draw, (472, 440), "Aktuella hästval + aktuella villkor", 18, video.MUTED, anchor="mm")
    note(draw, 510, "Kopierade länkar är tillfälliga. Att spara filen lämnar inte in något spel.")
    video.pointer(draw, (422 if elapsed < 8 else 820, 255), 2 < elapsed < 4 or 9 < elapsed < 11, elapsed)


RENDERERS = [overview, setup, selections, autofill, filters, preview, export]


def render_frame(second):
    index = next((i for i, chapter in enumerate(GUIDE["chapters"]) if second < chapter["end"]), len(RENDERERS) - 1)
    chapter = GUIDE["chapters"][index]
    image = video.BACKGROUND.copy()
    draw = ImageDraw.Draw(image)
    for i, height in enumerate([10, 17, 25]):
        draw.rounded_rectangle((40 + i * 10, 48 - height, 46 + i * 10, 48), radius=2, fill=ACCENT)
    video.text(draw, (82, 25), "travanalys.se", 22, video.NAVY, True)
    video.text(draw, (911, 34), "REDUCERING", 12, video.MUTED, True)
    video.pill(draw, 1090, 22, "EXEMPELDATA", False, "amber", width=150, size=12)
    video.text(draw, (40, 78), chapter["heading"], 33, video.NAVY, True)
    video.text(draw, (40, 125), chapter["description"], 18, video.MUTED)
    video.card(draw, (40, 174, 905, 618), border="#e6eaf2", radius=24)
    video.card(draw, (930, 174, 1240, 618), border=BORDER, radius=24)
    video.text(draw, (954, 198), f"STEG {index+1:02d} / 07", 12, ACCENT, True)
    next_y = video.wrapped(draw, (954, 236), chapter["title"], 260, 25, video.NAVY, True, 7)
    video.wrapped(draw, (954, next_y + 20), chapter["instruction"], 259, 17, video.MUTED, spacing=8)
    video.card(draw, (954, 569, 1216, 601), TINT, BORDER, 9)
    video.text(draw, (1085, 584), "Illustrerad guide · Svenskt tal", 12, DARK, anchor="mm")
    RENDERERS[index](draw, second - chapter["start"])
    draw.rounded_rectangle((40, 644, 1240, 649), radius=2, fill="#dfe5f0")
    draw.rounded_rectangle((40, 644, 40 + max(1, 1200 * second / GUIDE["duration"]), 649), radius=2, fill=ACCENT)
    for i, item in enumerate(GUIDE["chapters"]):
        video.text(draw, (40 + i * 174, 661), item["title"], 13, ACCENT if i == index else video.MUTED, i == index)
    video.text(draw, (40, 696), "Illustration med exempeldata. Hästval och antal rader är endast exempel.", 12, video.MUTED)
    duration = GUIDE["duration"]
    video.text(draw, (1240, 696), f"{int(second)//60}:{int(second)%60:02d} / {duration//60}:{duration%60:02d}", 12, video.MUTED, anchor="ra")
    return image


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", required=True)
    parser.add_argument("--narration-dir", type=Path, required=True)
    parser.add_argument("--preview-dir", type=Path)
    parser.add_argument("--stills-only", action="store_true")
    args = parser.parse_args()
    video.GUIDE = GUIDE
    video.MEDIA_NAME = "travanalys-reduction-guide"
    video.render_frame = render_frame
    if not args.stills_only:
        narration = video.prepare_narration(args.ffmpeg, args.narration_dir)
        video.encode(args.ffmpeg, narration)
    video.write_assets(args.preview_dir, args.narration_dir)
