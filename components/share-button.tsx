'use client'

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
  description: string
}

export function ShareButton({ title, description }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        }).catch(console.error);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link copiado al portapapeles!');
        }).catch(console.error);
      } else {
        // Fallback for older browsers or localhost
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Link copiado al portapapeles!');
        } catch (err) {
          console.error('Unable to copy to clipboard:', err);
          // Last resort: show URL to user
          prompt('Copiar este enlace:', window.location.href);
        }
        document.body.removeChild(textArea);
      }
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={handleShare}>
      <Share2 className="mr-2 h-5 w-5" />
      Compartir artículo
    </Button>
  )
}