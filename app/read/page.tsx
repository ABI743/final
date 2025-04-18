"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, VolumeX, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { getEntries } from "@/lib/firebase"
import { format } from "date-fns"

interface Entry {
  id: string
  name: string
  message: string
  signature: string
  timestamp: string
}

export default function ReadPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(true)
  const [pageTransition, setPageTransition] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check if user is authenticated (this would be handled by your auth logic)
    // If not authenticated, redirect to home
    // For now, we'll assume they're authenticated

    const fetchEntries = async () => {
      try {
        const entriesData = await getEntries()
        setEntries(entriesData)
      } catch (error) {
        console.error("Error fetching entries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()

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

  const handleSelectEntry = (entry: Entry) => {
    setPageTransition(true)
    setTimeout(() => {
      setSelectedEntry(entry)
      setPageTransition(false)
    }, 500)
  }

  const handlePrevNext = (direction: "prev" | "next") => {
    if (!selectedEntry || entries.length <= 1) return

    const currentIndex = entries.findIndex((entry) => entry.id === selectedEntry.id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : entries.length - 1
    } else {
      newIndex = currentIndex < entries.length - 1 ? currentIndex + 1 : 0
    }

    handleSelectEntry(entries[newIndex])
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a")
    } catch (error) {
      return "Unknown date"
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
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
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
          <h1 className="font-dancing text-3xl font-bold text-amber-100">Memory Diary</h1>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Entries List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/3"
          >
            <div className="rounded-lg border border-amber-200/30 bg-amber-900/40 p-4 backdrop-blur-sm">
              <h2 className="mb-4 font-dancing text-xl font-bold text-amber-100">Entries</h2>

              {loading ? (
                <p className="text-center text-amber-100">Loading entries...</p>
              ) : entries.length === 0 ? (
                <p className="text-center text-amber-100">No entries found.</p>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <Button
                        key={entry.id}
                        variant="ghost"
                        onClick={() => handleSelectEntry(entry)}
                        className={`w-full justify-start border-b border-amber-200/20 pb-2 text-left font-dancing text-lg ${
                          selectedEntry?.id === entry.id
                            ? "bg-amber-800/40 text-amber-50"
                            : "text-amber-100 hover:bg-amber-900/40"
                        }`}
                      >
                        {entry.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>

          {/* Entry Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-2/3"
          >
            <AnimatePresence mode="wait">
              {selectedEntry ? (
                <motion.div
                  key={selectedEntry.id}
                  initial={{ opacity: 0, rotateY: pageTransition ? 90 : 0 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.5 }}
                  className="relative min-h-[500px] rounded-lg border border-amber-200/30 bg-amber-900/40 p-6 backdrop-blur-sm"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrevNext("prev")}
                      className="h-12 w-12 rounded-full bg-amber-900/60 text-amber-100 backdrop-blur-sm hover:bg-amber-800/80"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrevNext("next")}
                      className="h-12 w-12 rounded-full bg-amber-900/60 text-amber-100 backdrop-blur-sm hover:bg-amber-800/80"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="mx-8">
                    <div className="mb-6 text-center">
                      <h2 className="font-dancing text-2xl font-bold text-amber-100">{selectedEntry.name}'s Entry</h2>
                      <p className="text-sm text-amber-200/70">{formatDate(selectedEntry.timestamp)}</p>
                    </div>

                    <div className="mb-8 rounded bg-amber-50/10 p-4">
                      <p className="whitespace-pre-wrap font-dancing text-lg leading-relaxed text-amber-100">
                        {selectedEntry.message}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="mb-2 text-sm text-amber-200/70">Signature</p>
                      <div className="inline-block rounded bg-amber-50/10 p-4">
                        <img
                          src={selectedEntry.signature || "/placeholder.svg"}
                          alt={`${selectedEntry.name}'s signature`}
                          className="max-h-32"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex min-h-[500px] items-center justify-center rounded-lg border border-amber-200/30 bg-amber-900/40 p-6 backdrop-blur-sm"
                >
                  <p className="font-dancing text-xl font-bold text-amber-100">Select an entry from the list to view</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
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
        <audio ref={audioRef} src="/audio/sft-music.mp3" loop preload="auto" onEnded={() => setIsMusicPlaying(false)} />
      </div>
    </div>
  )
}
