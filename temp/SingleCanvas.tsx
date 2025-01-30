import {
  useState, useRef, useEffect, useCallback,
  useMemo,
} from 'react';
import Color from './Color';
import { getBackgroundSrc, getOutlineSrc } from '../utils/getImgSrc';
// import io from "socket.io-client";

// const socket = io('http://localhost:3869');

const baseWidth: number = 1600;
const basePenWidth: number = 30;

export interface pos {
  x: number;
  y: number;
}

export interface drawingData {
  status: string;
  color: string;
  prevX: number;
  prevY: number;
  curX: number;
  curY: number;
}

const colors: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'erase'];

function SingleCanvas({ templateId }: { templateId: number }): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null); // 캔버스 영역 div

  const bgImgSrc = getBackgroundSrc(templateId);
  const outlineImgSrc = getOutlineSrc(templateId);
  const canvasRatio: number = 1.6; // 캔버스 가로세로 비율
  const outlineCanvasRef = useRef<HTMLCanvasElement>(null); // 그림 윤곽선 레이어
  const canvasRef = useRef<HTMLCanvasElement>(null); // 그림 그리기 레이어
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>(); // 그림 그리기 레이어 context
  const [imageData, setImageData] = useState<string | undefined>(); // 그림 그리기 레이어 추출 이미지

  const [isDrawing, setIsDrawing] = useState<boolean>(false); // 그림 그리기 상태
  const [penColor, setPenColor] = useState<string>('black'); // 펜 색상
  const [isErasing, setIsErasing] = useState<boolean>(false); // 지우개 선택 상태
  const [prevPos, setPrevPos] = useState<pos>({ x: 0, y: 0 }); // 내 그리기 이전 지점

  const palette: JSX.Element[] = [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventTouchScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    // 부모 컨테이너에 이벤트 리스너 추가
    container.addEventListener('touchstart', preventTouchScroll, { passive: false });
    container.addEventListener('touchmove', preventTouchScroll, { passive: false });

    // 정리 함수
    // return () => {
    container.removeEventListener('touchstart', preventTouchScroll);
    container.removeEventListener('touchmove', preventTouchScroll);
    // };
  }, []);

  colors.forEach((color) => {
    palette.push(
      <Color
        key={color}
        color={color}
        setColor={setPenColor}
        setIsErasing={setIsErasing}
      />,
    );
  });

  // 캔버스 크기 변경 가능
  const canvasSize = useMemo(
    () => ({
      width: window.innerHeight * canvasRatio * 0.8,
      height: window.innerHeight * 0.8,
    }),
    [],
  );

  // 상대적 캔버스 크기 비율
  const canvasScale: number = canvasSize.width / baseWidth;

  // 캔버스 배경
  const drawBackgroundImg = useCallback(() => {
    if (!outlineCanvasRef.current) return;
    const context = outlineCanvasRef.current.getContext('2d');
    if (!context) return;

    const img = new Image();
    img.src = outlineImgSrc;
    img.onload = () => {
      context.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
    };
  }, [canvasSize]);

  useEffect(() => {
    drawBackgroundImg();
  }, [drawBackgroundImg]);

  // 드로잉 레이어 설정
  // Canvas에 focus 설정
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.focus();
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.strokeStyle = penColor;
    context.lineWidth = basePenWidth * canvasScale;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    setCtx(context);
  });

  // 펜 색상 변경
  useEffect(() => {
    if (ctx) ctx.strokeStyle = penColor;
  }, [penColor, ctx]);

  // 클릭/터치 좌표 계산
  function getPosition(
    e: MouseEvent | TouchEvent,
  ): pos {
    let x: number = 0;
    let y: number = 0;
    if (e instanceof MouseEvent) {
      x = e.offsetX;
      y = e.offsetY;
    } else {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    return { x, y };
  }

  /* Socket.io 미사용 */
  function startDrawing({ nativeEvent }: { nativeEvent: MouseEvent | TouchEvent }) {
    setIsDrawing(true);
    const { x, y }: pos = getPosition(nativeEvent);
    setPrevPos({ x, y });

    if (!ctx) return;

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      const eraserWidth = basePenWidth * canvasScale * 2;
      ctx.lineWidth = eraserWidth;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.lineWidth = basePenWidth * canvasScale;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function draw({ nativeEvent }: { nativeEvent: MouseEvent | TouchEvent }) {
    const { x, y }: pos = getPosition(nativeEvent);
    if (!ctx) return;
    if (!isDrawing) return;

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      const eraserWidth = basePenWidth * canvasScale * 2;
      ctx.lineWidth = eraserWidth;

      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.lineWidth = basePenWidth * canvasScale;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setPrevPos({ x, y });
  }

  function endDrawing() {
    setIsDrawing(false);
  }

  // 캔버스 로컬에 저장
  function saveCanvas() {
    if (!canvasRef.current) return;
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = canvasSize.width;
    tempCanvas.height = canvasSize.height;

    const bgImg = new Image();
    bgImg.src = bgImgSrc;
    bgImg.onload = () => {
      tempCtx.drawImage(bgImg, 0, 0, canvasSize.width, canvasSize.height);
      tempCtx.drawImage(currentCanvas, 0, 0);

      const outlineImg = new Image();
      outlineImg.src = outlineImgSrc;
      outlineImg.onload = () => {
        tempCtx.drawImage(outlineImg, 0, 0, canvasSize.width, canvasSize.height);
        const dataURL = tempCanvas.toDataURL('image/png');
        setImageData(dataURL);
      };
    };
  }

  return (
    <>
      <div
        className="palette"
        style={{
          width: canvasSize.width,
          height: canvasSize.height * 0.1,
          display: 'flex',
          flexDirection: 'row',
          margin: 0,
        }}
      >
        { palette }
      </div>
      <div
        className="canvas"
        style={{ position: 'relative', height: canvasSize.height }}
        ref={containerRef}
      >
        <canvas
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute', top: 0, left: 0, zIndex: 0, margin: 0,
          }}
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
        />
        <canvas // 윤곽선
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute', top: 0, left: 0, zIndex: 1, margin: 0, pointerEvents: 'none',
          }}
          ref={outlineCanvasRef}
        />
        <div style={{ position: 'absolute', top: '100%' }}>
          <div>
            <button type="button" onClick={saveCanvas}>Save Canvas</button>
          </div>
          <div>
            <img src={imageData} alt="drawing result" />
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleCanvas;
