'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { EapcetCutoff } from '@prisma/client';

interface CutoffRow {
  id: number;
  college_name: string;
  type: string;
  year: number;
  branch: string;
  opening_rank: string;
  closing_rank: string;
  annual_fees: string;
  placement_rating: number | null;
  location: string;
}

interface Props {
  collegeName: string;
  rows: CutoffRow[];
}

export default function CutoffClient({ collegeName, rows }: Props) {
  const branches = Array.from(new Set(rows.map((r) => r.branch))).sort();
  const [selectedBranch, setSelectedBranch] = useState(branches[0] || '');

  const branchData = rows.filter((r) => r.branch === selectedBranch);

  // Group by year to construct chart data
  const chartData = branchData
    .map((r) => {
      const closingRank = parseInt(r.closing_rank.replace(/,/g, ''), 10);
      return {
        year: r.year,
        closing_rank: isNaN(closingRank) ? null : closingRank,
      };
    })
    .filter((d) => d.closing_rank !== null)
    .sort((a, b) => a.year - b.year); // Sort ascending for chart

  // Sort descending for table
  const tableData = [...branchData].sort((a, b) => b.year - a.year);

  const bestYearRank =
    chartData.length > 0
      ? Math.min(...chartData.map((d) => d.closing_rank as number))
      : null;

  return (
    <div style={{ marginTop: 24 }}>
      {/* SECTION B — Branch Selector Tabs */}
      <div
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24,
        }}
      >
        {branches.map((branch) => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--r)',
              border: selectedBranch === branch ? '2px solid var(--navy)' : '1px solid var(--line)',
              background: selectedBranch === branch ? 'var(--navy)' : '#fff',
              color: selectedBranch === branch ? '#fff' : 'var(--text)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Plus Jakarta Sans,sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {branch}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r2)', padding: 24 }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: 24, fontWeight: 800 }}>
          {selectedBranch} Cutoff Trends
        </h2>

        {/* SECTION D — Trend Chart */}
        {chartData.length >= 2 ? (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12, fontWeight: 600 }}>
              Closing Rank Trend (lower = more competitive)
            </p>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--subtle)' }} />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--subtle)' }} 
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: 'var(--navy)', fontWeight: 700 }}
                    formatter={(val: any) => [Number(val).toLocaleString('en-IN'), 'Closing Rank']}
                    labelStyle={{ color: 'var(--subtle)', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="closing_rank"
                    stroke="var(--gold)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--gold)', stroke: '#fff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, background: 'var(--cream)', borderRadius: 'var(--r)' }}>
            Not enough data to generate trend chart for {selectedBranch}
          </div>
        )}

        {/* SECTION C — Cutoff Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line-dk)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--subtle)', fontWeight: 600, fontSize: '0.85rem' }}>Year</th>
                <th style={{ padding: '12px 16px', color: 'var(--subtle)', fontWeight: 600, fontSize: '0.85rem' }}>Opening Rank</th>
                <th style={{ padding: '12px 16px', color: 'var(--subtle)', fontWeight: 600, fontSize: '0.85rem' }}>Closing Rank</th>
                <th style={{ padding: '12px 16px', color: 'var(--subtle)', fontWeight: 600, fontSize: '0.85rem' }}>Annual Fee</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => {
                const closingRankNum = parseInt(row.closing_rank.replace(/,/g, ''), 10);
                const isBestYear = !isNaN(closingRankNum) && closingRankNum === bestYearRank;
                
                return (
                  <tr 
                    key={row.id} 
                    style={{ 
                      borderBottom: '1px solid var(--line)',
                      background: isBestYear ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--navy)' }}>{row.year}</td>
                    <td style={{ padding: '16px', color: row.opening_rank === '-' ? 'var(--line-dk)' : 'var(--text)' }}>
                      {row.opening_rank === '-' ? 'N/A' : row.opening_rank}
                    </td>
                    <td style={{ padding: '16px', color: row.closing_rank === '-' ? 'var(--line-dk)' : 'var(--text)', fontWeight: 600 }}>
                      {row.closing_rank === '-' ? 'N/A' : row.closing_rank}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--muted)' }}>
                      {row.annual_fees}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
