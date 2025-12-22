import React from 'react';
import data from '../data/kernel-data';

export default function FeedPanel() {
  return (
    <div className="panel feed-panel">
      <h2>Unified Data Mesh</h2>
      <ul>
        {data.feed.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}