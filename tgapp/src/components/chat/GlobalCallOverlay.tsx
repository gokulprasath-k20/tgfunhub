'use client';

import { useEffect, useRef } from 'react';
import { useCall } from '@/providers/CallProvider';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import Image from 'next/image';

export function GlobalCallOverlay() {
  const {
    callState,
    callerInfo,
    localStream,
    remoteStream,
    isVideoCall,
    isMicMuted,
    isVideoMuted,
    answerCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleVideo
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle') return null;

  // --- INCOMING CALL VIEW ---
  if (callState === 'receiving') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-[#e5e5e5] dark:border-[#2a2a2a] animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-6 overflow-hidden border-4 border-[#0a0a0a] dark:border-[#fafafa]">
            <span className="text-3xl font-bold text-[#525252] dark:text-[#a3a3a3]">
              {callerInfo?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-2 text-center">
            {callerInfo?.name}
          </h2>
          <p className="text-[#525252] dark:text-[#a3a3a3] mb-8">
            Incoming {callerInfo?.isVideo ? 'Video' : 'Voice'} Call...
          </p>
          <div className="flex gap-6 w-full justify-center">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={answerCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg animate-pulse"
            >
              {callerInfo?.isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CALLING (OUTGOING) VIEW ---
  if (callState === 'calling') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
          <Phone className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Calling...</h2>
        <p className="text-[#a3a3a3] mb-12">Waiting for answer</p>
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // --- ACTIVE CALL VIEW ---
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Remote Video (Full Screen if video call) */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {isVideoCall ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
             <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-8">
               <Phone className="w-10 h-10 text-[#fafafa]" />
             </div>
             <p className="text-xl font-medium">Voice Call Active</p>
          </div>
        )}
      </div>

      {/* Local Video (Floating PIP) */}
      {isVideoCall && (
        <div className="absolute top-6 right-6 w-32 h-48 md:w-48 md:h-72 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : 'block'}`}
          />
          {isVideoMuted && (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <VideoOff className="w-8 h-8 text-[#525252]" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isMicMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {isVideoCall && (
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-105 shadow-xl mx-2"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
