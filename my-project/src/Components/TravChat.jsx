import { useRef, useState, useEffect } from "react";
import {
  Send as PaperPlaneIcon,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  MessageCircle,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import TravoltaAvatar from "./TravoltaAvatar";

const SESSION_CONVERSATION_KEY = "travchat-conversation-id";

function getConversationId() {
  let id = sessionStorage.getItem(SESSION_CONVERSATION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_CONVERSATION_KEY, id);
  }
  return id;
}

export default function TravChat() {
  const conversationIdRef = useRef(null);

  if (!conversationIdRef.current) {
    conversationIdRef.current = getConversationId();
  }

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Tjabba! Jag är Trav-olta och är en travbot. Du kan fråga mig om trav, tips och mycket mer!",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const tailRef = useRef(null);

  const CHATBOT_URL = import.meta.env.VITE_API_CHATBOT_URL;
  const VOICE_URL = `${CHATBOT_URL}/voice/chat`;

  const [hasUnread, setHasUnread] = useState(() => {
    const opened = sessionStorage.getItem("travchat-opened");
    return !opened;
  });

  const TYPE_CHARS_PER_TICK = 2; //JUSTERAR HASTIGHET  
  const TYPE_INTERVAL_MS = 35; //JUSTERAR HASTIGHET 

  const pendingAssistantTextRef = useRef("");
  const typingIntervalRef = useRef(null);
  const streamFinishedRef = useRef(true);

  const stopTypingLoop = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const startTypingLoop = () => {
    if (typingIntervalRef.current) return;

    typingIntervalRef.current = window.setInterval(() => {
      if (!pendingAssistantTextRef.current) {
        if (streamFinishedRef.current) {
          stopTypingLoop();
          setStreaming(false);
          if (!isOpenRef.current) setHasUnread(true);
        }
        return;
      }

      const nextPiece = pendingAssistantTextRef.current.slice(
        0,
        TYPE_CHARS_PER_TICK,
      );
      pendingAssistantTextRef.current =
        pendingAssistantTextRef.current.slice(TYPE_CHARS_PER_TICK);

      setMessages((m) => {
        const copy = [...m];
        if (copy.at(-1)?.role === "assistant") {
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: (copy[copy.length - 1].content || "") + nextPiece,
          };
        } else {
          copy.push({ role: "assistant", content: nextPiece });
        }
        return copy;
      });
    }, TYPE_INTERVAL_MS);
  };

  useEffect(() => {
    return () => stopTypingLoop();
  }, []);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [lastAudioUrl, setLastAudioUrl] = useState(null);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const getLinkLabel = (url, fullText) => {
    const lowerUrl = url.toLowerCase();
    const lowerText = (fullText || "").toLowerCase();

    if (lowerText.includes("v85") || lowerUrl.includes("v85")) return "V85";
    if (lowerText.includes("v86") || lowerUrl.includes("v86")) return "V86";
    return "Öppna länk";
  };

  const renderMessageContent = (content) => {
    if (!content) return null;

    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      const isUrl = /^https?:\/\/[^\s]+$/.test(part);

      if (isUrl) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 dark:text-blue-300 underline break-all"
          >
            {getLinkLabel(part, content)}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const user = { role: "user", content: input.trim() };
    setMessages((m) => [...m, user]);
    setInput("");
    setStreaming(true);

    pendingAssistantTextRef.current = "";
    streamFinishedRef.current = false;
    stopTypingLoop();
    startTypingLoop();

    try {
      const res = await fetch(
        `${CHATBOT_URL}/chat-stream?message=${encodeURIComponent(user.content)}&conversationId=${encodeURIComponent(conversationIdRef.current)}`,
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        pendingAssistantTextRef.current += dec.decode(value, { stream: true });
      }

      pendingAssistantTextRef.current += dec.decode();
    } catch (err) {
      stopTypingLoop();
      pendingAssistantTextRef.current = "";
      streamFinishedRef.current = true;
      setStreaming(false);

      setMessages((m) => [
        ...m,
        { role: "assistant", content: "error " + err.message },
      ]);

      if (!isOpenRef.current) setHasUnread(true);
    } finally {
      streamFinishedRef.current = true;
    }
  };

  // Skicka ljud till /voice/chat och spela upp svaret
  async function sendAudio(blob) {
    const form = new FormData();
    form.append("file", blob, "input.webm");
    form.append("conversationId", conversationIdRef.current);

    setStreaming(true);
    try {
      const res = await fetch(VOICE_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text, audioBase64 } = await res.json();

      // Lägg till textsvar i chatten
      setMessages((m) => [...m, { role: "assistant", content: text }]);

      // Spela upp ljud
      const url = `data:audio/mp3;base64,${audioBase64}`;
      setLastAudioUrl(url);
      const audio = new Audio(url);
      audio.play().catch(() => {});

      if (!isOpenRef.current) setHasUnread(true);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "error " + err.message },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  // Starta/stoppa inspelning
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

    audioChunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: mime || "audio/webm",
      });
      sendAudio(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6">
      {!isOpen ? (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
              sessionStorage.setItem("travchat-opened", "1");
            }}
            className="relative flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-white shadow-xl ring-1 ring-black/10 transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-4 sm:py-3"
            aria-label="Öppna Trav-olta chatten"
          >
            <TravoltaAvatar size="sm" speaking={hasUnread} />
            <span className="hidden text-sm font-semibold sm:inline">
              Fråga Trav-olta
            </span>
            <MessageCircle className="h-5 w-5 text-indigo-200" />
            {hasUnread && (
              <>
                <span
                  className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-500 opacity-80 animate-ping"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-600 ring-1 ring-white"
                  aria-hidden="true"
                />
                <span className="sr-only">Oläst meddelande</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div
          className={`flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10 transition-all duration-300 dark:bg-gray-800 ${
            isMaximized
              ? "h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] lg:w-[56rem] xl:w-[64rem]"
              : "h-[min(82dvh,42rem)] sm:h-[min(78dvh,38rem)] sm:w-96 md:w-[26rem] lg:w-[28rem]"
          }`}
        >
          <div className="flex items-center justify-between gap-3 bg-gray-900 p-3 text-white sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <TravoltaAvatar size="md" speaking={streaming || recording} />
              <div className="min-w-0">
                <div className="truncate font-semibold">Trav-olta</div>
                <p className="truncate text-xs text-gray-300">
                  {recording
                    ? "Lyssnar..."
                    : streaming
                      ? "Svarar..."
                      : "Din travkompis"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMaximized((m) => !m)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label={
                  isMaximized ? "Förminska chatten" : "Maximera chatten"
                }
              >
                {isMaximized ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Stäng chatten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-3 py-4 dark:bg-gray-900/40 sm:px-4">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isActiveAssistant =
                !isUser && streaming && i === messages.length - 1;

              return (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <TravoltaAvatar size="sm" speaking={isActiveAssistant} />
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm/6 shadow-sm [overflow-wrap:anywhere] sm:max-w-[78%] sm:text-base/7 lg:max-w-[70%] ${
                      isUser
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-50 dark:ring-gray-600"
                    }`}
                  >
                    {renderMessageContent(m.content)}
                  </div>
                </div>
              );
            })}
            <div ref={tailRef} />
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
              <button
                onClick={() => (recording ? stopRecording() : startRecording())}
                disabled={streaming}
                aria-label={recording ? "Stoppa inspelning" : "Spela in röst"}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:h-12 sm:w-12 ${
                  recording
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
                } disabled:opacity-50`}
              >
                {recording ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <textarea
                className="h-11 max-h-24 min-h-11 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 sm:h-12 sm:text-base"
                placeholder="Skriv ditt meddelande..."
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:h-12 sm:w-12"
                aria-label="Skicka meddelande"
              >
                {streaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <PaperPlaneIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {lastAudioUrl && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Volume2 className="h-4 w-4" /> Ljudsvar
                </div>
                <audio controls src={lastAudioUrl} className="mt-2 w-full" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
