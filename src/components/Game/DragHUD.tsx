import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export function DragHUD() {
  const { dragStats, environment } = useStore();

  if (environment !== 'drag') return null;

  return (
    <div className="drag-hud glass-panel">
      <div className="drag-timer">
        <label>الوقت الحالي</label>
        <span className="time-value">
          {dragStats.startTime && !dragStats.finishTime 
            ? ((Date.now() - dragStats.startTime) / 1000).toFixed(3)
            : (dragStats.quarterMileTime || "0.000")}s
        </span>
      </div>

      <div className="drag-splits">
        <div className="split-item">
          <span>0-100 km/h:</span>
          <span className="split-value">{dragStats.time0to100?.toFixed(3) || "--"}s</span>
        </div>
        <div className="split-item">
          <span>1/4 Mile:</span>
          <span className="split-value">{dragStats.quarterMileTime?.toFixed(3) || "--"}s</span>
        </div>
      </div>

      {!dragStats.active && !dragStats.startTime && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="drag-ready"
        >
          READY
        </motion.div>
      )}
    </div>
  );
}
