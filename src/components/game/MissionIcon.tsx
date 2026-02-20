'use client';

import {
  RotateCcw, RotateCw, RefreshCw, Zap, Ban, PlusCircle, HatGlasses,
  Eye, EyeOff, Award, Shuffle, AlertTriangle, Dices,
  ArrowUpDown, Skull, Target,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type React from 'react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  RotateCcw, RotateCw, RefreshCw, Zap, Ban, PlusCircle, HatGlasses,
  Eye, EyeOff, Award, Shuffle, AlertTriangle, Dices,
  ArrowUpDown, Skull, Target,
};

interface MissionIconProps extends LucideProps {
  name: string;
}

export default function MissionIcon({ name, ...props }: MissionIconProps) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
