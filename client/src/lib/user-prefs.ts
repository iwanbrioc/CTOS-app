// Local user preferences — stored on-device, no server needed.
// Each install gets its own unique ID and the user's chosen name.

const KEY_USER_ID   = "ctos-user-id";
const KEY_USER_NAME = "ctos-user-name";
const KEY_ONBOARDED  = "ctos-onboarded";  // true once slideshow completed

function generateId(): string {
  // Simple UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getUserId(): string {
  let id = localStorage.getItem(KEY_USER_ID);
  if (!id) {
    id = generateId();
    localStorage.setItem(KEY_USER_ID, id);
  }
  return id;
}

export function getUserName(): string | null {
  return localStorage.getItem(KEY_USER_NAME);
}

export function setUserName(name: string): void {
  localStorage.setItem(KEY_USER_NAME, name.trim());
}

export function isOnboarded(): boolean {
  return !!localStorage.getItem(KEY_ONBOARDED);
}

export function markOnboarded(): void {
  localStorage.setItem(KEY_ONBOARDED, "1");
}

export function clearUserPrefs(): void {
  localStorage.removeItem(KEY_USER_NAME);
  localStorage.removeItem(KEY_ONBOARDED);
  // Keep the ID so progress history is preserved if they re-enter a name
}
