import React, { useEffect, useState } from 'react';
import OBSOverlay from './components/OBSOverlay';

function OBSPage() {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  if (!date) {
    return <div>Loading...</div>;
  }

  return <OBSOverlay date={date} />;
}

export default OBSPage;
