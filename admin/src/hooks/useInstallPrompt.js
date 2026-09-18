import { useEffect, useState, useCallback } from 'react';
import { isInstallAvailable, onInstallAvailabilityChange, promptInstall } from '../utils/installPrompt';

export const useInstallPrompt = () => {
  const [available, setAvailable] = useState(isInstallAvailable());

  useEffect(() => onInstallAvailabilityChange(setAvailable), []);

  const install = useCallback(async () => {
    const choice = await promptInstall();
    if (choice) setAvailable(false);
  }, []);

  return { available, install };
};
