'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', delivered: 24, inTransit: 12 },
  { name: 'Tue', delivered: 31, inTransit: 18 },
  { name: 'Wed', delivered: 28, inTransit: 15 },
  { name: 'Thu', delivered: 35, inTransit: 22 },
  { name: 'Fri', delivered: 42, inTransit: 28 },
  { name: 'Sat', delivered: 18, inTransit: 8 },
  { name: 'Sun', delivered: 12, inTransit: 5 },
]

export function DeliveryChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.18 160)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.55 0.18 160)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="inTransit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.45 0.15 240)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.45 0.15 240)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'oklch(var(--card))',
              borderColor: 'oklch(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="delivered"
            stroke="oklch(0.55 0.18 160)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#delivered)"
            name="Delivered"
          />
          <Area
            type="monotone"
            dataKey="inTransit"
            stroke="oklch(0.45 0.15 240)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#inTransit)"
            name="In Transit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
