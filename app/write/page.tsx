"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, VolumeX, ArrowLeft, Feather } from "lucide-react"
import SignaturePad from "@/components/signature-pad"
import { saveEntry } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function WritePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [inkColor, setInkColor] = useState("#000000")

  useEffect(() => {
    // Check if user is authenticated (this would be handled by your auth logic)
    // If not authenticated, redirect to home
    // For now, we'll assume they're authenticated

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !message.trim() || !signature) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and sign your entry.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await saveEntry({
        name,
        message,
        signature,
        timestamp: new Date().toISOString(),
      })

      setShowSuccess(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setName("")
        setMessage("")
        setSignature(null)
        setShowSuccess(false)
      }, 3000)

      toast({
        title: "Entry saved!",
        description: "Your message has been added to the diary.",
      })
    } catch (error) {
      toast({
        title: "Error saving entry",
        description: "There was a problem saving your entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-amber-950">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-30">
        <source src="/videos/rw.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-amber-100 hover:bg-amber-900/30 hover:text-amber-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="font-dancing text-3xl font-bold text-amber-100">Write an Entry</h1>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-lg border border-amber-200/30 bg-amber-900/40 p-6 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium text-amber-100">
                Your Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-amber-200/50 bg-amber-900/20 text-amber-50 placeholder:text-amber-200/50"
                  placeholder="Enter your name"
                />
                <Feather className="absolute right-3 top-2 h-5 w-5 text-amber-200/70" />
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-lg font-medium text-amber-100">
                Your Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] border-amber-200/50 bg-amber-900/20 text-amber-50 placeholder:text-amber-200/50"
                placeholder="Write your message here..."
              />
            </div>

            {/* Ink Color Selection */}
            <div className="space-y-2">
              <Label htmlFor="ink-color" className="text-lg font-medium text-amber-100">
                Ink Color
              </Label>
              <div className="flex space-x-4">
                {["#000000", "#0000FF", "#8B4513", "#800080", "#006400"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full ${inkColor === color ? "ring-2 ring-amber-200 ring-offset-2 ring-offset-amber-900" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setInkColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Signature Pad */}
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-lg font-medium text-amber-100">
                Your Signature
              </Label>
              <SignaturePad onSave={setSignature} inkColor={inkColor} signature={signature} />
            </div>

            {/* Submit Button */}
            <div className="pt-4 text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-xs border border-amber-200 bg-amber-900/60 px-8 py-6 text-xl font-bold text-amber-100 hover:bg-amber-800/80"
              >
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          <div className="relative">
            <img src="/images/stamp.png" alt="Saved" className="h-64 w-64" />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform font-dancing text-3xl font-bold text-amber-100">
              Saved!
            </p>
          </div>
        </motion.div>
      )}

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
        <audio ref={audioRef} src="/audio/sft-music.mp3" loop preload="auto" onEnded={() => setIsMusicPlaying(false)} />
      </div>

      <Toaster />
    </div>
  )
}
