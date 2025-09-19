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
  const VOICE_URL = `${CHATBOT_URL}/voice/chat`; 

  const [hasUnread, setHasUnread] = useState(() => {
    const opened = sessionStorage.getItem("travchat-opened");
    return !opened;
  });

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === Röstinspelning state/refs ===
  const [recording, setRecording] = useState(false);                   
  const mediaRecorderRef = useRef(null);                               
  const audioChunksRef = useRef([]);                                   
  const [lastAudioUrl, setLastAudioUrl] = useState(null);              

  const sendMessage = async () => {
    if (!input.trim()) return;

    const user = { role: "user", content: input.trim() };
    setMessages((m) => [...m, user]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch(
        `${CHATBOT_URL}/chat-stream?message=${encodeURIComponent(user.content)}`
      );
      const reader = res.body.getReader();
      const dec = new TextDecoder("utf-8");

      let assistant = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistant += dec.decode(value, { stream: true });

        setMessages((m) => {
          const copy = [...m];
          if (copy.at(-1)?.role === "assistant")
            copy[copy.length - 1] = { role: "assistant", content: assistant };
          else copy.push({ role: "assistant", content: assistant });
          return copy;
        });
      }

      if (!isOpenRef.current) setHasUnread(true);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "❌ " + err.message },
      ]);
      if (!isOpenRef.current) setHasUnread(true);
    } finally {
      setStreaming(false);
    }
  };

  // === Skicka ljud till /voice/chat och spela upp svaret ===
  async function sendAudio(blob) {                                     
    const form = new FormData();                                       
    form.append("file", blob, "input.webm");                           

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
      setMessages((m) => [...m, { role: "assistant", content: "❌ " + err.message }]); 
    } finally {                                                         
      setStreaming(false);                                              
    }                                                                   
  }                                                                     

  // === Starta/stoppa inspelning ===
  async function startRecording() {                                     
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
      sendAudio(blob);                                                  
      stream.getTracks().forEach(t => t.stop());                        
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
              <span
                className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-blue-700 opacity-85 animate-ping"
                aria-hidden="true"
              />
              <span
                className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-red-600 ring-1 ring-white"
                aria-hidden="true"
              />
              <span className="sr-only">Oläst meddelande</span>
            </>
          )}
        </button>
      ) : (
        <div
          className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
               transition-all duration-300
               ${
                 isMaximized
                   ? "w-[90vw] h-[90vh]"
                   : "w-[90vw] max-w-[400px] h-[80vh] max-h-[600px]"
               }`}
        >
          <div className="flex items-center justify-between bg-blue-600 text-white p-3">
            <div>Trav-olta 💬</div>
            <div className="text-orange-400 font-bold mr-6 sm:mr-12">BETA</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMaximized((m) => !m)}>
                {isMaximized ? <Minimize2 /> : <Maximize2 />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
              >
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

            {lastAudioUrl && (                                                     
              <div className="px-1">                                              
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"> 
                  <Volume2 className="h-4 w-4" /> Ljudsvar                         
                </div>                                                             
                <audio controls src={lastAudioUrl} className="mt-1 w-full" />      
              </div>                                                               
            )}                                                                      
          </div>
        </div>
      )}
    </div>
  );
}
