import { describe, it, expect } from 'vitest';
import { getTranslation, UI_STRINGS } from '../lib/i18n';
import { INITIAL_REPORTS, INITIAL_VOLUNTEER_OPPORTUNITIES, DEMO_PROFILES } from '../lib/demo-data';

describe('Multilingual i18n Dictionary', () => {
  it('contains valid translations for English, Hindi, and Odia', () => {
    expect(UI_STRINGS.en.appName).toBe('HelpHub AI');
    expect(UI_STRINGS.hi.appName).toBe('हेल्पहब एआई');
    expect(UI_STRINGS.or.appName).toBe('ହେଲ୍ପହବ୍ ଏଆଇ');
  });

  it('translates report status labels correctly', () => {
    expect(getTranslation('hi', 'open')).toBe('खुली समस्या');
    expect(getTranslation('or', 'open')).toBe('ଖୋଲା ଅଛି');
    expect(getTranslation('en', 'resolved')).toBe('Resolved');
  });
});

describe('Demo Dataset and Role Profiles', () => {
  it('provides complete profile identities for all 5 roles', () => {
    expect(DEMO_PROFILES.citizen.role).toBe('citizen');
    expect(DEMO_PROFILES.volunteer.role).toBe('volunteer');
    expect(DEMO_PROFILES.organizer.role).toBe('organizer');
    expect(DEMO_PROFILES.moderator.role).toBe('moderator');
    expect(DEMO_PROFILES.admin.role).toBe('admin');
  });

  it('contains seeded demonstration reports across multiple categories', () => {
    expect(INITIAL_REPORTS.length).toBeGreaterThanOrEqual(4);
    const categories = INITIAL_REPORTS.map((r) => r.category);
    expect(categories).toContain('sanitation');
    expect(categories).toContain('electricity');
    expect(categories).toContain('water');
    expect(categories).toContain('accessibility');
  });

  it('tracks capacity limits for volunteer opportunities', () => {
    const opp = INITIAL_VOLUNTEER_OPPORTUNITIES[0];
    expect(opp.capacity).toBeGreaterThan(opp.current_signups_count);
    expect(opp.status).toBe('open');
  });
});

