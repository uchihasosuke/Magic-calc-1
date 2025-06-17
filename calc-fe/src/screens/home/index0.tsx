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
        const plainText = `${expression} = ${answer}`;
        setLatexExpression([...latexExpression, plainText]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
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
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx) {
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
        const canvas = canvasRef.current;
        if (canvas) {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/calculate`, {
                image: canvas.toDataURL('image/png'),
                dict_of_vars: dictOfVars
            });

            const resp = response.data;
            console.log('Response', resp);
            resp.data.forEach((data: Response) => {
                if (data.assign) {
                    setDictOfVars(prev => ({
                        ...prev,
                        [data.expr]: data.result
                    }));
                }
            });

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

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                    renderPlainTextToCanvas(data.expr, data.result);
                }, 1000);
            });
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
            <canvas
    ref={canvasRef}
    id="canvas"
    className="absolute top-0 left-0 w-full h-full"
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
                    <div className="absolute p-2 text-white rounded shadow-md">
                        <div>{plainText}</div>
                    </div>
                </Draggable>
            ))}
        </>
    );
}
