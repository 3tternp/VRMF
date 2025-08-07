interface HeatmapData {
  likelihood: number;
  impact: number;
  count: number;
}

interface RiskHeatmapProps {
  data: HeatmapData[];
}

export function RiskHeatmap({ data }: RiskHeatmapProps) {
  const getColor = (likelihood: number, impact: number, count: number) => {
    if (count === 0) return 'bg-gray-50 border-gray-200';
    
    const score = likelihood * impact;
    if (score >= 15) return 'bg-red-500 border-red-600';
    if (score >= 8) return 'bg-yellow-500 border-yellow-600';
    return 'bg-green-500 border-green-600';
  };

  const getTextColor = (likelihood: number, impact: number, count: number) => {
    if (count === 0) return 'text-gray-400';
    return 'text-white font-semibold';
  };

  const getCellData = (likelihood: number, impact: number) => {
    const cell = data.find(d => d.likelihood === likelihood && d.impact === impact);
    return cell?.count || 0;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-1">
        {/* Header row */}
        <div></div>
        {[1, 2, 3, 4, 5].map(impact => (
          <div key={impact} className="text-center text-sm font-medium text-gray-600 p-2">
            {impact}
          </div>
        ))}
        
        {/* Data rows */}
        {[5, 4, 3, 2, 1].map(likelihood => (
          <>
            <div key={likelihood} className="text-center text-sm font-medium text-gray-600 p-2">
              {likelihood}
            </div>
            {[1, 2, 3, 4, 5].map(impact => {
              const count = getCellData(likelihood, impact);
              return (
                <div
                  key={`${likelihood}-${impact}`}
                  className={`
                    aspect-square flex items-center justify-center text-sm border-2 rounded
                    ${getColor(likelihood, impact, count)}
                    ${getTextColor(likelihood, impact, count)}
                  `}
                >
                  {count > 0 ? count : ''}
                </div>
              );
            })}
          </>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-600">
        <div>
          <div className="font-medium mb-1">Likelihood →</div>
          <div>1: Very Low → 5: Very High</div>
        </div>
        <div className="text-right">
          <div className="font-medium mb-1">↑ Impact</div>
          <div>1: Very Low → 5: Very High</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Low Risk (1-7)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium Risk (8-14)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>High Risk (15-25)</span>
        </div>
      </div>
    </div>
  );
}
