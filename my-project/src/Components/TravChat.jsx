import { useRef, useState } from 'react'
import { Send as PaperPlaneIcon, Loader2, X, Maximize2, Minimize2, MessageCircle } from 'lucide-react' //Changed!

/**
 * TravChat – React component that chats with your Spring-Boot back-end.
 * Streams tokens with fetch + ReadableStream (no EventSource, no spacing hacks).
 */
export default function TravChat() {
  const [messages, setMessages] = useState([]) // { role, content }
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(false) //Changed!
  const [isMaximized, setIsMaximized] = useState(false) //Changed!
  const tailRef = useRef(null)

  const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL;

  /* Send user message and stream assistant reply */
  const sendMessage = async () => {
    if (!input.trim()) return

    const user = { role: 'user', content: input.trim() }
    setMessages(m => [...m, user])
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch(`https://trav-bot.onrender.com/chat-stream?message=${encodeURIComponent(user.content)}`);
      const reader = res.body.getReader()
      const dec = new TextDecoder('utf-8')

      let assistant = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        assistant += dec.decode(value, { stream: true })

        setMessages(m => {
          const copy = [...m]
          if (copy.at(-1)?.role === 'assistant')
            copy[copy.length - 1] = { role: 'assistant', content: assistant }
          else
            copy.push({ role: 'assistant', content: assistant })
          return copy
        })
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ ' + err.message }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50"> {/* Changed! fixed position */}
      {!isOpen ? ( // Minimized view
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageCircle size={28} />
        </button>
      ) : (
        <div
          className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
                     transition-all duration-300
                     ${isMaximized ? 'w-[90vw] h-[90vh]' : 'w-[400px] h-[600px]'}`} //Changed!
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 text-white p-3">
            <span>TravChat 💬</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMaximized(m => !m)}>
                {isMaximized ? <Minimize2 /> : <Maximize2 />}
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap rounded-xl px-4 py-2 max-w-[80%] ${
                  m.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'mr-auto bg-gray-200 dark:bg-gray-700 dark:text-gray-50'
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={tailRef} />
          </div>

          {/* Input */}
          <div className="p-4 flex gap-2 border-t dark:border-gray-700">
            <textarea
              className="flex-1 resize-none rounded-xl border p-3 focus:outline-none focus:ring
                         dark:bg-gray-700 dark:border-gray-600
                         h-16 max-h-16"
              placeholder="Skriv ditt meddelande…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
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
      )}
    </div>
  )
}
