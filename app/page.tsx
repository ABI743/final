"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Music } from "lucide-react"
import PasswordModal from "@/components/password-modal"

export default function LandingPage() {
  const router = useRouter()
  const [showText, setShowText] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [readModalOpen, setReadModalOpen] = useState(false)
  const [writeModalOpen, setWriteModalOpen] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(true) // Default to true for UI
  const [autoplayFailed, setAutoplayFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoplayAttempted = useRef(false)

  useEffect(() => {
    // Start the handwritten animation after a short delay
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 1000)

    // Show the buttons after the text animation completes
    const buttonTimer = setTimeout(() => {
      setShowButtons(true)
    }, 5000)

    // Attempt to play music with multiple retries
    const attemptAutoplay = () => {
      if (!audioRef.current || autoplayAttempted.current) return

      autoplayAttempted.current = true

      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Autoplay successful")
            setIsMusicPlaying(true)
            setAutoplayFailed(false)
          })
          .catch((error) => {
            console.error("Autoplay failed:", error)
            setIsMusicPlaying(false)
            setAutoplayFailed(true)
          })
      }
    }

    // Try autoplay after a short delay to ensure audio is loaded
    const autoplayTimer = setTimeout(() => {
      attemptAutoplay()
    }, 1000)

    // Add a click event listener to the document to enable audio after first interaction
    const enableAudioOnInteraction = () => {
      if (audioRef.current && autoplayFailed) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsMusicPlaying(true)
              setAutoplayFailed(false)
            })
            .catch((error) => {
              console.error("Play after interaction failed:", error)
            })
        }
      }
      // Remove the event listener after first interaction
      document.removeEventListener("click", enableAudioOnInteraction)
    }

    document.addEventListener("click", enableAudioOnInteraction)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(buttonTimer)
      clearTimeout(autoplayTimer)
      document.removeEventListener("click", enableAudioOnInteraction)
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
              setAutoplayFailed(false)
            })
            .catch((error) => {
              console.error("Audio play failed:", error)
            })
        }
      }
    }
  }

  const handleReadSuccess = () => {
    setReadModalOpen(false)
    router.push("/read")
  }

  const handleWriteSuccess = () => {
    setWriteModalOpen(false)
    router.push("/write")
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-60">
        <source src="/videos/load.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        {/* Animated Text */}
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="mb-16 text-center"
            >
              <h1 className="font-dancing text-4xl font-bold text-amber-100 md:text-6xl">
                <TypewriterEffect text="hello.. this is Abin ,welcome to my 📜.." />
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-8 flex flex-col gap-6 sm:flex-row"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setReadModalOpen(true)}
                className="border-amber-200 bg-amber-900/30 px-8 py-6 text-xl font-bold text-amber-100 backdrop-blur-sm transition-all hover:bg-amber-800/50 hover:text-amber-50"
              >
                Read Entries
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setWriteModalOpen(true)}
                className="border-amber-200 bg-amber-900/30 px-8 py-6 text-xl font-bold text-amber-100 backdrop-blur-sm transition-all hover:bg-amber-800/50 hover:text-amber-50"
              >
                Write an Entry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Music Prompt - Only show if autoplay failed */}
        {autoplayFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 transform rounded-lg bg-amber-900/90 px-4 py-2 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-amber-100" />
              <p className="text-amber-100">Click anywhere to enable music</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Music Player */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className="h-12 w-12 rounded-full bg-amber-900/60 text-amber-100 backdrop-blur-sm hover:bg-amber-800/80"
        >
          {isMusicPlaying ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </Button>
        <audio ref={audioRef} src="/audio/page.mp3" loop preload="auto" />
      </div>

      {/* Password Modals */}
      <PasswordModal
        isOpen={readModalOpen}
        onClose={() => setReadModalOpen(false)}
        onSuccess={handleReadSuccess}
        mode="read"
      />

      <PasswordModal
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onSuccess={handleWriteSuccess}
        mode="write"
      />
    </div>
  )
}

// Typewriter Effect Component
function TypewriterEffect({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const index = useRef(0)

  useEffect(() => {
    if (index.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index.current))
        index.current += 1
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [displayedText, text])

  return <span>{displayedText}</span>
}
