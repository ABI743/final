"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
  src: string
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Play music automatically when component mounts
    const playMusic = () => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Autoplay started successfully
              setIsMusicPlaying(true)
            })
            .catch((error) => {
              // Autoplay was prevented
              console.error("Audio autoplay failed:", error)
              setIsMusicPlaying(false)
            })
        }
      }
    }

    // Small delay to ensure audio element is fully loaded
    const audioTimer = setTimeout(() => {
      playMusic()
    }, 500)

    return () => {
      clearTimeout(audioTimer)
    }
  }, [])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsMusicPlaying(true)
            })
            .catch((error) => {
              console.error("Audio play failed:", error)
            })
        }
      }
    }
  }

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMusic}
        className="h-12 w-12 rounded-full bg-amber-900/60 text-amber-100 backdrop-blur-sm hover:bg-amber-800/80"
      >
        {isMusicPlaying ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </Button>
      <audio ref={audioRef} src={src} loop preload="auto" onEnded={() => setIsMusicPlaying(false)} />
    </div>
  )
}
