export const PROFILE_DETAILS_KEY = 'firereach_profile_details';
export const PROFILE_COMPLETION_REQUIRED_KEY = 'firereach_require_profile_completion';

const safeString = (value) => String(value || '').trim();

export const getStoredProfileDetails = () => {
  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_DETAILS_KEY) || '{}');
  } catch {
    return {};
  }
};

export const normalizeProfileDetails = (storedProfile = {}, sessionUser = {}) => ({
  name: safeString(storedProfile.name || sessionUser?.name),
  contactEmail: safeString(storedProfile.contactEmail || sessionUser?.email).toLowerCase(),
  phone: safeString(storedProfile.phone),
  company: safeString(storedProfile.company),
  role: safeString(storedProfile.role),
  website: safeString(storedProfile.website),
  icpFocus: safeString(storedProfile.icpFocus),
});

export const isProfileComplete = (profile = {}, sessionUser = {}) => {
  const normalized = normalizeProfileDetails(profile, sessionUser);
  const hasName = normalized.name.length > 0;
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.contactEmail);
  const hasPhone = /^\d{10}$/.test(normalized.phone);
  return hasName && hasEmail && hasPhone;
};

export const markProfileCompletionRequired = (required) => {
  if (required) {
    window.localStorage.setItem(PROFILE_COMPLETION_REQUIRED_KEY, '1');
    return;
  }
  window.localStorage.removeItem(PROFILE_COMPLETION_REQUIRED_KEY);
};

export const isProfileCompletionRequired = () => window.localStorage.getItem(PROFILE_COMPLETION_REQUIRED_KEY) === '1';
