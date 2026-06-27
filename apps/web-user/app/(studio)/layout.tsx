import { studioMetadata } from "../metadata";
import { StudioLayoutClient } from "./studio-layout-client";

export const metadata = studioMetadata;

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayoutClient>{children}</StudioLayoutClient>;
}
