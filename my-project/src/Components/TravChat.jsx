// src/components/TravChat.jsx
import { useRef, useState, useEffect } from "react"; //Changed!
import {
  Send as PaperPlaneIcon,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  MessageCircle,
  Mic,        //Changed!
  Square,     //Changed!
  Volume2,    //Changed!
} from "lucide-react";

export default function TravChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hej! Jag är Trav-olta och är en travbot. Du kan fråga mig om trav, tips och mycket mer!",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const tailRef = useRef(null);

  const CHATBOT_URL = import.meta.env.VITE_API_CHATBOT_URL;
  const VOICE_API = `${CHATBOT_URL}/voice`; //Changed!

  const [hasUnread, setHasUnread] = useState(() => {
    const opened = sessionStorage.getItem("travchat-opened");
    return !opened;
  });

  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ========== Röstinspelning ==========
  const [recording, setRecording] = useState(false);           //Changed!
  const mediaRecorderRef = useRef(null);                       //Changed!
  const audioChunksRef = useRef([]);                           //Changed!

  async function startRecording() {                            //Changed!
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

    audioChunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: mime || "audio/webm" });
      sendAudio(blob); //Changed!
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  }

  function stopRecording() {                                   //Changed!
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  // ========== Progressiv TTS (kö) ==========
  const ttsQueueRef = useRef([]);                              //Changed!
  const isPlayingRef = useRef(false);                          //Changed!
  const enableVoiceRef = useRef(true);                         //Changed!

  function playNext() {                                        //Changed!
    const next = ttsQueueRef.current.shift();
    if (!next) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const audio = new Audio(next);
    audio.onended = () => playNext();
    audio.play().catch(() => playNext());
  }

  async function speakChunk(text) {                             //Changed!
    if (!enableVoiceRef.current) return;
    const trimmed = (text || "").trim();
    if (trimmed.length < 8) return;

    try {
      const res = await fetch(`${VOICE_API}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, voice: "ALLOY", speed: 1.0 }),
      });
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const { audioBase64 } = await res.json();
      const url = `data:audio/mp3;base64,${audioBase64}`;
      ttsQueueRef.current.push(url);
      if (!isPlayingRef.current) playNext();
    } catch (e) {
      console.warn("TTS misslyckades:", e);
    }
  }

  // ========== Strömma chattsvar + progressiv TTS ==========
  async function streamAnswerWithTTS(userText) {                //Changed!
    setMessages((m) => [...m, { role: "user", content: userText }]);
    setStreaming(true);

    try {
      const res = await fetch(`${CHATBOT_URL}/chat-stream?message=${encodeURIComponent(userText)}`);
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder("utf-8");

      let assistant = "";
      let speakBuffer = "";

      const flushSpeakable = () => {
        const parts = speakBuffer.split(/(?<=[\.\!\?])\s+/); // hela meningar   //Changed!
        speakBuffer = parts.pop() ?? ""; // lämna ev. ofullständig mening       //Changed!
        for (const p of parts) speakChunk(p);
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = dec.decode(value, { stream: true });
        assistant += chunk;
        speakBuffer += chunk;

        setMessages((m) => {
          const copy = [...m];
          if (copy.at(-1)?.role === "assistant") {
            copy[copy.length - 1] = { role: "assistant", content: assistant };
          } else {
            copy.push({ role: "assistant", content: assistant });
          }
          return copy;
        });

        if (speakBuffer.length > 120 || /\n{2,}/.test(speakBuffer)) { // heuristik //Changed!
          flushSpeakable();
        }
      }

      if (speakBuffer.trim()) speakChunk(speakBuffer.trim());         // sista bit //Changed!
      if (!isOpenRef.current) setHasUnread(true);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "❌ " + err.message }]);
      if (!isOpenRef.current) setHasUnread(true);
    } finally {
      setStreaming(false);
    }
  }

  // ========== Skicka text ==========
  const sendMessage = async () => {                               //Changed!
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await streamAnswerWithTTS(text);
  };

  // ========== Skicka ljud: STT -> stream + progressiv TTS ==========
  async function sendAudio(blob) {                                //Changed!
    const form = new FormData();
    form.append("file", blob, "input.webm");

    setStreaming(true);
    try {
      const stt = await fetch(`${VOICE_API}/transcribe`, { method: "POST", body: form });
      if (!stt.ok) throw new Error(`STT HTTP ${stt.status}`);
      const { text } = await stt.json();

      if (!text || !text.trim()) {
        setMessages((m) => [...m, { role: "assistant", content: "❌ Hörde inget." }]);
        return;
      }
      await streamAnswerWithTTS(text.trim());
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "❌ " + err.message }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
            sessionStorage.setItem("travchat-opened", "1");
          }}
          className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Öppna chatt"
        >
          <MessageCircle size={28} />
          {hasUnread && (
            <>
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-blue-700 opacity-85 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-red-600 ring-1 ring-white" />
              <span className="sr-only">Oläst meddelande</span>
            </>
          )}
        </button>
      ) : (
        <div
          className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
               transition-all duration-300
               ${isMaximized ? "w-[90vw] h-[90vh]" : "w-[90vw] max-w-[400px] h-[80vh] max-h-[600px]"}`}
        >
          <div className="flex items-center justify-between bg-blue-600 text-white p-3">
            <div>Trav-olta 💬</div>
            <div className="text-orange-400 font-bold mr-6 sm:mr-12">BETA</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMaximized((m) => !m)}>
                {isMaximized ? <Minimize2 /> : <Maximize2 />}
              </button>
              <button onClick={() => { setIsOpen(false); }}>
                <X />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 p-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap rounded-xl px-4 py-2 max-w-[80%] ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-200 dark:bg-gray-700 dark:text-gray-50"
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={tailRef} />
          </div>

          <div className="p-4 flex flex-col gap-3 border-t dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => (enableVoiceRef.current = e.target.checked)} //Changed!
                />
                <span>Läs upp svaret medan det kommer</span>
              </label>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Röstläge</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => (recording ? stopRecording() : startRecording())}
                disabled={streaming}
                aria-label={recording ? "Stoppa inspelning" : "Spela in röst"}
                className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center
                            ${recording ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900"}
                            disabled:opacity-50`}
              >
                {recording ? <Square /> : <Mic />}
              </button>

              <textarea
                className="flex-1 resize-none rounded-xl border p-3 focus:outline-none focus:ring
                           dark:bg-gray-700 dark:border-gray-600
                           h-16 max-h-16"
                placeholder="Skriv ditt meddelande…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={streaming}
                className="h-12 w-12 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center
                           disabled:opacity-50"
              >
                {streaming ? <Loader2 className="animate-spin" /> : <PaperPlaneIcon />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
