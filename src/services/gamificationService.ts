import { FocusSession } from '../types';
import {
  calculateStreakInfo,
  calculateTotalXp,
  evaluateAchievements,
  getLevelInfo,
} from '../utils/gamification';

export const gamificationService = {
  evaluateSnapshot(params: {
    sessions: FocusSession[];
    aiMessageCount: number;
    factsExploredCount: number;
  }) {
    const totalXp = calculateTotalXp(params.sessions);
    const levelInfo = getLevelInfo(totalXp);
    const streakInfo = calculateStreakInfo(params.sessions);
    const achievements = evaluateAchievements({
      sessions: params.sessions,
      streakInfo,
      aiMessageCount: params.aiMessageCount,
      factsExploredCount: params.factsExploredCount,
    });

    return {
      totalXp,
      levelInfo,
      streakInfo,
      achievements,
    };
  },
};
