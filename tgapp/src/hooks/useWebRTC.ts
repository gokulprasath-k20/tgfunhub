'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';

export type CallState = 'idle' | 'calling' | 'receiving' | 'active';

export interface CallerInfo {
  id: string; // The caller's user ID
  name: string;
  signal: any;
  isVideo: boolean;
}

export function useWebRTC() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();

  const [callState, setCallState] = useState<CallState>('idle');
  const [callerInfo, setCallerInfo] = useState<CallerInfo | null>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const targetUserIdRef = useRef<string | null>(null);

  // ICE Servers (STUN/TURN)
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  };

  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setCallerInfo(null);
    targetUserIdRef.current = null;
    setIsVideoCall(false);
    setIsMicMuted(false);
    setIsVideoMuted(false);
  }, [localStream]);

  // Setup Socket Listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleIncomingCall = (data: { signal: any, from: string, name: string, isVideo: boolean }) => {
      if (callState !== 'idle') {
        // User is already in a call, reject automatically
        socket.emit('call_rejected', { to: data.from });
        return;
      }
      setCallerInfo({ id: data.from, name: data.name, signal: data.signal, isVideo: data.isVideo });
      setIsVideoCall(data.isVideo);
      setCallState('receiving');
    };

    const handleCallAccepted = async (signal: any) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallState('active');
      }
    };

    const handleIceCandidate = async (data: { candidate: any, from: string }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    const handleCallRejected = () => {
      alert('Call was rejected or the user is busy.');
      cleanupCall();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_rejected', handleCallRejected);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_rejected', handleCallRejected);
    };
  }, [socket, isConnected, callState, cleanupCall]);

  const initMedia = async (video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get media devices', err);
      alert('Could not access camera or microphone.');
      return null;
    }
  };

  const createPeer = (stream: MediaStream, targetId: string, initiator: boolean) => {
    const peer = new RTCPeerConnection(configuration);

    // Add local tracks to peer
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    // Handle incoming remote tracks
    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', {
          to: targetId,
          candidate: event.candidate
        });
      }
    };

    return peer;
  };

  const callUser = async (targetId: string, isVideo: boolean) => {
    if (!user || !socket) return;
    
    targetUserIdRef.current = targetId;
    setIsVideoCall(isVideo);
    setCallState('calling');

    const stream = await initMedia(isVideo);
    if (!stream) {
      setCallState('idle');
      return;
    }

    const peer = createPeer(stream, targetId, true);
    peerRef.current = peer;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      
      socket.emit('call_user', {
        userToCall: targetId,
        signalData: peer.localDescription,
        from: user.id,
        name: user.username,
        isVideo
      });
    } catch (err) {
      console.error('Error creating offer', err);
      cleanupCall();
    }
  };

  const answerCall = async () => {
    if (!callerInfo || !socket || !user) return;

    targetUserIdRef.current = callerInfo.id;
    const stream = await initMedia(callerInfo.isVideo);
    if (!stream) {
      rejectCall();
      return;
    }

    const peer = createPeer(stream, callerInfo.id, false);
    peerRef.current = peer;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(callerInfo.signal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('answer_call', {
        to: callerInfo.id,
        signal: peer.localDescription
      });

      setCallState('active');
    } catch (err) {
      console.error('Error answering call', err);
      cleanupCall();
    }
  };

  const rejectCall = () => {
    if (callerInfo && socket) {
      socket.emit('call_rejected', { to: callerInfo.id });
    }
    setCallState('idle');
    setCallerInfo(null);
  };

  const endCall = () => {
    if (targetUserIdRef.current && socket) {
      socket.emit('end_call', { to: targetUserIdRef.current });
    }
    cleanupCall();
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  return {
    callState,
    callerInfo,
    localStream,
    remoteStream,
    isVideoCall,
    isMicMuted,
    isVideoMuted,
    callUser,
    answerCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleVideo
  };
}
