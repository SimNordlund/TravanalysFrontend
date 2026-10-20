"""Create a Swedish neural voiceover, with the voice's original pace and pauses.

Requires edge-tts (authoring tool only, not a website dependency) and FFmpeg.
Only the public guide's narration text is sent to the speech service.
Example:
python scripts/create_tool_neural_narration.py --ffmpeg /path/to/ffmpeg --output-dir /path/to/audio
Then add it to the video with create_tool_walkthrough.py --narration-dir /path/to/audio --add-narration-only.
"""

import argparse
import asyncio
import json
from pathlib import Path
import subprocess
import sys
import wave


ROOT = Path(__file__).resolve().parents[1]


async def generate(args):
    if args.runtime_dir:
        sys.path.insert(0, str(args.runtime_dir))
    import edge_tts

    guide = json.loads((ROOT / "src/data/toolWalkthrough.json").read_text(encoding="utf-8"))
    if args.chapter and not any(chapter["id"] == args.chapter for chapter in guide["chapters"]):
        raise ValueError(f"Kapitlet finns inte: {args.chapter}")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    voices = await asyncio.wait_for(edge_tts.list_voices(), timeout=30)
    if not any(voice["ShortName"] == args.voice and voice["Locale"] == "sv-SE" for voice in voices):
        raise ValueError(f"Svensk röst saknas: {args.voice}")

    for chapter in guide["chapters"]:
        if args.chapter and chapter["id"] != args.chapter:
            continue
        narration = chapter.get("narration")
        if not narration:
            raise ValueError(f"Talmanus saknas för {chapter['id']}")
        compressed = args.output_dir / f"{chapter['id']}.mp3"
        boundaries = args.output_dir / f"{chapter['id']}.boundaries.jsonl"
        speech = edge_tts.Communicate(
            narration,
            args.voice,
            rate=args.rate,
            boundary="SentenceBoundary",
            connect_timeout=10,
            receive_timeout=30,
        )
        await asyncio.wait_for(speech.save(str(compressed), str(boundaries)), timeout=45)
        destination = args.output_dir / f"{chapter['id']}.wav"
        subprocess.run([
            args.ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(compressed), "-ac", "1", "-ar", "24000",
            "-c:a", "pcm_s16le", str(destination),
        ], check=True)
        with wave.open(str(destination), "rb") as audio:
            duration = audio.getnframes() / audio.getframerate()
        available = chapter["end"] - chapter["start"] - 0.6
        if duration > available:
            raise ValueError(
                f"Talmanuset för {chapter['id']} tar {duration:.1f} sekunder, men {available:.1f} ryms. "
                "Korta manuset eller förläng kapitlet; rösten snabbas inte upp."
            )
        print(f"Neural voice: {chapter['id']} ({duration:.1f} s)", flush=True)

    (args.output_dir / "voice.json").write_text(json.dumps({
        "voice": args.voice,
        "culture": "sv-SE",
        "rate": args.rate,
        "engine": "neural",
        "timeCompression": False,
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--runtime-dir", type=Path)
    parser.add_argument("--voice", default="sv-SE-SofieNeural")
    parser.add_argument("--rate", default="-4%")
    parser.add_argument("--chapter", help="Skapa om ett enskilt kapitel, till exempel finish")
    arguments = parser.parse_args()
    asyncio.run(generate(arguments))
