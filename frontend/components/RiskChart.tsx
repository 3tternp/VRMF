import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  [key: string]: string | number;
}

interface RiskChartProps {
  data: ChartData[];
  dataKey: string;
  nameKey: string;
}

export function RiskChart({ data, dataKey, nameKey }: RiskChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    [nameKey]: typeof item[nameKey] === 'string' 
      ? item[nameKey].toString().replace('_', ' ').toUpperCase()
      : item[nameKey]
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={nameKey} 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
