import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Key,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Send,
  Cpu,
  Download,
  AlertTriangle,
  Flame,
  Ghost,
  BookOpen,
  Image as ImageIcon,
  Camera,
  X,
  FileImage,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  LearningMode,
  SubjectCategory,
  ChatMessage,
  HealthStatus,
  SampleQuestion,
  AttachedImage,
} from './types';
import { HalloweenAtmosphere } from './components/HalloweenAtmosphere';
import { ModeSelector } from './components/ModeSelector';
import { SubjectBar } from './components/SubjectBar';
import { MessageCard } from './components/MessageCard';
import { GemmaStatusModal } from './components/GemmaStatusModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import {
  playSpellSound,
  playPumpkinSound,
  playGhostSound,
  toggleMute,
  getMuteState,
} from './utils/audio';
import {
  processImageFile,
  generateSampleMathImage,
  generateSampleVelocityGraphImage,
} from './utils/imageUtils';

export default function App() {
  const [learningMode, setLearningMode] = useState<LearningMode>('answer_spell');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('All Subjects');
  const [selectedModel, setSelectedModel] = useState<string>('gemma-4-26b-a4b-it');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // Image Upload & Camera Capture State
  const [selectedImage, setSelectedImage] = useState<AttachedImage | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Health and Diagnostics Modal State
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    model: string;
    response?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImage]);

  // Check health on mount
  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
        if (data.activeModel) {
          setSelectedModel(data.activeModel);
        }
      }
    } catch (e) {
      console.warn('Health check fetch failed:', e);
    }
  };

  // Test Gemma 4 connection live
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          model: data.model,
          response: data.testResponse,
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          success: false,
          model: selectedModel,
          error: data.error || 'Connection failed',
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        model: selectedModel,
        error: err.message || 'Network error during test',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    if (!muted) {
      playGhostSound();
    }
  };

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);
    playPumpkinSound();

    try {
      const processed = await processImageFile(file);
      setSelectedImage(processed);
      playSpellSound();
    } catch (err: any) {
      setImageError(err.message || 'Could not process image.');
    } finally {
      setIsProcessingImage(false);
      // Reset input value so the same file can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
    }
  };

  // Camera capture handler from modal
  const handleCameraCapture = (image: AttachedImage) => {
    setSelectedImage(image);
    setImageError(null);
    playSpellSound();
  };

  // Try sample geometry homework image
  const handleLoadSampleTriangleImage = () => {
    playSpellSound();
    const sampleImg = generateSampleMathImage();
    setSelectedImage(sampleImg);
    setImageError(null);
    if (!inputPrompt) {
      setInputPrompt('Solve the right-angled triangle problem in this geometry homework image.');
    }
  };

  // Try sample velocity-time graph image
  const handleLoadSampleVelocityImage = () => {
    playSpellSound();
    const sampleImg = generateSampleVelocityGraphImage();
    setSelectedImage(sampleImg);
    setImageError(null);
    if (!inputPrompt) {
      setInputPrompt(
        'Analyze this velocity-time graph. Calculate the total distance traveled from t = 0 to 8 s, and distinguish total distance vs displacement over the full 10 seconds.'
      );
    }
  };

  // Clear selected image
  const handleRemoveImage = () => {
    playPumpkinSound();
    setSelectedImage(null);
    setImageError(null);
  };

  // Send message to server backend
  const handleSendMessage = async (
    textToSend?: string,
    simplifyStepPrompt?: string,
    imageOverride?: AttachedImage,
    historyOverride?: ChatMessage[]
  ) => {
    const prompt = (textToSend !== undefined ? textToSend : inputPrompt).trim();
    const imgToAttach = imageOverride !== undefined ? imageOverride : selectedImage;

    // Must have either a prompt, an image, a simplify step request, or a retry history
    if (!prompt && !imgToAttach && !simplifyStepPrompt && !historyOverride) return;

    playSpellSound();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;

    // Add user message to conversation history (if not retrying an existing history)
    let updatedHistory = historyOverride ? [...historyOverride] : [...messages];
    if (!historyOverride && (prompt || imgToAttach)) {
      const userDisplayContent =
        prompt || (imgToAttach ? 'Please inspect this homework/diagram image and solve it step by step.' : '');

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: userDisplayContent,
        timestamp,
        mode: learningMode,
        subject: selectedSubject,
        image: imgToAttach || undefined,
      };
      updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setInputPrompt('');
      setSelectedImage(null);
      setImageError(null);
    }

    setIsLoading(true);

    try {
      // Map history for API excluding error notifications and ensuring clean payload
      const apiMessages = updatedHistory
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image
            ? {
                mimeType: m.image.mimeType,
                base64: m.image.base64,
              }
            : undefined,
        }));

      const res = await fetch('/api/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          mode: learningMode,
          model: selectedModel,
          subject: selectedSubject,
          simplifyStepPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorContent = data.error || `Spell Error (${res.status}): Something went wrong in the spectral archives.`;
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: errorContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: learningMode,
          isError: true,
          canRetry: data.canRetry !== false,
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      // Success reply from Gemma 4
      const botMsg: ChatMessage = {
        id: `gemma-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: learningMode,
        subject: selectedSubject,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Network Anomaly: Could not reach the haunted server. (${err.message || 'Unknown network error'})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: learningMode,
        isError: true,
        canRetry: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry failed spell without corrupting history
  const handleRetry = (errorId: string) => {
    // Filter out the error message from state
    const cleanList = messages.filter((m) => m.id !== errorId);
    setMessages(cleanList);

    // Re-dispatch using the cleaned history
    handleSendMessage(undefined, undefined, undefined, cleanList);
  };

  // Step simplifier
  const handleSimplifyStep = (stepText: string) => {
    handleSendMessage(`Could you please explain this specific step again in simpler words with a friendly everyday analogy: "${stepText}"?`);
  };

  // Switch to Direct Answer Mode and ask to reveal
  const handleSwitchToAnswerSpell = () => {
    setLearningMode('answer_spell');
    handleSendMessage('I would like to reveal the full solution now using The Answer Spell. Please provide the step-by-step complete solution!');
  };

  // Quick follow-up prompt
  const handleAskFollowUp = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Handle sample question click
  const handleSelectSample = (sample: SampleQuestion) => {
    setLearningMode(sample.recommendedMode);
    setSelectedSubject(sample.subject);

    // If it is the velocity-time graph sample
    if (sample.title.includes('Velocity') || sample.title.includes('55m')) {
      const sampleImg = generateSampleVelocityGraphImage();
      setSelectedImage(sampleImg);
      handleSendMessage(sample.prompt, undefined, sampleImg);
    } else if (sample.title.includes('Image') || sample.title.includes('Triangle') || sample.title.includes('Homework Scroll')) {
      const sampleImg = generateSampleMathImage();
      setSelectedImage(sampleImg);
      handleSendMessage(sample.prompt, undefined, sampleImg);
    } else {
      handleSendMessage(sample.prompt);
    }
  };

  // Clear conversation
  const handleClearChat = () => {
    playPumpkinSound();
    setMessages([]);
    setSelectedImage(null);
  };

  // Export parchment notes
  const handleExportNotes = () => {
    playSpellSound();
    const notes = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'Scholar' : 'Haunted Study Buddy (' + m.mode + ')'}${
            m.image ? ' [Attached Image: ' + m.image.name + ']' : ''
          }:\n${m.content}\n\n`
      )
      .join('---\n\n');

    const blob = new Blob(
      [
        `🎃 HAUNTED STUDY BUDDY — STUDY PARCHMENT 🎃\n` +
          `AI Brain: Gemma 4 (${selectedModel}) with Multimodal Vision\n` +
          `Created: ${new Date().toLocaleString()}\n\n` +
          notes,
      ],
      { type: 'text/plain;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haunted-study-notes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#08040e] text-[#f3f0fa] relative flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Background Halloween Visuals */}
      <HalloweenAtmosphere />

      {/* Hidden File & Camera Input elements */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={mobileCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Top Navigation & Status Bar */}
      <header className="relative z-20 w-full border-b border-purple-900/40 bg-black/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl animate-float inline-block">🎃</span>
              <span className="absolute -top-1 -right-1 text-xs">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-creepster text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-300 to-orange-500">
                  Haunted Study Buddy
                </h1>
                <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-300 border border-purple-700/60 font-mono-code">
                  Hacktoberfest 2026
                </span>
              </div>
              <p className="text-[11px] text-purple-400 font-mono-code flex items-center gap-1.5">
                <span>Best Use of Gemma 4 Track</span>
                <span className="text-orange-400 font-bold">•</span>
                <span className="text-orange-300">📷 Multimodal Vision Enabled</span>
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Gemma 4 Live Connection Pill */}
            <button
              type="button"
              onClick={() => {
                playPumpkinSound();
                setIsDiagnosticsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 border border-purple-600/50 hover:border-purple-400 text-purple-200 text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer"
              title="Click to view Gemma 4 Diagnostics & Live Connection Test"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden md:inline font-mono-code">Gemma 4: {selectedModel}</span>
              <span className="md:hidden font-mono-code">Gemma 4</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-black/50 border-purple-950 text-purple-500 hover:text-purple-300'
                  : 'bg-purple-950/80 border-purple-600 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
              }`}
              title={isMuted ? 'Unmute Spooky Sounds' : 'Mute Sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Export Notes */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleExportNotes}
                className="p-2 rounded-full bg-black/50 hover:bg-purple-950 border border-purple-900/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
                title="Download Study Parchment"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Clear Chat */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-full bg-black/50 hover:bg-red-950 border border-purple-900/60 text-purple-300 hover:text-red-300 transition-colors cursor-pointer"
                title="Clear Study Room"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto flex flex-col justify-between pb-6">
        <div>
          {/* Spooky Hero Banner with Required Title & Subtitle */}
          <div className="text-center pt-8 pb-4 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/40 border border-orange-500/40 text-orange-300 text-xs font-cinzel mb-3">
              <span>🎃</span>
              <span>Hacktoberfest 2026 Gemma 4 Track • Multimodal AI</span>
              <span>👻</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-cinzel tracking-wider text-purple-100 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              Welcome to the Haunted Study Room!
            </h1>

            <p className="mt-2.5 text-sm sm:text-base md:text-lg text-orange-400 font-cinzel font-semibold tracking-wide drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]">
              Get the answer, or discover it yourself.
            </p>
          </div>

          {/* Learning Mode Switcher */}
          <ModeSelector currentMode={learningMode} onSelectMode={setLearningMode} />

          {/* Subject Filter Bar & Sample Prompts */}
          <SubjectBar
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onSelectSampleQuestion={handleSelectSample}
          />

          {/* Welcome Intro Card (Shown when chat is empty) */}
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto my-6 px-4">
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#130924]/90 to-black/80 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)] relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Floating mascot graphic */}
                  <div className="shrink-0 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center shadow-lg shadow-purple-900/50 text-5xl animate-float">
                      👻
                    </div>
                    <span className="mt-2 block text-xs font-cinzel text-purple-300 font-bold">
                      Spectral Tutor
                    </span>
                  </div>

                  <div className="space-y-3 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold font-cinzel text-purple-100">
                      Step into the circle, curious apprentice.
                    </h3>
                    <p className="text-xs md:text-sm text-purple-200/80 leading-relaxed">
                      Powered by Google's multimodal <strong className="text-orange-300">Gemma 4 model</strong>,
                      the Haunted Study Buddy can read text and inspect photos of your homework, handwritten equations, and diagrams:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 text-left">
                        <strong className="text-purple-300 font-cinzel flex items-center gap-1.5 mb-1">
                          <Wand2 className="w-3.5 h-3.5 text-purple-400" /> 1. The Answer Spell
                        </strong>
                        <span className="text-purple-200/80 text-[11px] block">
                          Instant step-by-step solutions for text or photo questions. Ask to simplify any step on demand.
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-950/60 border border-orange-800/60 text-left">
                        <strong className="text-orange-300 font-cinzel flex items-center gap-1.5 mb-1">
                          <Key className="w-3.5 h-3.5 text-orange-400" /> 2. The Mystery Spell
                        </strong>
                        <span className="text-orange-200/80 text-[11px] block">
                          Never spoils answers! Guides you through the uploaded homework photo one clue at a time.
                        </span>
                      </div>
                    </div>

                    {/* Quick Sample Image Test Buttons */}
                    <div className="pt-3 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                      <button
                        type="button"
                        onClick={handleLoadSampleTriangleImage}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/70 to-indigo-900/70 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 text-purple-200 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <span>📐</span>
                        <span>Sample Geometry Homework (Triangle)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLoadSampleVelocityImage}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-900/70 to-amber-900/70 hover:from-orange-800 hover:to-amber-800 border border-orange-500/50 text-orange-200 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <span>⚡</span>
                        <span>Sample Velocity-Time Graph (55 m)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Spectral Quote footer */}
                <div className="mt-6 pt-4 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-purple-400/80 font-mono-code">
                  <span>✦ Verified Gemma 4 Model: gemma-4-26b-a4b-it</span>
                  <span>📷 Vision & Camera Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Messages */}
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onRetry={handleRetry}
                onSimplifyStep={handleSimplifyStep}
                onSwitchToAnswerSpell={handleSwitchToAnswerSpell}
                onAskFollowUp={handleAskFollowUp}
              />
            ))}

            {/* Spectral Loading Indicator */}
            {isLoading && (
              <div className="w-full flex justify-start my-4 px-2">
                <div className="max-w-xl w-full rounded-2xl p-5 bg-gradient-to-br from-black via-purple-950/50 to-black border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>
                      🔮
                    </div>
                    <div>
                      <div className="text-sm font-bold font-cinzel text-purple-200 flex items-center gap-2">
                        <span>Chanting the Gemma 4 Spell...</span>
                        <span className="text-xs text-orange-400 font-mono-code">
                          ({learningMode === 'mystery_spell' ? 'The Mystery Spell' : 'The Answer Spell'})
                        </span>
                      </div>
                      <p className="text-xs text-purple-400/80 mt-0.5">
                        {messages[messages.length - 1]?.image
                          ? 'Inspecting homework image & diagrams with Gemma 4 Vision...'
                          : 'Consulting the 26B parameter spectral archives via Google Gen AI SDK...'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar & Controls */}
        <div className="sticky bottom-0 z-30 w-full max-w-4xl mx-auto px-4 pt-3 pb-2 mt-4 bg-gradient-to-t from-[#08040e] via-[#08040e]/95 to-transparent">
          {/* Image Validation or Processing Error Banner */}
          {imageError && (
            <div className="mb-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/60 text-xs text-red-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                {imageError}
              </span>
              <button
                type="button"
                onClick={() => setImageError(null)}
                className="text-red-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Selected Image Preview Box (Above Question Box) */}
          {selectedImage && (
            <div className="mb-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-black to-orange-950/80 border border-orange-500/50 shadow-lg flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="relative group w-14 h-14 rounded-xl overflow-hidden border border-purple-500/50 bg-black shrink-0">
                  <img
                    src={selectedImage.dataUrl}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-200 truncate max-w-[200px] sm:max-w-xs">
                      {selectedImage.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300/80 font-mono-code">
                    {selectedImage.sizeFormatted} • Will be analyzed by Gemma 4
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Replace Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Replace with another image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Replace</span>
                </button>

                {/* Remove Image Button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 hover:text-white transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Suggestion Chips above input */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            {learningMode === 'answer_spell' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can you explain this with a funny Halloween-themed analogy?')}
                  className="px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-200 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  🎃 Explain with a Halloween analogy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can you simplify this using 5th-grade vocabulary?')}
                  className="px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-200 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  🧙‍♂️ Simplify to 5th-grade words
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I'm not sure how to start. What is the very first clue?")}
                  className="px-2.5 py-1 rounded-full bg-orange-950/60 hover:bg-orange-900 border border-orange-800 text-orange-200 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  🕯️ What is the very first clue?
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToAnswerSpell}
                  className="px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-700 text-purple-200 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  🔮 I'm ready for the full solution!
                </button>
              </>
            )}
          </div>

          {/* Main Input Form with Image & Camera Buttons Beside Question Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-end gap-2 p-2 rounded-2xl bg-black/80 border border-purple-700/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] focus-within:border-purple-400 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
          >
            {/* Left Action Buttons: Image Upload & Device Camera */}
            <div className="flex items-center gap-1 pb-1 pl-1">
              {/* 1. Upload Image from Device (Homework, Handwritten Math, Diagrams, Screenshots) */}
              <button
                type="button"
                onClick={() => {
                  playPumpkinSound();
                  fileInputRef.current?.click();
                }}
                disabled={isProcessingImage}
                className="p-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800/80 text-purple-200 hover:text-white transition-all cursor-pointer relative group"
                title="Upload photo of homework, handwritten math, diagrams, or screenshots"
              >
                <ImageIcon className="w-4 h-4 text-purple-300 group-hover:text-orange-400 transition-colors" />
                <span className="sr-only">Upload Image</span>
              </button>

              {/* 2. Device Camera (In-app viewfinder on desktop or native camera on mobile) */}
              <button
                type="button"
                onClick={() => {
                  playPumpkinSound();
                  // Check if mobile device; if touch-capable smartphone, can use mobile camera or modal
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile && mobileCameraInputRef.current) {
                    mobileCameraInputRef.current.click();
                  } else {
                    setIsCameraModalOpen(true);
                  }
                }}
                className="p-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800/80 text-purple-200 hover:text-white transition-all cursor-pointer relative group"
                title="Take a picture of homework using device camera"
              >
                <Camera className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
                <span className="sr-only">Take Photo</span>
              </button>
            </div>

            {/* Question Textarea */}
            <textarea
              ref={inputRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedImage
                  ? `Type a question about ${selectedImage.name} (or leave blank to analyze)...`
                  : learningMode === 'answer_spell'
                  ? 'Ask any academic question or attach a homework photo for step-by-step solutions...'
                  : 'Ask a problem or attach a diagram to discover clue-by-clue in Mystery Hint mode...'
              }
              className="flex-1 bg-transparent text-sm text-purple-100 placeholder-purple-400/50 resize-none outline-none px-2 py-1.5 max-h-32 font-sans"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputPrompt.trim() && !selectedImage)}
              className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isLoading || (!inputPrompt.trim() && !selectedImage)
                  ? 'bg-purple-950/40 text-purple-600 border border-purple-950 cursor-not-allowed'
                  : learningMode === 'mystery_spell'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-md shadow-orange-900/50 scale-100 hover:scale-105'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/50 scale-100 hover:scale-105'
              }`}
              title="Cast Spell (Send Message)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Subtitle footer */}
          <div className="flex items-center justify-between text-[11px] text-purple-400/60 px-2 mt-1.5 font-mono-code">
            <span>📷 Attach photos of math, diagrams, homework • Enter to send</span>
            <span>Gemma 4 Verified AI Brain</span>
          </div>
        </div>
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Gemma 4 Status & Diagnostics Modal */}
      <GemmaStatusModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        health={healthStatus}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onTestConnection={handleTestConnection}
        isTesting={isTestingConnection}
        testResult={testResult}
      />
    </div>
  );
}
