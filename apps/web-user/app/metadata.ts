import type { Metadata } from "next";

import { APP_NAME, APP_SUBTITLE, APP_TITLE } from "@vokcg/config";
import { STUDIO_APP_URL } from "@vokcg/constants";

export const SEO_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
  `${APP_SUBTITLE} — create AI-powered videos with avatars, voice synthesis, script writing, and publishing tools.`;

export const SEO_KEYWORDS = [
  "AI video generator",
  "AI video creation",
  "text to speech",
  "voice cloning",
  "AI avatar",
  "video studio",
  "script writer",
  APP_NAME,
];

/** Default metadata for the web-user app. */
export const siteMetadata: Metadata = {
  metadataBase: new URL(STUDIO_APP_URL),
  title: {
    default: APP_TITLE,
    template: `%s · ${APP_TITLE}`,
  },
  description: SEO_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: SEO_KEYWORDS,
  authors: [{ name: APP_NAME, url: STUDIO_APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: STUDIO_APP_URL,
    siteName: APP_TITLE,
    title: APP_TITLE,
    description: SEO_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: SEO_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: STUDIO_APP_URL,
  },
};

/** Metadata for authenticated studio routes — keep out of search indexes. */
export const studioMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type PageMetadataOptions = {
  description?: string;
  robots?: Metadata["robots"];
  pathname?: string;
};

/** Build page-level metadata with shared Open Graph and Twitter fields. */
export function createPageMetadata(
  title: string,
  options: PageMetadataOptions = {},
): Metadata {
  const description = options.description ?? SEO_DESCRIPTION;
  const pageTitle = `${title} · ${APP_TITLE}`;
  const canonical = options.pathname
    ? new URL(options.pathname, STUDIO_APP_URL).toString()
    : undefined;

  return {
    title,
    description,
    ...(canonical
      ? {
          alternates: {
            canonical,
          },
        }
      : {}),
    ...(options.robots ? { robots: options.robots } : {}),
    openGraph: {
      title: pageTitle,
      description,
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      title: pageTitle,
      description,
    },
  };
}
