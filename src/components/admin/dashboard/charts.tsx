'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CYAN = '#00e5ff';
const YELLOW = '#ffd600';
const GREEN = '#00e676';
const BLUE = '#448aff';
const RED = '#ff5252';
const PURPLE = '#b388ff';
const CATEGORY_COLORS = [YELLOW, GREEN, BLUE, PURPLE];

interface CategoryData {
  name: string;
  count: number;
}

export function ProductBarChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
        <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11, fontFamily: 'var(--f-m)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#888', fontSize: 10, fontFamily: 'var(--f-m)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontFamily: 'var(--f-m)', fontSize: 12 }}
          cursor={{ fill: 'rgba(255,255,255,.04)' }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface VoteData {
  name: string;
  value: number;
}

const VOTE_COLORS = [GREEN, RED, YELLOW];

export function VotePieChart({ data }: { data: VoteData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="72%"
          dataKey="value"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={VOTE_COLORS[i % VOTE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontFamily: 'var(--f-m)', fontSize: 12 }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--f-m)', fontSize: 11 }}
          formatter={(value) => <span style={{ color: '#ccc' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
