import type { CloudinaryVideoPlayer } from "@cloudinary-util/types";

declare global {
  interface Window {
    cloudinary: {
      videoPlayer: (
        element: HTMLVideoElement,
        options: Record<string, unknown>,
      ) => CloudinaryVideoPlayer;
    };
    videojs?: {
      getPlayer?: (element: HTMLVideoElement) => {
        isDisposed?: () => boolean;
        dispose: () => void;
      } | null;
    };
  }
}

export {};
