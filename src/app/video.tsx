"use client";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

export default function VideoPlayer() {
  return (
    <div className="w-[50vw] aspect-video bg-slate-600">
      <CldVideoPlayer
        id="dance-2"
        width="960"
        height="540"
        src="samples/dance-2"
        fluid={true}
        controls={false}
        autoplay={true}
        hideContextMenu={true}
        loop={true}
        muted={true}
      />
    </div>
  );
}
