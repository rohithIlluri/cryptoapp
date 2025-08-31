import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { formatUSD } from '../../utils/formatters';

import ReactMemo from 'react';

function SparklineBase({ data, stroke = '#111827' }) {
  if (!Array.isArray(data) || data.length === 0) return <div className="skeleton" style={{ height: 40 }} />;
  const points = data.map((y, i) => ({ i, y }));
  return (
    <div style={{ width: 140, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <Line type="monotone" dataKey="y" stroke={stroke} dot={false} strokeWidth={1.5} />
          <Tooltip formatter={(value) => formatUSD(value)} labelFormatter={() => ''} contentStyle={{ borderRadius: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const Sparkline = React.memo(SparklineBase, (prev, next) => prev.stroke === next.stroke && prev.data === next.data);
export default Sparkline;

