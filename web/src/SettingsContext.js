//SettingsContext.js
import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [voiceOn, setVoiceOn] = useState(true);
  const [effectsOn, setEffectsOn] = useState(true);
  const [volume, setVolume] = useState(50);
  const [autoHistory, setAutoHistory] = useState(true);

  return (
    <SettingsContext.Provider value={{
      voiceOn, setVoiceOn,
      effectsOn, setEffectsOn,
      volume, setVolume,
      autoHistory, setAutoHistory,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
