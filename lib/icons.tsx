import { 
  BookOpen, 
  Target, 
  Gamepad2, 
  Shield, 
  Lock, 
  Eye, 
  ArrowRight,
  LucideIcon,
  User,
  Users,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react"

// Icon mapping for dynamic icons from Directus
export const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Target, 
  Gamepad2,
  Shield,
  Lock,
  Eye,
  ArrowRight,
  User,
  Users,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Activity
}

// Get icon component by name
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || BookOpen // Default fallback
}

// Dynamic icon component
interface DynamicIconProps {
  name: string
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = getIcon(name)
  return <IconComponent className={className} />
}