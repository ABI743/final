"use client"

import { useRef, useState, useEffect } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"

interface SignaturePadProps {
  onSave: (signature: string | null) => void
  inkColor: string
  signature: string | null
}

export default function SignaturePad({ onSave, inkColor = "#000000", signature }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    // If there's an existing signature and the canvas is empty, clear it
    if (signature && sigCanvas.current) {
      setIsEmpty(false)
    }
  }, [signature])

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setIsEmpty(true)
      onSave(null)
    }
  }

  const save = () => {
    if (sigCanvas.current) {
      if (!sigCanvas.current.isEmpty()) {
        const dataURL = sigCanvas.current.toDataURL("image/png")
        onSave(dataURL)
        setIsEmpty(false)
      } else {
        onSave(null)
        setIsEmpty(true)
      }
    }
  }

  const handleEnd = () => {
    save()
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-amber-200/50 bg-amber-50/90 p-2">
        <SignatureCanvas
          ref={sigCanvas}
          penColor={inkColor}
          canvasProps={{
            className: "w-full h-40",
          }}
          onEnd={handleEnd}
          onBegin={handleBegin}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="border-amber-200/50 bg-amber-900/10 text-amber-100 hover:bg-amber-800/30"
        >
          <Eraser className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
