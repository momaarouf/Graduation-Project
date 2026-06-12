import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react'

// Utilities for cropping
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues
    image.src = url
  })

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // set canvas size to match the bounding box
  canvas.width = image.width
  canvas.height = image.height

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(image.width / 2, image.height / 2)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw image
  ctx.drawImage(image, 0, 0)

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0)

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        // give it a default name and type so it mimics a File object closely if needed
        resolve(new File([file], "cropped.jpg", { type: "image/jpeg" }))
      } else {
        resolve(null)
      }
    }, 'image/jpeg')
  })
}

interface ImageCropperModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedBlob: File) => void
  aspectRatio: number // 1 for avatar, 16/9 for cover
}

export default function ImageCropperModal({ isOpen, onClose, imageSrc, onCropComplete, aspectRatio }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return
    setIsProcessing(true)
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob as File)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl surface-card p-6 text-left align-middle shadow-xl transition-all border border-theme">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-black text-theme-primary leading-none tracking-tight">
                    Crop Image
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:surface-section text-theme-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative w-full h-[400px] sm:h-[500px] bg-black rounded-xl overflow-hidden mb-6">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-1/2">
                    <ZoomOut className="w-5 h-5 text-theme-secondary" />
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-primary-light"
                    />
                    <ZoomIn className="w-5 h-5 text-theme-secondary" />
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-theme text-theme-secondary text-sm font-black capitalize tracking-normal hover:surface-section transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-light hover:bg-primary-light-hover text-white text-sm font-black capitalize tracking-normal transition-colors disabled:opacity-50 shadow-md"
                    >
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Apply Crop
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
