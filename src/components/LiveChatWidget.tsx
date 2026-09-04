import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, User, Compass, Phone, Mail, Clock, Minimize2, Maximize2, Check, CheckCheck, Sparkles, MapPin, Calendar, Users, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateChatResponse, classifyUserIntent } from '@/lib/chatService';
import { saveChatLead, validateChatLead, extractLeadFromChat, ChatLeadData } from '@/lib/chatLeadService';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'file';
  destinationTag?: string;
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

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { id: '1', text: '🎪 Rann Utsav 2026-27', action: 'rann' },
  { id: '2', text: '🏔️ Kashmir Paradise', action: 'kashmir' },
  { id: '3', text: '🌴 Kerala Backwaters', action: 'kerala' },
  { id: '4', text: '☕ Ooty & Nilgiri Hills', action: 'ooty' },
  { id: '5', text: '💍 Honeymoon Packages', action: 'honeymoon' },
  { id: '6', text: '🗼 Europe (Swiss & Paris)', action: 'europe' },
  { id: '7', text: '👤 Talk to Human Expert', action: 'agent' }
];

export const LiveChatWidget: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! 👋 I'm **Sarah**, Senior Travel Designer at Ghumo Firoo Journeys (Official Evoke Partner).\n\nWhich dream destination are you planning next (Rann Utsav 2026-27, Kashmir, Kerala, Ooty, Europe, Thailand, Bali, or Dubai)?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  const addMessage = (text: string, sender: 'user' | 'bot', destinationTag?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      destinationTag
    };
    setMessages(prev => [...prev, newMessage]);

    if (!isOpen && sender !== 'user') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const messageToSend = (customText || inputText).trim();
    if (!messageToSend) return;

    addMessage(messageToSend, 'user');
    if (!customText) setInputText('');

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: messageToSend }
    ];
    setConversationHistory(updatedHistory);

    // Extract intents & entities from full user message history
    const intents = classifyUserIntent(messageToSend);
    const allChatHistory = [...messages, { text: messageToSend, sender: 'user' as const }];
    const extractedLead = extractLeadFromChat(allChatHistory);

    let nextChatContext = chatContext;

    if (extractedLead.destination || extractedLead.travelDate || extractedLead.passengers) {
      nextChatContext = {
        ...chatContext,
        destination: extractedLead.destination || chatContext.destination,
        travelDate: extractedLead.travelDate || chatContext.travelDate,
        passengers: extractedLead.passengers || chatContext.passengers,
        interests: Array.from(new Set([...(chatContext.interests || []), ...(extractedLead.interests || [])]))
      };

      setChatContext(nextChatContext);
      setLeadFormData(prev => ({
        ...prev,
        destination: extractedLead.destination || prev.destination,
        travelDate: extractedLead.travelDate || prev.travelDate,
        passengers: extractedLead.passengers ? String(extractedLead.passengers) : prev.passengers
      }));
    }

    if (intents === 'booking' || intents === 'pricing' || messageToSend.toLowerCase().includes('pdf') || messageToSend.toLowerCase().includes('brochure')) {
      setTimeout(() => setShowLeadForm(true), 2500);
    }

    setIsLoadingLLM(true);
    setIsTyping(true);

    try {
      const response = await generateChatResponse(messageToSend, updatedHistory, nextChatContext);
      
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant' as const, content: response }
      ]);

      addMessage(response, 'bot', nextChatContext.destination);
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage('Sorry, I had trouble generating your itinerary. Our travel experts are available 24/7 at +91-9910987264.', 'bot');
    } finally {
      setIsLoadingLLM(false);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (action: string) => {
    if (action === 'agent') {
      handleSendMessage("I'd like to speak with a senior human travel expert.");
      return;
    }
    if (action === 'honeymoon') {
      handleSendMessage("Can you suggest the best domestic and international honeymoon packages?");
      return;
    }
    const reply = DEFAULT_QUICK_REPLIES.find(r => r.action === action);
    if (reply) {
      const userText = reply.text.replace(/[🚩🏔️🌴🗼🏖️👤💍☕🎪]/g, '').trim();
      handleSendMessage(userText);
    }
  };

  const handleWhatsAppRedirect = (customMsg?: string) => {
    const dest = leadFormData.destination || chatContext.destination || extractLeadFromChat(messages).destination || 'India / International';
    const dates = leadFormData.travelDate || chatContext.travelDate || extractLeadFromChat(messages).travelDate || 'Upcoming dates';
    const pax = leadFormData.passengers || chatContext.passengers || extractLeadFromChat(messages).passengers || 2;
    
    const text = customMsg || `Hello Ghumo Firoo! 👋 I am chatting with Sarah on your website regarding our holiday to *${dest}* (${dates} for ${pax} guests). Please share the customized itinerary PDF proposal & best quote.`;
    window.open(`https://wa.me/919910987264?text=${encodeURIComponent(text)}`, '_blank');
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
      const latestExtracted = extractLeadFromChat(messages);
      const chatLeadData: ChatLeadData = {
        name: leadFormData.name,
        phone: leadFormData.phone,
        email: leadFormData.email,
        destination: leadFormData.destination || chatContext.destination || latestExtracted.destination || 'Custom Luxury Holiday',
        travelDate: leadFormData.travelDate || chatContext.travelDate || latestExtracted.travelDate || '',
        passengers: parseInt(leadFormData.passengers) || chatContext.passengers || latestExtracted.passengers || 2,
        budget: chatContext.budget || '',
        source: 'LiveChatWidget',
        chatHistory: messages.map(m => `${m.sender}: ${m.text}`).join('\n'),
        createdAt: new Date().toISOString()
      };

      const success = await saveChatLead(chatLeadData);

      if (success) {
        addMessage(`Thank you, **${leadFormData.name}**! 🎉 I've registered your trip request for **${chatLeadData.destination}**. Our senior travel designer will reach out to you on **${leadFormData.phone}** with your customized brochure!`, 'bot');
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
              return <strong key={pIdx} className="font-extrabold text-[#996515]">{part.slice(2, -2)}</strong>;
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
      {/* Luxury Hover Badge */}
      <div className="hidden md:flex items-center gap-2 bg-[#0B1026]/95 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xl mr-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Ghumo Firoo Concierge • Sarah (Active Now)</span>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="relative bg-gradient-to-br from-[#0B1026] via-[#121936] to-[#0B1026] text-amber-400 p-3.5 rounded-full shadow-[0_0_30px_rgba(201,162,90,0.45)] hover:shadow-[0_0_40px_rgba(201,162,90,0.65)] transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-[#C9A25A] flex items-center justify-center cursor-pointer"
        aria-label="Open AI Travel Concierge"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-xs animate-pulse" />
        </div>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black animate-bounce border-2 border-slate-950 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );

  // Hide live chat widget on internal CRM and Auth pages
  if (
    location.pathname.startsWith('/crm') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password')
  ) {
    return null;
  }

  if (!isOpen) {
    return <ChatButton />;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 md:w-[430px] h-[650px]'
    }`}>
      <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-300/80 overflow-hidden h-full flex flex-col font-sans">
        
        {/* Luxury Real-Chat Header */}
        <div className="bg-gradient-to-r from-[#080d1e] via-[#0f172a] to-[#1c1307] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[1.5px] shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-black text-amber-300">SF</span>
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            {!isMinimized && (
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white font-montserrat flex items-center gap-1">
                    Sarah <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </h3>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold">
                    Lead Designer
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 animate-ping"></span>
                  <span>Ghumo Firoo Concierge • Online Now</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Real Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc]">
              
              {/* Official Partner Trust Tag */}
              <div className="text-center my-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-200/80 px-2.5 py-1 rounded-full border border-slate-300">
                  🏛️ Ministry of Tourism Registered · Evoke Partner
                </span>
              </div>

              {messages.map((message) => {
                const isUser = message.sender === 'user';
                const hasItineraryOrPrice = message.sender === 'bot' && (
                  message.text.includes('Day 1') || 
                  message.text.includes('Days') || 
                  message.text.includes('Investment') || 
                  message.text.includes('₹') || 
                  message.text.includes('Brochure') ||
                  message.text.includes('Itinerary')
                );

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[88%] sm:max-w-[85%] ${
                      isUser 
                        ? 'bg-gradient-to-br from-[#0B1026] to-[#172554] text-white rounded-2xl rounded-tr-none shadow-md border border-slate-700/50' 
                        : 'bg-white text-slate-850 rounded-2xl rounded-tl-none border border-slate-200/90 shadow-sm'
                    } p-3.5 text-xs sm:text-sm leading-relaxed relative`}>
                      
                      {/* Sender Label */}
                      {!isUser && (
                        <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-slate-100 text-[11px]">
                          <span className="font-extrabold text-amber-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Sarah • Travel Designer
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Official Concierge</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="whitespace-pre-wrap">{renderFormattedText(message.text)}</div>
                      
                      {/* Interactive Rich Action Strip for Itineraries & Human Handoff */}
                      {!isUser && hasItineraryOrPrice && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                          <button 
                            onClick={() => setShowLeadForm(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <FileText className="w-3 h-3" /> Get PDF Proposal
                          </button>
                          <button 
                            onClick={() => handleWhatsAppRedirect()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp Quote
                          </button>
                          <a 
                            href="tel:919910987264"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 border border-slate-200"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" /> Call
                          </a>
                        </div>
                      )}

                      {/* Timestamp & Read Receipts */}
                      <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isUser ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isUser && <CheckCheck className="w-3 h-3 text-amber-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Real-time Typing Bubble */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200 p-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                    <span className="text-[11px] font-bold text-slate-600">Sarah is typing custom itinerary...</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Slide-in Lead Capture Form Modal */}
            {showLeadForm && (
              <div className="p-4 border-t border-amber-500/40 bg-[#0B1026] text-white shadow-2xl">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1 font-montserrat">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Send Tailored PDF Itinerary &amp; Quote
                  </span>
                  <button onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <input
                      id="livechat-lead-name"
                      name="name"
                      autoComplete="name"
                      type="text"
                      placeholder="Your Full Name *"
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 text-white border border-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400"
                    />
                    {formErrors.name && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      id="livechat-lead-phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      placeholder="WhatsApp Phone *"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: sanitizePhone(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 text-white border border-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400"
                    />
                    {formErrors.phone && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={handleSubmitLead}
                    disabled={isSavingLead}
                    className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow-lg transition-all"
                  >
                    {isSavingLead ? 'Sending...' : '📲 Receive PDF on WhatsApp & Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            {!showLeadForm && (
              <div className="px-3 py-2 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {DEFAULT_QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply.action)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold hover:bg-amber-100 hover:text-amber-950 border border-slate-200 shrink-0 transition-all active:scale-95"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Console */}
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
                  placeholder={isLoadingLLM ? 'Curating proposal...' : 'Type destination, dates, or questions...'}
                  disabled={isLoadingLLM}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm disabled:bg-slate-100 font-medium"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoadingLLM}
                  className="bg-[#0B1026] hover:bg-amber-500 hover:text-slate-950 text-amber-400 p-2.5 rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 transition-colors shrink-0 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Direct Concierge Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                <button 
                  onClick={() => handleWhatsAppRedirect()}
                  className="hover:text-emerald-600 font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp Direct
                </button>
                <a href="tel:919910987264" className="hover:text-amber-600 font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" /> +91-9910987264
                </a>
                <span className="text-[10px] text-slate-400 font-medium">24/7 Concierge</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveChatWidget;