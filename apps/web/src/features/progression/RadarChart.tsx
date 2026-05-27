import { Radar, RadarChart as ReRadarChart, PolarGrid, 
         PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface RadarData {
  module: string
  score: number
  target: number
}

export function ProgressRadarChart({ data }: { data: RadarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReRadarChart data={data}>
        <PolarGrid gridType="polygon" stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="module"
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
        />
        <Radar
          name="Score cible"
          dataKey="target"
          stroke="#e5e7eb"
          fill="#e5e7eb"
          fillOpacity={0.3}
        />
        <Radar
          name="Votre score"
          dataKey="score"
          stroke="#1B3A6B"
          fill="#1B3A6B"
          fillOpacity={0.45}
        />
        <Tooltip
          formatter={(value: number, name: string) => [`${value}%`, name]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
