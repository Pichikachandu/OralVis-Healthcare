import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

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
        const options = {
          isDrawingMode: false,
          width: 400,
          height: 300,
          backgroundColor: '#f0f0f0',
          preserveObjectStacking: true,
          selection: false,
          renderOnAddRemove: true,
          enableRetinaScaling: true,
        };
        
        const newCanvas = new fabric.Canvas(canvasRef.current, options);
        
        // Verify canvas is properly initialized
        if (!newCanvas || !newCanvas.lowerCanvasEl) {
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
      if (!canvas || !canvas.lowerCanvasEl || !canvas.lowerCanvasEl.getContext) {
        console.error('Canvas not properly initialized for image loading');
        return false;
      }

      try {
        // First, load the image to get its dimensions
        const img = await new Promise((resolve, reject) => {
          if (!url) {
            reject(new Error('No image URL provided'));
            return;
          }
          
          const img = new Image();
          // Add timestamp to prevent caching issues
          const timestamp = new Date().getTime();
          const urlWithCacheBust = url.includes('?') 
            ? `${url}&t=${timestamp}` 
            : `${url}?t=${timestamp}`;
            
          img.crossOrigin = 'Anonymous';
          
          const timeout = setTimeout(() => {
            reject(new Error('Image loading timed out after 30 seconds'));
          }, 30000); // 30 second timeout
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(img);
          };
          
          img.onerror = (e) => {
            clearTimeout(timeout);
            const error = new Error(`Failed to load image from ${url}. Please check:
            1. The URL is correct and accessible
            2. CORS is properly configured on the server
            3. The image exists and is publicly accessible`);
            error.event = e;
            console.error('Image load error:', error);
            reject(error);
          };
          
          // Set src after all handlers are attached
          img.src = urlWithCacheBust;
          
          // src is now set after all handlers are attached
        });

        // Check canvas is still valid after image load
        if (!canvas || !canvas.lowerCanvasEl || !canvas.lowerCanvasEl.getContext) {
          console.log('Canvas was unmounted during image loading');
          return false;
        }

        // Create a new canvas for the background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 300;
        const ctx = tempCanvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get 2D context for temporary canvas');
        }
        
        // Calculate dimensions to maintain aspect ratio
        const scale = Math.min(400 / img.width, 300 / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const offsetX = (400 - newWidth) / 2;
        const offsetY = (300 - newHeight) / 2;
        
        // Draw the image on the temp canvas
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 300);
        
        // Only draw the image if it's valid
        if (img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
        } else {
          console.warn('Image not fully loaded, drawing placeholder');
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(offsetX, offsetY, newWidth, newHeight);
        }
        
        // Convert to data URL and set as background
        const dataUrl = tempCanvas.toDataURL('image/png');
        
        return new Promise((resolve) => {
          // Check canvas is still valid before setting background
          if (!canvas || !canvas.lowerCanvasEl || !canvas.lowerCanvasEl.getContext) {
            console.error('Canvas no longer available for setting background');
            resolve(false);
            return;
          }
          
          fabric.Image.fromURL(dataUrl, (fabricImg) => {
            if (!fabricImg || !canvas || !canvas.lowerCanvasEl) {
              console.error('Failed to create fabric image or canvas is gone');
              resolve(false);
              return;
            }
            
            try {
              // Set the background image with error handling
              canvas.setBackgroundImage(fabricImg, () => {
                try {
                  if (canvas && canvas.renderAll) {
                    canvas.renderAll();
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                } catch (renderErr) {
                  console.error('Error rendering canvas:', renderErr);
                  resolve(false);
                }
              }, {
                originX: 'left',
                originY: 'top',
                crossOrigin: 'anonymous',
                imageSmoothingEnabled: false
              });
            } catch (setBgErr) {
              console.error('Error setting background image:', setBgErr);
              resolve(false);
            }
          }, {
            crossOrigin: 'anonymous'
          });
        });
      } catch (err) {
        console.error('Image loading failed:', err);
        setError(err.message || 'Failed to load image');
        return false;
      }
    };

    let isMounted = true;
    let fabricCanvas = null;
    let loadPromise = Promise.resolve();
    let cleanupTimeout = null;

    // Initialize canvas
    try {
      fabricCanvas = initCanvas();
      if (!fabricCanvas) {
        console.error('Failed to initialize canvas');
        return;
      }
    } catch (err) {
      console.error('Error initializing canvas:', err);
      setError('Failed to initialize canvas. Please refresh the page.');
      return;
    }

    // Function to safely clean up canvas
    const cleanupCanvas = () => {
      try {
        // Remove all event listeners first
        if (typeof fabricCanvas.off === 'function') {
          fabricCanvas.off();
        }
        
        // Clear any pending renders
        if (typeof fabricCanvas.cancelRequestedRender === 'function') {
          fabricCanvas.cancelRequestedRender();
        }
        
        // Clear all objects if possible
        if (typeof fabricCanvas.clear === 'function') {
          try {
            fabricCanvas.clear();
          } catch (clearErr) {
            console.warn('Error clearing canvas:', clearErr);
          }
        }
        
        // Store references to canvas elements before disposal
        const lowerCanvasEl = fabricCanvas.lowerCanvasEl;
        const upperCanvasEl = fabricCanvas.upperCanvasEl;
        const wrapperEl = fabricCanvas.wrapperEl;
        
        // Safely dispose of the canvas
        if (typeof fabricCanvas.dispose === 'function') {
          try {
            fabricCanvas.dispose();
          } catch (disposeErr) {
            console.warn('Error disposing canvas:', disposeErr);
          }
        }
      } catch (err) {
        console.error('Error during canvas cleanup:', err);
      } finally {
        setCanvas(null);
      }
    };

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

    // Cleanup function for when component unmounts
    return () => {
      isMounted = false;
      
      // Use a timeout to ensure any pending operations complete before cleanup
      cleanupTimeout = setTimeout(() => {
        cleanupCanvas();
      }, 100);
    };
  }, [imageUrl]);

  // Handle drawing
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e) => {
      if (e.e.button === 2) return; // Ignore right click
      
      const pointer = canvas.getPointer(e.e);
      drawingState.current.isDrawing = true;
      drawingState.current.startPos = pointer;

      if (tool === 'freehand') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = selectedIssue.color;
        canvas.freeDrawingBrush.width = 2;
        return;
      }

      canvas.isDrawingMode = false;
      let shape;

      switch (tool) {
        case 'rect':
          shape = new fabric.Rect({
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
          shape = new fabric.Circle({
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
          shape = new fabric.Line(
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
          canvas.isDrawingMode = false;
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

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, tool, selectedIssue]);

  const compressImage = (canvas) => {
    return new Promise((resolve) => {
      try {
        if (!canvas || !canvas.lowerCanvasEl) {
          console.error('Canvas is not available for compression');
          resolve(null);
          return;
        }

        // Create a temporary canvas for compression
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width || 400;
        tempCanvas.height = canvas.height || 300;
        
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context for compression');
          resolve(null);
          return;
        }
        
        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the canvas content
        ctx.drawImage(canvas.lowerCanvasEl, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Convert to JPEG with compression
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (err) {
        console.error('Error during image compression:', err);
        // Fallback to original canvas if available
        try {
          if (canvas && canvas.toDataURL) {
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error('Fallback compression failed:', e);
          resolve(null);
        }
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

  return (
    <div className="mb-4">
      <canvas ref={canvasRef} className="border shadow w-full" style={{ width: '400px', height: '300px' }} />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      
      {/* Tool and Issue Selection */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tool Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tool</label>
            <select
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="arrow">Arrow</option>
              <option value="freehand">Freehand</option>
            </select>
          </div>
          
          {/* Issue Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Dental Issue</label>
            <select
              value={selectedIssue.name}
              onChange={(e) => {
                const issue = issues.find(i => i.name === e.target.value) || issues[0];
                setSelectedIssue(issue);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {issues.map((issue) => (
                <option key={issue.name} value={issue.name}>
                  {issue.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Save Button */}
          <div className="space-y-1 flex flex-col">
            <span className="invisible text-sm">Action</span>
            <button
              onClick={handleSave}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                isSaving || isSaveDisabled
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={!!error || isSaving || isSaveDisabled}
            >
              {isSaving ? 'Saving...' : saveButtonText}
            </button>
          </div>
        </div>
        
        {/* Color Preview */}
        <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          <span className="font-medium mr-2">Selected Issue:</span>
          <div 
            className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm mr-2"
            style={{ backgroundColor: selectedIssue.color }}
            title={selectedIssue.name}
          />
          <span className="font-medium">{selectedIssue.name}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-500">
            {selectedIssue.recommendation}
          </span>
        </div>
        
        <p className="text-xs text-gray-500">
          <span className="font-medium">Tip:</span> Use at least 2 different issue types for a comprehensive report.
        </p>
      </div>
    </div>
  )
};

export default AnnotationCanvas;