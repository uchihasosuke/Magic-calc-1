import { ColorSwatch, Group, Slider } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '@/constants';

interface GeneratedResult {
    expression: string;
    answer: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState<GeneratedResult>();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = brushSize;
            }
        }
    }, []);

    const renderPlainTextToCanvas = (expression: string, answer: string) => {
        console.log('Rendering plain text to canvas:', expression, answer);
        const plainText = `${expression} = ${answer}`;
        console.log('Plain text:', plainText);
        
        // Update the latexExpression state with the new expression
        const newLatexExpressions = [...latexExpression, plainText];
        console.log('New latex expressions:', newLatexExpressions);
        setLatexExpression(newLatexExpressions);
        
        // No longer clearing the canvas to keep the drawn numbers visible
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Ensure canvas background is black
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas background to black if it's not already
                if (!canvas.style.background || canvas.style.background !== 'black') {
                    canvas.style.background = 'black';
                    console.log('Canvas background set to black');
                }
                
                const { offsetX, offsetY } = getOffset(e);
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                setIsDrawing(true);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { offsetX, offsetY } = getOffset(e);
                ctx.lineWidth = brushSize;
                ctx.strokeStyle = isEraser ? 'black' : color;
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Helper to get offsetX and offsetY for both mouse and touch events
    const getOffset = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.nativeEvent.offsetX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.nativeEvent.offsetY;

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top,
        };
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
    };

    const runRoute = async () => {
        console.log('Calculate button clicked');
        const canvas = canvasRef.current;
        if (canvas) {
            try {
                console.log('Sending request to API...');
                console.log('API URL:', `${import.meta.env.VITE_API_URL}/calculate`);
                
                // Get canvas data URL and log its length to check if it's valid
                const dataURL = canvas.toDataURL('image/png');
                console.log('Canvas data URL length:', dataURL.length);
                
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/calculate`, {
                    image: dataURL,
                    dict_of_vars: dictOfVars
                });

                const resp = response.data;
                console.log('Response from API:', resp);
                
                if (!resp.data || resp.data.length === 0) {
                    console.error('No data received from API');
                    setResult({
                        expression: "Error",
                        answer: "No calculation result received"
                    });
                    return;
                }

                console.log('Processing response data:', resp.data);
                
                // Process variables first
                resp.data.forEach((data: Response) => {
                    if (data.assign) {
                        console.log('Assigning variable:', data.expr, 'value:', data.result);
                        setDictOfVars(prev => ({
                            ...prev,
                            [data.expr]: data.result
                        }));
                    }
                });

                // Find the calculation result (non-assign response)
                const calculationResult = resp.data.find((data: Response) => !data.assign);
                if (calculationResult) {
                    console.log('Setting calculation result:', calculationResult);
                    
                    // Handle both string and number results
                    const resultStr = typeof calculationResult.result === 'number' 
                        ? calculationResult.result.toString() 
                        : calculationResult.result;
                    
                    setResult({
                        expression: calculationResult.expr,
                        answer: resultStr
                    });
                    renderPlainTextToCanvas(calculationResult.expr, resultStr);

                    // Calculate position for the result display
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
                    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const i = (y * canvas.width + x) * 4;
                            if (imageData.data[i + 3] > 0) {
                                minX = Math.min(minX, x);
                                minY = Math.min(minY, y);
                                maxX = Math.max(maxX, x);
                                maxY = Math.max(maxY, y);
                            }
                        }
                    }

                    // Position the result below the drawn expression
                    const centerX = (minX + maxX) / 2;
                    const centerY = maxY + 50; // 50 pixels below the bottom of the drawing

                    setLatexPosition({ x: centerX, y: centerY });
                } else {
                    console.error('No calculation result found in response');
                    setResult({
                        expression: "Error",
                        answer: "Could not find calculation result"
                    });
                }
            } catch (error) {
                console.error('Error calculating result:', error);
                setResult({
                    expression: "Error",
                    answer: "Failed to process calculation"
                });
            }
        }
    };

    return (
        <>
            <div className='grid grid-cols-5 gap-2.5'>
                <Button
                    onClick={() => setReset(true)}
                    className='z-20 bg-red-500 text-white p-0.5 text-sm'
                    variant='default'
                    color='red'
                >
                    Reset
                </Button>
                
                <Group className='z-20'>
                    {SWATCHES.map((swatch) => (
                        <ColorSwatch key={swatch} color={swatch} onClick={() => { setColor(swatch); setIsEraser(false); }} />
                    ))}
                </Group>
                
                <Slider
                    value={brushSize}
                    onChange={(value) => setBrushSize(value)}
                    min={1}
                    max={20}
                    label={(value) => `Size: ${value}`}
                    className='z-20 w-5/4'
                />
                <Button
                    onClick={toggleEraser}
                    className='z-20 bg-yellow-500 text-white p-1 text-sm'
                    variant='default'
                >
                    {isEraser ? "Drawing Mode" : "Eraser Mode"}
                </Button>
                <Button
                    onClick={runRoute}
                    className='z-20 bg-green-500 text-white p-0.5 text-sm'
                    variant='default'
                >
                    Calculate
                </Button>
            </div>
            
            {/* Display result */}
            <div className="mt-4 p-2 relative z-30">
                <input
                    type="text"
                    value={result ? `${result.expression} = ${result.answer}` : "Result will be shown here"}
                    readOnly
                    className="p-2 w-full border border-gray-300 rounded"
                />
                {result && (
                    <div className="mt-2 p-4 bg-green-100 border border-green-500 rounded text-center">
                        <span className="text-xl font-bold">
                            {result.expression} = {result.answer}
                        </span>
                    </div>
                )}
            </div>

            <canvas
                ref={canvasRef}
                id="canvas"
                className="absolute top-0 left-0 w-full h-full z-10"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {latexExpression.map((plainText, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <span className="text-lg font-semibold bg-white p-2 rounded shadow-lg z-40 absolute">
                        {plainText}
                    </span>
                </Draggable>
            ))}
        </>
    );
}
