import { useState, useRef, useEffect, useCallback } from "react";

const colors: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'erase'];

function Color(
    color: string,
    setColor: React.Dispatch<React.SetStateAction<string>>,
    isErasing: boolean,
    setIsErasing: React.Dispatch<React.SetStateAction<boolean>>
): JSX.Element {

    if (color === 'erase') {
        return (
            <div
                id='erase'
                className="color"
                onClick={() => {setIsErasing(!isErasing)}}
                style={{flex: 1, background: 'pink'}}
            ></div>
        )
    }
    return (
        <div
            id={color}
            className="color"
            onClick={() => {setColor(color)}}
            style={{flex: 1, background: color}}
        ></div>
    )
}

function Canvas(): JSX.Element {
    // Canvas DOM 요소에 접근
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Canvas의 context
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
    
    // 그리는 중인지 확인
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    // 선택한 색상
    const [color, setColor] = useState<string>('black');
    // 지우개 사용 중인지 확인
    const [isErasing, setIsErasing] = useState<boolean>(false);

    const palette: JSX.Element[] = [];

    colors.map((color) => {
        palette.push(Color(color, setColor, isErasing, setIsErasing));
    });

    // 캔버스 크기 관리
    const [windowSize, setWindowSize] =
        useState<{width: number, height: number}>(
            {
                width: window.innerWidth,
                height: window.innerHeight
            }
        );

    // 화면 크기 변경 시 캔버스 크기 변경
    // TODO : 화면 크기와 무관하게 비율 고정
    const resizeHandler = useCallback(() => {
        setWindowSize({width: window.innerWidth, height: window.innerHeight});
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resizeHandler);
        return () => {
            // eventListener를 제거해 중복 이벤트 방지
            window.removeEventListener('resize', resizeHandler);
        }
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

    return (
        <>
            <div className="palette"
                style={{
                    width: windowSize.width * 0.8,
                    height: windowSize.height * 0.1,
                    display: 'flex',
                    margin: 0
                }}>
                { palette }
            </div>
            <div className="canvas">
                <canvas
                    width={windowSize.width * 0.8}
                    height={windowSize.height * 0.8}
                    style={{margin: 0}}
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
            </div>
        </>
    )
}

export default Canvas;