let deferredPrompt = null;
let listeners = [];

const notify = (available) => listeners.forEach(fn => fn(available));

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  notify(true);
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  notify(false);
});

export const isInstallAvailable = () => !!deferredPrompt;

export const onInstallAvailabilityChange = (fn) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
};

export const promptInstall = async () => {
  if (!deferredPrompt) return null;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice;
};
