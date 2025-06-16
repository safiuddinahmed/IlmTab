import { useState, useEffect } from 'react';

export default function AyahDisplay() {
  const [ayah, setAyah] = useState("وَاللَّهُ خَيْرُ الْرَّازِقِينَ (Surah Ad-Duha, 93:3)");

  // Placeholder: you can replace this with API calls or dynamic data later

  return (
    <div style={{ marginTop: 20, fontSize: '1.2rem' }}>
      <p>{ayah}</p>
    </div>
  );
}