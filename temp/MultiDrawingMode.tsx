import MultiCanvas from '../canvas/MultiCanvas';
import { useDrawing } from '../contexts/DrawingContext';

function MultiDrawingMode(): JSX.Element {
  const {
    templateId,
  } = useDrawing();

  return (
    <div>
      <MultiCanvas templateId={templateId} />
    </div>
  );
}

export default MultiDrawingMode;
