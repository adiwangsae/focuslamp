import { UserPreferences, UserProfile } from '../types';

export const profileService = {
  updatePreferences(
    profile: UserProfile,
    partial: Partial<UserPreferences>
  ): UserProfile {
    return {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...partial,
      },
    };
  },

  updateBasicInfo(
    profile: UserProfile,
    updates: { name?: string; major?: string; roleLabel?: string }
  ): UserProfile {
    return {
      ...profile,
      name: updates.name !== undefined ? updates.name.trim() : profile.name,
      major: updates.major !== undefined ? updates.major.trim() : profile.major,
      roleLabel: updates.roleLabel !== undefined ? updates.roleLabel.trim() : profile.roleLabel,
    };
  },
};
