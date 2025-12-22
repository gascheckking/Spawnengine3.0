import React from 'react';
import HeaderStatus from './HeaderStatus';
import StatsGrid from './StatsGrid';
import XPPanel from './XPPanel';
import FeedPanel from './FeedPanel';
import QuestSummary from './QuestSummary';

export default function MeshKernelDashboard({ data }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter flex flex-col">
      <HeaderStatus />
      <main className="flex-grow p-6 space-y-6">
        <StatsGrid data={data?.stats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <XPPanel data={data?.xp} />
          <QuestSummary data={data?.quests} />
          <FeedPanel data={data?.feed} />
        </div>
      </main>
    </div>
  );
}