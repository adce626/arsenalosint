/**
 * Curated lucide-react icon map. Category content stores icon *names* as
 * strings; this maps them to components so we keep named imports (and
 * therefore tree-shaking) instead of a namespace import.
 */
import {
  Network,
  AtSign,
  DatabaseZap,
  UserSearch,
  ScanFace,
  Mail,
  Crosshair,
  Bug,
  Search,
  ShieldCheck,
  MapPin,
  FileSearch,
  Shield,
  Boxes,
  GraduationCap,
  BookOpen,
  Plane,
  Bitcoin,
  Cpu,
  CircuitBoard,
  Fingerprint,
  Globe,
  LayoutGrid,
  Radar,
  Building2,
  Compass,
  Layers,
  Wrench,
  BugPlay,
  Circle,
} from 'lucide-react';

const ICONS = {
  Network,
  AtSign,
  DatabaseZap,
  UserSearch,
  ScanFace,
  Mail,
  Crosshair,
  Bug,
  Search,
  ShieldCheck,
  MapPin,
  FileSearch,
  Shield,
  Boxes,
  GraduationCap,
  BookOpen,
  Plane,
  Bitcoin,
  Cpu,
  CircuitBoard,
  Fingerprint,
  Globe,
  LayoutGrid,
  Radar,
  Building2,
  Compass,
  Layers,
  Wrench,
  BugPlay,
};

export function getIcon(name) {
  return ICONS[name] ?? Circle;
}
