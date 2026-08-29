import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, User, Compass, Phone, Mail, Clock, Minimize2, Maximize2, Check, Sparkles, MapPin, Calendar, Users, FileText } from 'lucide-react';
import { generateChatResponse, classifyUserIntent } from '@/lib/chatService';
import { saveChatLead, validateChatLead, extractLeadFromChat, ChatLeadData } from '@/lib/chatLeadService';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'file';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

interface ChatContext {
  destination?: string;
  travelDate?: string;
  passengers?: number;
  budget?: string;
  interests?: string[];
}

const quickReplies: QuickReply[] = [
  { id: '1', text: '🎪 Rann Utsav 2026-27 (Evoke)', action: 'rann' },
  { id: '2', text: '🚩 Char Dham Yatra', action: 'chardham' },
  { id: '3', text: '🏔️ Kashmir Paradise', action: 'kashmir' },
  { id: '4', text: '🌴 Thailand & Bali', action: 'thailand' },
  { id: '5', text: '🗼 Europe Tours', action: 'europe' },
  { id: '6', text: '👤 Talk to Human Expert', action: 'agent' }
];

export const LiveChatWidget: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! 👋 I'm **Sarah**, Senior AI Travel Designer at Ghumo Firoo Journeys (Official Evoke Partner). \n\nWhich dream destination are you planning next (Rann Utsav 2026-27, Char Dham Yatra, Kashmir, Europe, Thailand, Bali, or Dubai)?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatContext, setChatContext] = useState<ChatContext>({});
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    email: '',
    destination: '',
    travelDate: '',
    passengers: '2'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSavingLead, setIsSavingLead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const addMessage = (text: string, sender: 'user' | 'agent' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    if (!isOpen && sender !== 'user') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, 'user');
    setInputText('');

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];
    setConversationHistory(updatedHistory);

    // Extract intents from user message
    const intents = classifyUserIntent(userMessage);
    const extractedLead = extractLeadFromChat([{ text: userMessage, sender: 'user' }]);

    let nextChatContext = chatContext;

    if (extractedLead.destination) {
      nextChatContext = {
        ...chatContext,
        destination: extractedLead.destination,
        interests: Array.from(new Set([...(chatContext.interests || []), ...(extractedLead.interests || [])]))
      };

      setChatContext(nextChatContext);
      setLeadFormData(prev => ({
        ...prev,
        destination: prev.destination || extractedLead.destination
      }));
    }

    if (intents.includes('destination') || userMessage.toLowerCase().includes('book')) {
      setTimeout(() => setShowLeadForm(true), 2500);
    }

    setIsLoadingLLM(true);
    setIsTyping(true);

    try {
      const response = await generateChatResponse(userMessage, updatedHistory, nextChatContext);
      
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant' as const, content: response }
      ]);

      addMessage(response, 'bot');
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage('Sorry, I had trouble generating your itinerary. Our travel experts are available 24/7 at +91-9910987264.', 'bot');
    } finally {
      setIsLoadingLLM(false);
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (action: string) => {
    const reply = quickReplies.find(r => r.action === action);
    if (reply) {
      const userText = reply.text.replace(/[🚩🏔️🌴🗼🏖️👤🎪]/g, '').trim();
      addMessage(userText, 'user');

      if (action === 'agent') {
        setTimeout(() => {
          addMessage("Hi! 👋 I'm Sarah, Senior Travel Specialist at Ghumo Firoo. How can I assist you with your holiday plans today?\n\nYou can reach our human experts directly at **+91-9910987264** or fill in your details below so we can call you back with custom quotes!", 'agent');
          setShowLeadForm(true);
        }, 500);
        return;
      }

      const updatedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
        ...conversationHistory,
        { role: 'user', content: userText }
      ];
      setConversationHistory(updatedHistory);

      setIsLoadingLLM(true);
      setIsTyping(true);

      try {
        const quickResponse = await generateChatResponse(userText, updatedHistory, chatContext);
        addMessage(quickResponse, 'bot');

        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', content: quickResponse }
        ] as Array<{ role: 'user' | 'assistant'; content: string }>);
      } catch (err) {
        console.error('Quick reply error:', err);
      } finally {
        setIsLoadingLLM(false);
        setIsTyping(false);
      }
    }
  };

  const handleSubmitLead = async () => {
    const errors: Record<string, string> = {};
    if (!leadFormData.name.trim()) errors.name = 'Please enter your name';
    if (!validateIndianPhone(leadFormData.phone)) errors.phone = PHONE_ERROR_MSG;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSavingLead(true);
    setFormErrors({});

    try {
      const chatLeadData: ChatLeadData = {
        name: leadFormData.name,
        phone: leadFormData.phone,
        email: leadFormData.email,
        destination: leadFormData.destination || chatContext.destination || 'General Enquiry',
        travelDate: leadFormData.travelDate || chatContext.travelDate || '',
        passengers: parseInt(leadFormData.passengers) || 2,
        budget: chatContext.budget || '',
        source: 'LiveChatWidget',
        chatHistory: messages.map(m => `${m.sender}: ${m.text}`).join('\n'),
        createdAt: new Date().toISOString()
      };

      const success = await saveChatLead(chatLeadData);

      if (success) {
        addMessage(`Thank you ${leadFormData.name}! 🎉 I've registered your trip request for ${chatLeadData.destination}. A Ghumo Firoo Senior Travel Designer will reach out to you on ${leadFormData.phone} with your customized brochure!`, 'bot');
        setShowLeadForm(false);
        setLeadFormData({
          name: '',
          phone: '',
          email: '',
          destination: '',
          travelDate: '',
          passengers: '2'
        });
      } else {
        addMessage("We couldn't save your request automatically, but our team is reachable directly on WhatsApp / Phone at +91-9910987264.", 'bot');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      addMessage('Thank you! Our travel expert team will connect with you shortly.', 'bot');
    } finally {
      setIsSavingLead(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let formattedLine = line;
      // Bold rendering **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-amber-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {idx < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const ChatButton = () => (
    <div className="fixed bottom-24 right-6 z-40 flex items-center group">
      {/* Glassmorphism Hover Badge */}
      <div className="hidden md:flex items-center gap-2 bg-slate-950/95 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl mr-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>AI Concierge — 24/7 Travel Planner</span>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="relative bg-gradient-to-br from-slate-950 via-[#0B1026] to-slate-900 text-amber-400 p-3.5 rounded-full shadow-[0_0_25px_rgba(201,162,90,0.35)] hover:shadow-[0_0_35px_rgba(201,162,90,0.55)] transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-[#C9A25A]/70 flex items-center justify-center cursor-pointer"
        aria-label="Open AI Travel Concierge"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-xs animate-pulse" />
        </div>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-emerald-500 text-slate-950 text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black animate-bounce border-2 border-slate-950 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );

  // Hide live chat widget on internal CRM pages
  if (location.pathname.startsWith('/crm')) {
    return null;
  }

  if (!isOpen) {
    return <ChatButton />;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 md:w-[420px] h-[640px]'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden h-full flex flex-col font-sans">
        {/* Luxury Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/40 rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-300 animate-spin-slow" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
            </div>
            {!isMinimized && (
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide text-amber-100">Ghumo Firoo Concierge</h3>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-mono">24/7 AI</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-200 mt-0.5 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0"></span>
                  <span>Sarah • Active Now (Response &lt; 2 mins)</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl rounded-tr-none' 
                      : message.sender === 'agent'
                      ? 'bg-emerald-50 text-emerald-950 rounded-2xl rounded-tl-none border border-emerald-200/80'
                      : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm'
                  } p-3.5 text-xs md:text-sm leading-relaxed`}>
                    {message.sender !== 'user' && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100">
                        {message.sender === 'agent' ? (
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-700">
                          {message.sender === 'agent' ? 'Human Expert (Sarah)' : 'Sarah • AI Travel Designer'}
                        </span>
                      </div>
                    )}
                    <div>{renderFormattedText(message.text)}</div>
                    
                    {/* Action buttons inside bot itineraries */}
                    {message.sender === 'bot' && (message.text.includes('Package') || message.text.includes('Rate') || message.text.includes('Itinerary')) && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                        <button 
                          onClick={() => setShowLeadForm(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Get WhatsApp Brochure
                        </button>
                        <a 
                          href="tel:919910987264"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" /> Call Expert
                        </a>
                      </div>
                    )}

                    <div className={`text-[10px] mt-1.5 text-right ${
                      message.sender === 'user' ? 'text-amber-100' : 'text-slate-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200 p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-600">Curating luxury itinerary...</span>
                    </div>
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Lead Capture Form Modal */}
            {showLeadForm && (
              <div className="p-4 border-t border-slate-200 bg-slate-900 text-white shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Receive Custom Itinerary Brochure
                  </span>
                  <button onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-800 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 text-white border border-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                    {formErrors.name && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="WhatsApp Mobile *"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: sanitizePhone(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-800 text-white border border-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                    {formErrors.phone && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSubmitLead}
                    disabled={isSavingLead}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-1.5 rounded font-semibold text-xs transition-colors"
                  >
                    {isSavingLead ? 'Sending...' : '📲 Send Itinerary via WhatsApp'}
                  </button>
                </div>
              </div>
            )}

            {/* Travel Destination Quick Chips */}
            {!showLeadForm && (
              <div className="px-3 py-2 border-t border-slate-200 bg-white">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Explore Trending Circuits:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply.action)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium hover:bg-amber-100 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-all"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  id="chat-input"
                  name="message"
                  autoComplete="off"
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isLoadingLLM ? 'Curating itinerary...' : 'Type destination or query...'}
                  disabled={isLoadingLLM}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs md:text-sm disabled:bg-slate-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoadingLLM}
                  className="bg-slate-900 hover:bg-amber-600 text-white p-2.5 rounded-xl disabled:bg-slate-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Bottom Quick Contact */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                <a href="tel:919910987264" className="hover:text-amber-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" /> +91-9910987264
                </a>
                <a href="mailto:info@ghumofiroo.com" className="hover:text-amber-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-600" /> Email Quote
                </a>
                <span className="text-slate-400">Ghumo Firoo Travels</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveChatWidget;