import React from 'react';

export default function FooterNav() {
  const links = [
    { name: 'Dashboard', href: '#' },
    { name: 'Forge', href: '#' },
    { name: 'Arena', href: '#' },
    { name: 'Tracker', href: '#' },
  ];

  return (
    <footer className="bg-gray-800 border-t border-gray-700 p-3 flex justify-around text-sm">
      {links.map((link, i) => (
        <a key={i} href={link.href} className="text-gray-400 hover:text-indigo-400 transition">
          {link.name}
        </a>
      ))}
    </footer>
  );
}