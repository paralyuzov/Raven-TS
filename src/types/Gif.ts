interface GifImageFormat {
  url: string;
  width: string;
  height: string;
  size?: string;
  mp4?: string;
  mp4_size?: string;
  webp?: string;
  webp_size?: string;
  frames?: string;
  hash?: string;
}

export interface GifObject {
  id: string;
  title: string;
  url: string;
  slug?: string;
  bitly_gif_url?: string;
  bitly_url?: string;
  embed_url?: string;
  source?: string;
  rating?: string;
  content_url?: string;
  user?: any;
  source_tld?: string;
  source_post_url?: string;
  is_sticker?: number;
  import_datetime?: string;
  trending_datetime?: string;
  images: {
    fixed_height: GifImageFormat;
    fixed_width: GifImageFormat;
    fixed_width_small: GifImageFormat;
    fixed_height_small: GifImageFormat;
    fixed_width_small_still?: GifImageFormat;
    fixed_height_small_still?: GifImageFormat;
    fixed_width_still?: GifImageFormat;
    fixed_height_still?: GifImageFormat;
    downsized: GifImageFormat;
    downsized_large?: GifImageFormat;
    downsized_medium?: GifImageFormat;
    downsized_small?: GifImageFormat;
    downsized_still?: GifImageFormat;
    original: GifImageFormat;
    original_still?: GifImageFormat;
    original_mp4?: GifImageFormat;
    preview?: GifImageFormat;
    preview_gif: GifImageFormat;
    preview_webp?: GifImageFormat;
    looping?: GifImageFormat;
    hd?: GifImageFormat;
    "4k"?: GifImageFormat;
    "480w_still"?: GifImageFormat;
  };
}

export interface GiphyResponse {
  data: GifObject[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}
