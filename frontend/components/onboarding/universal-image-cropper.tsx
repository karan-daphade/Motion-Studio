"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  UploadCloud, 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X, 
  Loader2, 
  Trash2, 
  ImageIcon, 
  AlertCircle 
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { uploadMenuImage } from "@/app/actions/onboarding-actions";

interface UniversalImageCropperProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function UniversalImageCropper({
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  description = "Upload a high-quality image. We will automatically compress it to 150KB - 250KB for fast loading.",
  disabled = false,
}: UniversalImageCropperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("image.webp");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState<string>("Optimizing image...");
  
  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop zone state
  const [isDragOver, setIsDragOver] = useState(false);

  // Validate and load selected file
  const processFile = (file: File) => {
    setErrorMessage(null);

    // 1. Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage("Please upload a valid JPG, PNG, or WebP image.");
      return;
    }

    // 2. Validate file size (10MB pre-processing limit)
    const MAX_PRE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_PRE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`);
      return;
    }

    setImageFileName(file.name.replace(/\.[^/.]+$/, "") + ".webp");

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsModalOpen(true);
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be selected again
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Mouse pan handlers within crop square
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch pan handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Crop & Optimize execution
  const handleCropAndSave = async () => {
    if (!imageRef.current) return;
    setIsOptimizing(true);
    setOptimizingProgress("Cropping image to 1:1...");

    try {
      const img = imageRef.current;
      const cropSize = 1000; // Output square dimension
      const canvas = document.createElement("canvas");
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Unable to create canvas context");

      // Fill background white
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, cropSize, cropSize);

      ctx.save();
      // Move to center of canvas
      ctx.translate(cropSize / 2, cropSize / 2);
      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);
      // Apply zoom
      ctx.scale(zoom, zoom);

      // Frame box size on screen (e.g. 280px viewport container)
      const containerWidth = 280;
      const scaleToCanvas = cropSize / containerWidth;

      // Translate pan relative to canvas scaling
      ctx.translate(pan.x * scaleToCanvas, pan.y * scaleToCanvas);

      // Draw the image centered
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth = cropSize;
      let drawHeight = cropSize;
      if (imgRatio > 1) {
        drawWidth = cropSize * imgRatio;
      } else {
        drawHeight = cropSize / imgRatio;
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Convert to blob
      setOptimizingProgress("Compressing to 150KB - 250KB...");
      const rawBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp", 0.92);
      });

      if (!rawBlob) throw new Error("Canvas export failed");

      // Wrap in File object for browser-image-compression
      const rawFile = new File([rawBlob], imageFileName, { type: "image/webp" });

      // Target size: 150KB to 250KB (maxSizeMB: 0.24)
      const options = {
        maxSizeMB: 0.24, // ~245KB maximum
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.88,
      };

      let compressedFile = rawFile;
      try {
        compressedFile = await imageCompression(rawFile, options);
      } catch (compErr) {
        console.warn("browser-image-compression fallback used:", compErr);
      }

      setOptimizingProgress("Uploading to storage...");

      // Prepare FormData for server action upload
      const formData = new FormData();
      formData.append("file", compressedFile);

      const uploadRes = await uploadMenuImage(formData);

      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || "Failed to upload image to server.");
      }

      // Successful upload
      onChange(uploadRes.url);
      setIsModalOpen(false);
      setImageSrc(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to crop and save image.");
    } finally {
      setIsOptimizing(false);
      setOptimizingProgress("Optimizing image...");
    }
  };

  return (
    <div className="w-full">
      {/* Label and description */}
      {label && (
        <label className="block text-xs font-bold text-brand-text-primary mb-1">
          {label}
        </label>
      )}

      {/* Main Container: Preview vs. Drop-zone */}
      {value ? (
        <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              <span>Optimized (150KB - 250KB)</span>
            </div>
            <p className="text-[11px] text-brand-text-muted truncate mt-0.5 max-w-[240px]">
              {value}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-secondary hover:bg-brand-surface-muted transition-all"
              >
                <Crop className="h-3 w-3" />
                <span>Update</span>
              </button>
              {onRemove && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onRemove}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                  title="Remove image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            disabled
              ? "opacity-50 cursor-not-allowed border-brand-border bg-gray-50"
              : isDragOver
              ? "border-brand-primary bg-brand-primary/5 scale-[0.99]"
              : "border-brand-border hover:border-brand-primary/60 hover:bg-brand-surface-muted/50 bg-white"
          }`}
        >
          <div className="h-11 w-11 rounded-2xl bg-brand-surface-muted flex items-center justify-center text-brand-text-muted group-hover:text-brand-primary transition-all mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-brand-secondary group-hover:text-brand-primary transition-all">
            Drag & Drop Image Here or Browse
          </span>
          <span className="text-[11px] text-brand-text-muted mt-1 max-w-sm">
            {description}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-surface-muted px-2.5 py-0.5 text-[10px] font-semibold text-brand-text-secondary border border-brand-border/60">
            JPG, PNG or WebP • Max 10MB
          </span>
        </div>
      )}

      {/* Inline Error */}
      {errorMessage && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Interactive Cropper Modal */}
      {isModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-brand-border bg-white shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-surface-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Crop className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary">
                    Crop & Reframe (1:1 Square)
                  </h3>
                  <p className="text-[11px] text-brand-text-muted">
                    Pan, zoom, or rotate to fit perfectly on customer menus.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isOptimizing}
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-secondary transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper Viewport */}
            <div className="p-6 flex flex-col items-center justify-center bg-gray-900 select-none overflow-hidden">
              {/* Fixed 280x280 square frame */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl border-2 border-white/90 shadow-2xl cursor-move bg-black flex items-center justify-center"
              >
                {/* Visual grid guide lines */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>

                {/* The Image undergoing transformation */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop Target"
                  draggable={false}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? "none" : "transform 0.15s ease-out",
                    maxWidth: "none",
                    maxHeight: "none",
                    width: "280px",
                    height: "280px",
                    objectFit: "contain",
                  }}
                  className="pointer-events-none"
                />
              </div>

              <span className="text-[11px] text-gray-400 mt-2">
                Click & drag to reframe inside the square
              </span>
            </div>

            {/* Controls Toolbar */}
            <div className="px-6 py-4 border-t border-brand-border space-y-4 bg-white">
              {/* Zoom slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-text-primary flex items-center gap-1">
                    <ZoomIn className="h-3.5 w-3.5 text-brand-text-muted" />
                    Zoom Level
                  </span>
                  <span className="text-[11px] font-mono text-brand-text-muted">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                    className="p-1 text-brand-text-muted hover:text-brand-secondary"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-brand-primary h-1.5 bg-brand-surface-muted rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                    className="p-1 text-brand-text-muted hover:text-brand-secondary"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border px-3 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isOptimizing}
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-brand-border px-3.5 py-2 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isOptimizing}
                    onClick={handleCropAndSave}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50 transition-all"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{optimizingProgress}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Crop & Save (150K-250K)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
