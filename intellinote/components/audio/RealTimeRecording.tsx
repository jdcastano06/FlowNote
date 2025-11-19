"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Mic, Square, Loader2, X, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

interface RealTimeRecordingProps {
  onClose?: () => void;
}

interface Insight {
  keyPoints: string[];
  definitions: string[];
  recap: string;
  timestamp: number;
}

export function RealTimeRecording({ onClose }: RealTimeRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioConfigRef = useRef<SpeechSDK.AudioConfig | null>(null);
  const finalTranscriptionRef = useRef<string>("");
  const transcriptionChunksRef = useRef<string[]>([]); // Store 1-minute chunks
  const contextRef = useRef<string>(""); // Store context from previous chunks
  const previousKeyPointsRef = useRef<string[]>([]); // Store all previous key points
  const lastChunkEndTimeRef = useRef<number>(0);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate insights for the current chunk with retry logic
  const generateInsights = async (chunk: string, retryCount = 0) => {
    if (!chunk.trim() || chunk.trim().length < 20) {
      // Skip if chunk is too short
      return;
    }

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

    setIsGeneratingInsights(true);
    try {
      const response = await fetch("/api/realtime-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: contextRef.current,
          currentChunk: chunk,
          previousPoints: previousKeyPointsRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`);
      }

      const data = await response.json();
      
      // Add new key points to the previous points list
      if (data.keyPoints && Array.isArray(data.keyPoints)) {
        previousKeyPointsRef.current = [
          ...previousKeyPointsRef.current,
          ...data.keyPoints,
        ].slice(-20); // Keep last 20 key points to avoid repetition
      }

      // Update context (keep last 2 chunks as context)
      const recentChunks = transcriptionChunksRef.current.slice(-2).join(" ");
      contextRef.current = recentChunks.slice(-1000); // Limit context size

      // Add new insight with animation
      const newInsight: Insight = {
        ...data,
        timestamp: Date.now(),
      };

      setInsights((prev) => [...prev, newInsight]);
      setIsGeneratingInsights(false);
    } catch (err: any) {
      console.error(`Error generating insights (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, err);
      
      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        console.log(`Retrying insights generation in ${delay}ms...`);
        
        setTimeout(() => {
          generateInsights(chunk, retryCount + 1);
        }, delay);
      } else {
        // Max retries exceeded, stop trying
        console.error("Max retries exceeded for insights generation");
        setIsGeneratingInsights(false);
      }
    }
  };

  // Process 1-minute chunks
  const processChunk = () => {
    const currentTranscription = finalTranscriptionRef.current;
    const chunkStart = lastChunkEndTimeRef.current;
    const chunkEnd = currentTranscription.length;
    
    if (chunkEnd > chunkStart) {
      const chunk = currentTranscription.slice(chunkStart);
      transcriptionChunksRef.current.push(chunk);
      lastChunkEndTimeRef.current = chunkEnd;
      
      // Generate insights for this chunk
      generateInsights(chunk);
    }
  };

  // Initialize Azure Speech SDK
  const initializeRecognizer = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get token from our API
      const tokenResponse = await fetch("/api/speech-token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get speech token");
      }

      const { token, region } = await tokenResponse.json();

      // Create speech config with token
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        token,
        region
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      // Create audio config from default microphone
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      audioConfigRef.current = audioConfig;

      // Create recognizer
      const recognizer = new SpeechSDK.SpeechRecognizer(
        speechConfig,
        audioConfig
      );
      recognizerRef.current = recognizer;

      // Handle recognized events (interim results)
      recognizer.recognizing = (s, e) => {
        if (e.result.text) {
          // Show final transcription + current interim result
          setTranscription(finalTranscriptionRef.current + " " + e.result.text);
        }
      };

      // Handle final recognition results
      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          // Add final result to the transcription
          const finalText = e.result.text.trim();
          if (finalText) {
            finalTranscriptionRef.current = 
              (finalTranscriptionRef.current ? finalTranscriptionRef.current + " " : "") + finalText;
            setTranscription(finalTranscriptionRef.current);
          }
        } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log("No speech could be recognized");
        }
      };

      // Handle errors
      recognizer.canceled = (s, e) => {
        console.error("Recognition canceled:", e.errorDetails);
        if (e.reason === SpeechSDK.CancellationReason.Error) {
          setError(`Recognition error: ${e.errorDetails}`);
          setIsRecording(false);
        }
      };

      // Handle session events
      recognizer.sessionStarted = () => {
        console.log("Session started");
      };

      recognizer.sessionStopped = () => {
        console.log("Session stopped");
        setIsRecording(false);
      };

      setIsConnecting(false);
      return recognizer;
    } catch (err: any) {
      console.error("Error initializing recognizer:", err);
      setError(err.message || "Failed to initialize speech recognition");
      setIsConnecting(false);
      throw err;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setTranscription("");
      setInsights([]);
      finalTranscriptionRef.current = "";
      transcriptionChunksRef.current = [];
      contextRef.current = "";
      previousKeyPointsRef.current = [];
      lastChunkEndTimeRef.current = 0;
      setRecordingTime(0);

      const recognizer = await initializeRecognizer();
      
      // Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("Continuous recognition started");
          setIsRecording(true);
          
          // Start timer for display
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);

          // Start chunk processing timer (every 60 seconds)
          chunkTimerRef.current = setInterval(() => {
            processChunk();
          }, 60000); // 60 seconds = 1 minute
        },
        (err) => {
          console.error("Error starting recognition:", err);
          setError(`Failed to start recording: ${err}`);
          setIsRecording(false);
        }
      );
    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(err.message || "Failed to start recording");
    }
  };

  const stopRecording = () => {
    // Process final chunk before stopping
    if (finalTranscriptionRef.current.length > lastChunkEndTimeRef.current) {
      processChunk();
    }

    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log("Recognition stopped");
          setIsRecording(false);
          
          // Stop timers
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (chunkTimerRef.current) {
            clearInterval(chunkTimerRef.current);
            chunkTimerRef.current = null;
          }
        },
        (err) => {
          console.error("Error stopping recognition:", err);
          setError(`Failed to stop recording: ${err}`);
        }
      );
    }

    // Clean up audio config
    if (audioConfigRef.current) {
      audioConfigRef.current.close();
      audioConfigRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
      if (audioConfigRef.current) {
        audioConfigRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="border border-border/50 bg-card/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRecording 
                  ? "bg-red-500/20 animate-pulse" 
                  : "bg-foreground/5"
              }`}>
                <Mic className={`w-5 h-5 ${
                  isRecording ? "text-red-500" : "text-foreground/60"
                }`} />
              </div>
              <div>
                <h3 className="font-medium text-foreground/90">Live Lecture Recording</h3>
                {isRecording && (
                  <p className="text-xs text-muted-foreground">
                    Recording... {formatTime(recordingTime)}
                    {isGeneratingInsights && " • Generating insights..."}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Side by Side */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Side: Transcription */}
        <Card className="border border-border/50 bg-card/50 flex flex-col overflow-hidden">
          <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-foreground/60" />
              <h4 className="text-sm font-medium text-foreground/80">
                Live Transcription
              </h4>
            </div>
            <div className="flex-1 border border-border/50 rounded-lg p-4 bg-muted/30 overflow-y-auto">
              {transcription ? (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {transcription}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {isRecording
                    ? "Listening... Speak into your microphone."
                    : "Click 'Start Recording' to begin transcribing."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: AI Insights */}
        <Card className="border border-border/50 bg-card/50 flex flex-col overflow-hidden">
          <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-foreground/60" />
              <h4 className="text-sm font-medium text-foreground/80">
                AI Insights
              </h4>
              {isGeneratingInsights && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {insights.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground italic text-center py-8"
                  >
                    {isRecording
                      ? "Insights will appear here every minute..."
                      : "Start recording to see real-time insights"}
                  </motion.div>
                ) : (
                  insights.map((insight, index) => (
                    <motion.div
                      key={insight.timestamp}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="border border-border/50 rounded-lg p-4 bg-muted/30 space-y-3"
                    >
                      {/* Key Points */}
                      {insight.keyPoints && insight.keyPoints.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-foreground/60" />
                            <h5 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                              Key Points
                            </h5>
                          </div>
                          <ul className="space-y-1.5">
                            {insight.keyPoints.map((point, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-xs text-foreground/90 flex gap-2"
                              >
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Definitions / Formulas */}
                      {insight.definitions && insight.definitions.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-foreground/60" />
                            <h5 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                              Definitions / Formulas
                            </h5>
                          </div>
                          <ul className="space-y-1.5">
                            {insight.definitions.map((def, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-xs text-foreground/90 flex gap-2"
                              >
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{def}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recap */}
                      {insight.recap && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="pt-2 border-t border-border/30"
                        >
                          <p className="text-xs font-medium text-foreground/80 mb-1">
                            If you zoned out:
                          </p>
                          <p className="text-xs text-foreground/90 italic">
                            {insight.recap}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border border-destructive/50 bg-destructive/5 rounded-lg p-3"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
