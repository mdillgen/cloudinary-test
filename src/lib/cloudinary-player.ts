export const CLOUDINARY_PLAYER_VERSION = "1.11.1";

export const CLOUDINARY_PLAYER_CSS = `https://unpkg.com/cloudinary-video-player@${CLOUDINARY_PLAYER_VERSION}/dist/cld-video-player.min.css`;

export const CLOUDINARY_PLAYER_SCRIPT = `https://unpkg.com/cloudinary-video-player@${CLOUDINARY_PLAYER_VERSION}/dist/cld-video-player.min.js`;

export function isCloudinaryReady(): boolean {
  return typeof window !== "undefined" && "cloudinary" in window;
}

export function buildPlayerOptions() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error(
      "A Cloudinary Cloud name is required, please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set and configured in your environment.",
    );
  }

  return {
    cloud_name: cloudName,
    publicId: "samples/dance-2",
    transformation: [{ quality: "auto" }, { streaming_profile: "hd" }],
    sourceTypes: ["hls"],
    fluid: true,
    controls: false,
    autoplay: true,
    hideContextMenu: true,
    loop: true,
    muted: true,
    width: "960",
    height: "540",
    aspectRatio: "960:540",
  };
}
