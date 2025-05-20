import { useNavigationChartStore } from '../../../store/chart-indicator-store';

interface ProgressBarProps {
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ max }) => {
  const {currentCount} = useNavigationChartStore()


  const percentage = (currentCount / max) * 100;

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
