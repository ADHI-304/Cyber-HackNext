import React from 'react';
import { Zap } from 'lucide-react';

export function FrictionMatrixTable({ frictionVsRisk }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 high-contrast:bg-slate-900 high-contrast:border-slate-700">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" />
        <div>
          <h2 className="font-bold text-base text-slate-900 high-contrast:text-white">Friction vs. Security Risk Matrix</h2>
          <p className="text-xs text-slate-500">Evaluation of usability hurdle relative to security level</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200 high-contrast:bg-slate-800 high-contrast:text-amber-400">
            <tr>
              <th className="p-3">Auth Step</th>
              <th className="p-3">Friction</th>
              <th className="p-3">Security Risk</th>
              <th className="p-3">Score</th>
              <th className="p-3">UX Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium high-contrast:divide-slate-800">
            {frictionVsRisk.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 high-contrast:hover:bg-slate-800">
                <td className="p-3 font-bold text-slate-900 high-contrast:text-white">{item.step}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.friction === 'Very High' || item.friction === 'High' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.friction}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded font-bold bg-sky-100 text-sky-800">
                    {item.risk}
                  </span>
                </td>
                <td className="p-3 font-mono font-bold">{item.score}</td>
                <td className="p-3 text-slate-600 high-contrast:text-slate-300">{item.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
