import { useState, useRef, useEffect, useCallback } from "react";
import Color from "./Color";

const canvasImg = "/src/assets/canvasBackground.png"
const colors: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'erase'];

function Canvas(): JSX.Element {
    const canvasRatio: number = 1.6;
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    const [imageData, setImageData] = useState<string | undefined>();

    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [color, setColor] = useState<string>('black');
    const [isErasing, setIsErasing] = useState<boolean>(false);

    const palette: JSX.Element[] = [];

    colors.map((color) => {
        palette.push(
            <Color
                key={color}
                color={color}
                setColor={setColor}
                setIsErasing={setIsErasing}
            />);
    });

    // 캔버스 크기 관리
    const [canvasSize, setCanvasSize] =
        useState<{width: number, height: number}>(
            {
                width: window.innerHeight * canvasRatio * 0.8,
                height: window.innerHeight * 0.8
            }
        );

    // 캔버스 배경
    const drawBackgroundImg = useCallback(() => {
        if (!bgCanvasRef.current) return;
        const context = bgCanvasRef.current.getContext('2d');
        if (!context) return;

        const img = new Image();
        img.src = canvasImg;
        img.onload = () => {
            context.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        };

        img.onerror = () => {
            console.log('failed to load background image');
        }
    }, [canvasSize]);

    // 화면 크기 변경 시 캔버스 크기 변경
    const resizeHandler = useCallback(() => {
        const newHeight = window.innerHeight * 0.8;
        const newWidth = newHeight * canvasRatio;
        setCanvasSize({width: newWidth, height: newHeight});

        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                setCtx(context);
            }
        }
    }, []);

    // useEffect(() => {
    //     window.addEventListener('resize', resizeHandler);
    //     return () => {
    //         // eventListener를 제거해 중복 이벤트 방지
    //         window.removeEventListener('resize', resizeHandler);
    //     }
    // }, [resizeHandler]);

    useEffect(() => {
        drawBackgroundImg();
    }, [drawBackgroundImg]);

    // 드로잉 레이어 설정
    useEffect(() => {
        if (!canvasRef.current) return;
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        context.strokeStyle = color;
        context.lineWidth = 10;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        setCtx(context);
    })

    // Canvas에 focus 설정
    useEffect(() => {
        const currentRef = canvasRef.current;
        if (currentRef !== null) {
            currentRef.focus();
            
            const context = currentRef.getContext('2d');
            if (context !== null) {
                context.strokeStyle = color;
                context.lineWidth = 10;
                context.lineJoin = 'round';
                context.lineCap = 'round';
                setCtx(context);
            }
        }
    });

    // 펜 색상 변경
    useEffect(() => {
        if (ctx) ctx.strokeStyle = color;
    }, [color, ctx]);

    // 클릭/터치 좌표 계산
    function getPosition(
        e: MouseEvent | TouchEvent
    ): {x: number, y: number} {
        let x: number = 0;
        let y: number = 0;
        if (e instanceof MouseEvent) {
            x = e.offsetX;
            y = e.offsetY;
        } else {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        return {x, y};
    }

    function startDrawing() {
        setIsDrawing(true);
    }

    function draw({nativeEvent}: {nativeEvent: MouseEvent | TouchEvent}) {
        const { x, y }: {x: number, y: number} = getPosition(nativeEvent);
        if (ctx) {
            if (!isDrawing) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                if (!isErasing) {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else {
                    ctx.clearRect(x - 20, y - 20, 40, 40);
                }
            }
        }
    }

    function endDrawing() {
        setIsDrawing(false);
    }

    function saveCanvas() {
        if (!canvasRef.current) return;
        const currentCanvas = canvasRef.current;
        if (!currentCanvas) return;

        const dataURL = currentCanvas.toDataURL('image/png');
        setImageData(dataURL);

        // 로컬에 파일로 저장
        // const link = document.createElement('a');
        // link.download = 'image.png';
    
        // link.href = dataURL;
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    }

    return (
        <>
            <div className="palette"
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height * 0.1,
                    display: 'flex',
                    flexDirection: 'row',
                    margin: 0
                }}>
                { palette }
            </div>
            <div className="canvas" style={{position: 'relative', height: canvasSize.height}}>
                <canvas
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{position: 'absolute', top: 0, left: 0, zIndex: 0, margin: 0}}
                    ref={bgCanvasRef}
                />
                <canvas
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{position: 'absolute', top: 0, left: 0, zIndex: 1, margin: 0}}
                    tabIndex={0}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    onTouchCancel={endDrawing}
                    ref={canvasRef}
                ></canvas>
                <div style={{position: 'absolute', top: '100%'}}>
                    <div>
                        <button onClick={saveCanvas}>Save Canvas</button>
                    </div>
                    <div>
                        <img src={imageData}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Canvas;