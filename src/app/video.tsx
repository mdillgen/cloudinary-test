"use client";

import { useEffect, useId, useRef } from "react";
import { buildPlayerOptions, isCloudinaryReady } from "@/lib/cloudinary-player";

type CloudinaryPlayerInstance = {
  dispose?: () => void;
  videojs?: { cloudinary?: { dispose: () => void }; dispose?: () => void };
};

function disposeCloudinaryPlayer(player: CloudinaryPlayerInstance | null) {
  if (!player) {
    return;
  }

  try {
    player.videojs?.cloudinary?.dispose?.();
  } catch {
    // Player may already be partially disposed during route changes.
  }

  try {
    player.videojs?.dispose?.();
  } catch {
    // Ignore secondary dispose failures from video.js teardown.
  }

  try {
    player.dispose?.();
  } catch {
    // Ignore top-level dispose failures from the Cloudinary wrapper.
  }
}

export default function VideoPlayer() {
  const uniqueId = useId();
  const playerId = `player-${uniqueId.replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<CloudinaryPlayerInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let interval: number | undefined;
    let videoElement: HTMLVideoElement | null = null;

    const initPlayer = () => {
      if (disposed || !containerRef.current) {
        return;
      }

      disposeCloudinaryPlayer(playerRef.current);
      playerRef.current = null;

      if (videoElement) {
        videoElement.remove();
      }

      videoElement = document.createElement("video");
      videoElement.id = playerId;
      videoElement.className = "cld-video-player cld-fluid";
      videoElement.width = 960;
      videoElement.height = 540;
      containerRef.current.appendChild(videoElement);

      playerRef.current = window.cloudinary.videoPlayer(
        videoElement,
        buildPlayerOptions(),
      );
    };

    const start = () => {
      if (isCloudinaryReady()) {
        initPlayer();
        return;
      }

      interval = window.setInterval(() => {
        if (isCloudinaryReady()) {
          window.clearInterval(interval);
          initPlayer();
        }
      }, 50);
    };

    start();

    return () => {
      disposed = true;
      if (interval) {
        window.clearInterval(interval);
      }
      disposeCloudinaryPlayer(playerRef.current);
      playerRef.current = null;
      videoElement?.remove();
      videoElement = null;
    };
  }, [playerId]);

  return (
    <div
      ref={containerRef}
      className="w-[50vw] aspect-video bg-slate-600"
    />
  );
}
