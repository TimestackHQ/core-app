
export const MEDIA_HOLDER_TYPES = ["event", "socialProfile"] as const;

export const PRIMITIVE_MEDIA_QUALITY = {
    "lowest": 1,
    "low": 2,
    "medium": 3,
    "high": 4,
    "highest": 5,
    "original": 6
}
export const MEDIA_QUALITY_OPTIONS = [
    "lowest",
    "low",
    "medium",
    "high",
    "highest",
    "original"
] as const;

export const MEDIA_FORMAT_OPTIONS = [
    "mp4",
    "jpeg",
    "jpg",
    "heic",
    "mov",
    "png"
] as const;

export const VIDEO_FORMAT_OPTIONS = [
    "mp4",
    "mov"
] as const;

export const IMAGE_FORMAT_OPTIONS = [
    "jpeg",
    "jpg",
    "heic",
    "jpg"
] as const;

export const MEDIA_STATUSES = [
    "active",
    "blocked"
] as const;

export const MEDIA_TYPES = [
    "video",
    "image"
] as const;

export const MEDIA_GROUP_STATUSES = MEDIA_STATUSES;

export const SOCIAL_PROFILE_STATUSES = ["NONE", "PENDING", "ACTIVE", "BLOCKED"] as const;