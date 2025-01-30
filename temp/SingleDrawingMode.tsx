import SingleCanvas from '../canvas/SingleCanvas';
import { useDrawing } from '../contexts/DrawingContext';

function SingleDrawingMode(): JSX.Element {
  const {
    templateId,
  } = useDrawing();

  return (
    <div>
      <SingleCanvas templateId={templateId} />
    </div>
  );
}

export default SingleDrawingMode;
