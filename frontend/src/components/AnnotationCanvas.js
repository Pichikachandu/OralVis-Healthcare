import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, Line, FabricImage, PencilBrush } from 'fabric';

const issues = [
  { name: 'Inflamed / Red gums', color: '#800080', recommendation: 'Scaling.' },
  { name: 'Malaligned', color: '#FFFF00', recommendation: 'Braces or Clear Aligner.' },
  { name: 'Receded gums', color: '#A52A2A', recommendation: 'Gum Surgery.' },
  { name: 'Stains', color: '#FF0000', recommendation: 'Teeth cleaning and polishing.' },
  { name: 'Attrition', color: '#00FFFF', recommendation: 'Filling/Night Guard.' },
  { name: 'Crowns', color: '#FF00FF', recommendation: 'If the crown is loose or broken, better get it checked. Tooth coloured caps are the best ones.' },
];

const AnnotationCanvas = ({
  imageUrl,
  annotations,
  onSave,
  saveButtonText = 'Save Annotations',
  isSaveDisabled = false
}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 300 });
  const [tool, setTool] = useState('rect');
  const [selectedIssue, setSelectedIssue] = useState(issues[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const drawingState = useRef({
    isDrawing: false,
    startPos: null,
    currentShape: null
  });

  // Initialize canvas and load image
  useEffect(() => {
    if (!canvasRef.current) {
      console.error('Canvas ref is not attached to any element');
      return;
    }

    const initCanvas = () => {
      try {
        // Ensure canvas element exists
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        // In Fabric.js v6, Canvas constructor expects the element directly
        const newCanvas = new Canvas(canvasRef.current, {
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          selection: false,
        });

        // Verify canvas is properly initialized
        if (!newCanvas) {
          throw new Error('Failed to initialize canvas element');
        }

        return newCanvas;
      } catch (err) {
        console.error('Canvas initialization failed:', err);
        setError('Failed to initialize canvas. Please refresh and try again.');
        return null;
      }
    };

    const loadImage = async (url, canvas) => {
      // Double-check canvas is still valid
      if (!canvas) {
        console.error('Canvas not properly initialized for image loading');
        return false;
      }

      if (!url) {
        console.error('No image URL provided');
        return false;
      }

      try {
        // Add timestamp to bypass cache and avoid CORS issues with cached non-CORS responses
        const timestampUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        console.log('Loading image via FabricImage.fromURL:', timestampUrl);

        // Use Fabric's built-in async loader
        const fabricImg = await FabricImage.fromURL(timestampUrl, {
          crossOrigin: 'anonymous'
        });

        // Calculate dimensions to fit width 400 while maintaining aspect ratio
        const aspectRatio = fabricImg.height / fabricImg.width;
        const newHeight = 400 * aspectRatio;

        // If dimensions need to change, update state and abort loading
        // The component will re-render with new dimensions, and we'll load the image again
        if (Math.abs(canvasDimensions.height - newHeight) > 1) {
          console.log(`Adjusting canvas height from ${canvasDimensions.height} to ${newHeight}`);
          setCanvasDimensions({ width: 400, height: newHeight });
          return false;
        }

        // Scale image to fit canvas width exactly
        fabricImg.scaleToWidth(400);

        // Position at 0,0
        fabricImg.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
        });

        console.log('Image properties:', {
          visible: fabricImg.visible,
          opacity: fabricImg.opacity,
          width: fabricImg.width,
          height: fabricImg.height,
          left: fabricImg.left,
          top: fabricImg.top,
          scaleX: fabricImg.scaleX,
          scaleY: fabricImg.scaleY
        });

        // Add image as an object
        canvas.add(fabricImg);
        // canvas.sendObjectToBack(fabricImg); // Temporarily disable to ensure it's on top

        // Store reference to background image if needed later
        canvas.backgroundImageObject = fabricImg;

        canvas.renderAll(); // Force synchronous render

        console.log('Image loaded and rendered. Canvas objects:', canvas.getObjects().length);
        return true;

      } catch (err) {
        console.error('Image loading failed:', err);
        setError('Failed to load image');
        return false;
      }
    };


    let isMounted = true;
    let fabricCanvas = null;
    let loadPromise = Promise.resolve();

    // Function to safely clean up canvas
    const cleanupCanvas = (canvasInstance) => {
      if (!canvasInstance) return;

      try {
        // Dispose the canvas - this is critical for Fabric.js v6
        if (typeof canvasInstance.dispose === 'function') {
          canvasInstance.dispose().catch(e => console.warn('Dispose error:', e));
        }
      } catch (err) {
        console.error('Error during canvas cleanup:', err);
      }
    };

    // Initialize canvas
    try {
      // If canvas element is missing or already has classes, we might have a problem
      // But let's trust dispose() to have cleaned up, or React to have replaced it
      if (!canvasRef.current) {
        return () => { isMounted = false; };
      }

      fabricCanvas = initCanvas();
      if (!fabricCanvas) {
        console.error('Failed to initialize canvas');
        return () => {
          isMounted = false;
        };
      }
    } catch (err) {
      console.error('Error initializing canvas:', err);
      setError('Failed to initialize canvas. Please refresh the page.');
      return () => {
        isMounted = false;
      };
    }

    // Load image if URL is provided
    if (imageUrl) {
      loadPromise = loadImage(imageUrl, fabricCanvas)
        .then((success) => {
          if (!isMounted || !fabricCanvas) return false;

          if (success) {
            setCanvas(fabricCanvas);
            return true;
          }
          return false;
        })
        .catch(err => {
          console.error('Error in image loading:', err);
          setError('Failed to load image. Please try again.');
          return false;
        });
    } else {
      // If no image URL, just set the empty canvas
      setCanvas(fabricCanvas);
    }

    // Handle any errors during the loading process
    loadPromise.catch(err => {
      console.error('Error in canvas setup:', err);
      if (isMounted) {
        setError('Failed to set up canvas. Please refresh the page.');
      }
    });

    // Cleanup function - MUST be synchronous for React StrictMode
    return () => {
      isMounted = false;
      setCanvas(null);

      // Synchronously clean up the canvas
      if (fabricCanvas) {
        cleanupCanvas(fabricCanvas);
        fabricCanvas = null;
      }
    };
  }, [imageUrl, canvasDimensions]);

  // Handle drawing
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e) => {
      if (e.e.button === 2) return; // Ignore right click

      const pointer = canvas.getPointer(e.e);
      drawingState.current.isDrawing = true;
      drawingState.current.startPos = pointer;

      if (tool === 'freehand') {
        // In Fabric.js v6, we need to create a PencilBrush instance
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new PencilBrush(canvas);
        }
        canvas.freeDrawingBrush.color = selectedIssue.color;
        canvas.freeDrawingBrush.width = 2;
        canvas.isDrawingMode = true;
        return;
      }

      canvas.isDrawingMode = false;
      let shape;

      switch (tool) {
        case 'rect':
          shape = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
            fill: 'transparent',
            stroke: selectedIssue.color,
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          break;
        case 'circle':
          shape = new Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 1,
            fill: 'transparent',
            stroke: selectedIssue.color,
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          break;
        case 'arrow':
          shape = new Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: selectedIssue.color,
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          break;
        default:
          return;
      }

      canvas.add(shape);
      drawingState.current.currentShape = shape;
    };

    const handleMouseMove = (e) => {
      if (!drawingState.current.isDrawing || !drawingState.current.currentShape) return;

      const pointer = canvas.getPointer(e.e);
      const { startPos, currentShape } = drawingState.current;

      if (tool === 'rect') {
        currentShape.set({
          width: Math.abs(pointer.x - startPos.x),
          height: Math.abs(pointer.y - startPos.y),
          left: Math.min(pointer.x, startPos.x),
          top: Math.min(pointer.y, startPos.y),
        });
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startPos.x, 2) +
          Math.pow(pointer.y - startPos.y, 2)
        ) / 2;
        currentShape.set({
          radius,
          left: startPos.x,
          top: startPos.y,
        });
      } else if (tool === 'arrow') {
        currentShape.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      if (drawingState.current.isDrawing) {
        if (tool === 'freehand') {
          // Don't turn off isDrawingMode here - let path:created handle it
          // canvas.isDrawingMode will stay true until we change tools
        } else if (drawingState.current.currentShape) {
          // Make the shape selectable and add it to the canvas's object list
          const shape = drawingState.current.currentShape;
          shape.set({
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockRotation: true,
            lockScalingFlip: true,
            // Add metadata for the issue type
            data: {
              issue: selectedIssue
            }
          });

          // Force the canvas to update
          canvas.renderAll();
        }
      }

      drawingState.current.isDrawing = false;
      drawingState.current.currentShape = null;
    };

    // Handle freehand drawings when they are completed
    const handlePathCreated = (e) => {
      if (e.path) {
        // Add metadata to the freehand path
        e.path.set({
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockRotation: true,
          lockScalingFlip: true,
          data: {
            issue: selectedIssue
          }
        });
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('path:created', handlePathCreated);
    };
  }, [canvas, tool, selectedIssue]);

  const compressImage = async (canvas) => {
    return new Promise(async (resolve) => {
      try {
        if (!canvas) {
          console.error('Canvas is not available for compression');
          resolve(null);
          return;
        }

        console.log('Creating temporary canvas for export...');
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.getWidth ? canvas.getWidth() : 400;
        tempCanvas.height = canvas.getHeight ? canvas.getHeight() : 300;
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) {
          console.error('Could not get 2D context');
          resolve(null);
          return;
        }

        // Fill with white background first
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // First try to use the already-loaded background image from the canvas
        // This is faster and doesn't require CORS
        let backgroundDrawn = false;
        if (canvas.backgroundImage && canvas.backgroundImage._element) {
          try {
            console.log('Using already-loaded background image from canvas...');
            const bgImg = canvas.backgroundImage;
            const scale = bgImg.scaleX || 1;
            const scaledWidth = bgImg.width * scale;
            const scaledHeight = bgImg.height * scale;
            const left = bgImg.left || 0;
            const top = bgImg.top || 0;

            ctx.drawImage(bgImg._element, left, top, scaledWidth, scaledHeight);
            console.log('✓ Background image drawn from canvas successfully!');
            backgroundDrawn = true;
          } catch (canvasImgErr) {
            console.warn('Could not use canvas background image:', canvasImgErr);
          }
        }

        // If we couldn't use the canvas background, try reloading with CORS as fallback
        if (!backgroundDrawn && imageUrl) {
          try {
            console.log('Canvas background not available, reloading with CORS...', imageUrl);
            const bgImage = await new Promise((resolveImg, rejectImg) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';

              const timeout = setTimeout(() => {
                console.error('Background image load TIMED OUT after 30 seconds for:', imageUrl);
                resolveImg(null);
              }, 30000); // Increased to 30 seconds

              img.onload = () => {
                clearTimeout(timeout);
                console.log('Background image loaded successfully!', {
                  width: img.width,
                  height: img.height,
                  url: imageUrl
                });
                resolveImg(img);
              };

              img.onerror = (err) => {
                clearTimeout(timeout);
                console.error('Background image FAILED TO LOAD with CORS:', {
                  url: imageUrl,
                  error: err,
                  message: 'This is likely a CORS issue. Check S3 bucket CORS configuration.'
                });
                resolveImg(null);
              };

              console.log('Starting image load with crossOrigin=anonymous...');
              img.src = imageUrl;
            });

            if (bgImage) {
              // Calculate scaling to fit canvas
              const scale = Math.min(
                tempCanvas.width / bgImage.width,
                tempCanvas.height / bgImage.height
              );
              const scaledWidth = bgImage.width * scale;
              const scaledHeight = bgImage.height * scale;
              const offsetX = (tempCanvas.width - scaledWidth) / 2;
              const offsetY = (tempCanvas.height - scaledHeight) / 2;

              ctx.drawImage(bgImage, offsetX, offsetY, scaledWidth, scaledHeight);
              console.log('✓ Background image drawn successfully via CORS reload');
              backgroundDrawn = true;
            } else {
              console.warn('⚠ Background image failed to load - using WHITE background for export');
            }
          } catch (bgErr) {
            console.error('Exception while loading background image for export:', bgErr);
          }
        }

        if (!backgroundDrawn) {
          console.warn('⚠ No background image available - using WHITE background for export');
        }

        console.log('Drawing annotations...');
        const objects = canvas.getObjects ? canvas.getObjects() : [];
        console.log(`Found ${objects.length} objects on canvas`);

        const annotationObjects = objects.filter(obj => obj.data?.issue);
        console.log(`Found ${annotationObjects.length} annotation objects`);

        annotationObjects.forEach((obj, index) => {
          console.log(`Drawing annotation ${index}:`, obj.type);
          try {
            if (obj.type === 'rect') {
              ctx.strokeStyle = obj.stroke;
              ctx.lineWidth = obj.strokeWidth;
              ctx.strokeRect(obj.left, obj.top, obj.width * (obj.scaleX || 1), obj.height * (obj.scaleY || 1));
            } else if (obj.type === 'circle') {
              ctx.beginPath();
              ctx.arc(obj.left, obj.top, obj.radius, 0, 2 * Math.PI);
              ctx.strokeStyle = obj.stroke;
              ctx.lineWidth = obj.strokeWidth;
              ctx.stroke();
            } else if (obj.type === 'line') {
              ctx.beginPath();
              ctx.moveTo(obj.x1, obj.y1);
              ctx.lineTo(obj.x2, obj.y2);
              ctx.strokeStyle = obj.stroke;
              ctx.lineWidth = obj.strokeWidth;
              ctx.stroke();
            } else if (obj.type === 'path') {
              console.log('Drawing freehand path...');
              ctx.strokeStyle = obj.stroke;
              ctx.lineWidth = obj.strokeWidth || 2;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              if (obj.path && obj.path.length > 0) {
                ctx.beginPath();
                obj.path.forEach((point) => {
                  const command = point[0];
                  if (command === 'M') {
                    ctx.moveTo(point[1] + (obj.left || 0), point[2] + (obj.top || 0));
                  } else if (command === 'L') {
                    ctx.lineTo(point[1] + (obj.left || 0), point[2] + (obj.top || 0));
                  } else if (command === 'Q') {
                    ctx.quadraticCurveTo(
                      point[1] + (obj.left || 0), point[2] + (obj.top || 0),
                      point[3] + (obj.left || 0), point[4] + (obj.top || 0)
                    );
                  }
                });
                ctx.stroke();
              }
            }
          } catch (drawErr) {
            console.error('Error drawing annotation:', drawErr);
          }
        });

        console.log('Converting to data URL...');
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
        console.log('Compression successful, data URL length:', dataUrl.length);
        resolve(dataUrl);
      } catch (err) {
        console.error('Error during image compression:', err, err.stack);
        resolve(null);
      }
    });
  };

  const handleSave = async () => {
    if (!canvas) {
      setError('Canvas not initialized');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Get all objects except the background image
      const objects = canvas.getObjects();
      const annotations = objects.filter(obj => obj.data?.issue);

      if (annotations.length === 0) {
        throw new Error('Please add at least one annotation');
      }

      // Create a JSON representation of the canvas with only the annotations
      const json = {
        objects: annotations.map(obj => ({
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width || (obj.radius ? obj.radius * 2 : 0) || 0,
          height: obj.height || (obj.radius ? obj.radius * 2 : 0) || 0,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          fill: obj.fill,
          data: obj.data,
          // Include path data for freehand drawings
          path: obj.path ? obj.path.map(p => p.join(' ')).join(' ') : null
        })),
        backgroundImage: canvas.backgroundImage ? canvas.backgroundImage.toObject() : null
      };

      // Get the canvas as base64 image
      console.log('Starting image compression...');
      const base64 = await compressImage(canvas);
      if (!base64) {
        throw new Error('Failed to process image');
      }
      console.log('Image compression successful');

      if (onSave) {
        console.log('Calling onSave callback...');
        await onSave(json, base64);
        console.log('onSave callback completed');
        return true;
      } else {
        console.warn('No onSave handler provided to AnnotationCanvas');
        return false;
      }
    } catch (err) {
      console.error('Save failed:', err);
      const errorMsg = err.message || 'Failed to save annotations';
      setError(errorMsg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Responsive scaling logic
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        // Calculate scale needed to fit canvas into parent width
        // Cap scale at 1 (don't scale up, only down) to prevent blurriness
        // Default to 1 if parentWidth is 0 to avoid hiding the canvas
        const newScale = parentWidth ? Math.min(parentWidth / canvasDimensions.width, 1) : 1;
        setScale(newScale);
      }
    };

    // Initial calculation
    updateScale();

    // Observe resize
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [canvasDimensions.width]);

  return (
    <div className="bg-white dark:bg-surface/50 p-4 rounded-xl shadow-md border border-gray-100 dark:border-border-color/50 h-full flex flex-col backdrop-blur-sm">
      {/* Canvas Section */}
      <div
        ref={containerRef}
        className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 mb-4 flex-grow flex items-center justify-center overflow-hidden relative"
        style={{ minHeight: `${canvasDimensions.height * scale + 24}px` }} // Reserve height based on scale + padding
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            flexShrink: 0
          }}
        >
          <canvas
            ref={canvasRef}
            className="border-2 border-blue-100 dark:border-slate-600 rounded shadow-sm block"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Clinical Controls Section */}
      <div className="space-y-4">
        {/* Control Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Drawing Tool */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-text-secondary uppercase tracking-wider">
                Tool
              </label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full px-2 py-2 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="arrow">Arrow</option>
                <option value="freehand">Freehand</option>
              </select>
            </div>

            {/* Clinical Issue */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-text-secondary uppercase tracking-wider">
                Finding
              </label>
              <select
                value={selectedIssue.name}
                onChange={(e) => {
                  const issue = issues.find(i => i.name === e.target.value) || issues[0];
                  setSelectedIssue(issue);
                }}
                className="w-full px-2 py-2 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {issues.map((issue) => (
                  <option key={issue.name} value={issue.name}>
                    {issue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full px-4 py-2.5 text-sm font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition-all duration-200 ${isSaving || isSaveDisabled
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-200 dark:border-slate-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            disabled={!!error || isSaving || isSaveDisabled}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Clinical Observation Summary */}
        <div className="bg-blue-50/50 dark:bg-slate-800/50 px-3 py-2 rounded border border-blue-100 dark:border-slate-700 flex items-center">
          <div
            className="w-4 h-4 rounded border border-gray-300 dark:border-slate-600 shadow-sm mr-2 flex-shrink-0"
            style={{ backgroundColor: selectedIssue.color }}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
              {selectedIssue.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
              {selectedIssue.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationCanvas;