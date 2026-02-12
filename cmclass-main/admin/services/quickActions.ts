export type QuickActionKey = 'add-product' | 'upload-media' | 'edit-homepage' | 'new-campaign';

const QUICK_ACTION_STORAGE_KEY = 'cmclass:pendingQuickAction';

export const setPendingQuickAction = (action: QuickActionKey) => {
  try {
    sessionStorage.setItem(QUICK_ACTION_STORAGE_KEY, action);
  } catch {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
};

export const consumePendingQuickAction = (expectedAction?: QuickActionKey): QuickActionKey | null => {
  try {
    const action = sessionStorage.getItem(QUICK_ACTION_STORAGE_KEY) as QuickActionKey | null;
    if (!action) return null;

    if (expectedAction && action !== expectedAction) {
      return null;
    }

    sessionStorage.removeItem(QUICK_ACTION_STORAGE_KEY);
    return action;
  } catch {
    return null;
  }
};
