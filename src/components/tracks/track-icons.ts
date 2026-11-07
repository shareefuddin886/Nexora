import { Bot, Cloud, Cpu, Database, Globe, type LucideIcon } from "lucide-react";
import type { TrackIcon } from "@/lib/tracks/types";

export const TRACK_ICONS: Record<TrackIcon, LucideIcon> = {
  globe: Globe,
  cpu: Cpu,
  database: Database,
  bot: Bot,
  cloud: Cloud,
};
