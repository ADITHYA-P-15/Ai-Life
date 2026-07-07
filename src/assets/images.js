/**
 * Design reference imagery — 5 domain mascots on a shared 512×512 sprite sheet.
 *
 * Layout:
 *   Row 1: MIND · SLEEP · HABITS
 *   Row 2: MONEY · HOBBIES
 *
 * Chip + hero crops are tuned separately so hub circles and page heroes
 * stay centered without showing label text from the sprite sheet.
 */

export const SPRITE_SHEET = '/mascot-sprite.jpg';

export const STANDALONE_MASCOTS = {
  habits:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwoyJxp4rEsvSYrQ8e4706wYqfDx5sceO58xSLQ49WtRwbgfzRwOA1P6X46iKrZKNpuEmrCzx-chtBixd5zZLHAki3tIo_fOz6P2RsTVLjDbF2bEeHIgpWF6vXcmoJqcOjVA2S_JXjskimcQ8P4pegnsN8FH7MSKeOikzXOMesvR6QLQ5WGWoNs58V8B3MIrY9Rn4qDHrepHzg_EUEiVoUi1wzWpGTpCVC0NJrXd5byr23YX4zVSzOneQutb4eIrP8zKMUKURL1h5S',
  aura:
    'https://lh3.googleusercontent.com/aida/AP1WRLvTV5KxqJnLlwLnEqTZ65G4_2CRnA7v6Ev7JBMfK7QJxj4AN8aXvHTcQ8KkiZTEsTKS-EkrOJYh0vixA_ycM-0mpJEPSb0Bp265snGKBuwfxHQeEG5NQiciiMCVk7r7ZBYRYkI-LxlkFe-p3GmuGLEqrUSsxAKUijACQ4izvE8YfUZe874E2ZBFhY7sadDkDp6_7x18cqBXtNPPumJ-i_FqYfSJDXBw99voxBb3RzEUVUi2POsUAUf20oA',
};

export const USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2Kng8BED3DjWJPqZfPUWbaaFZz7QY7xWYl5vMmMj40Pzpw4GeLmMDj3YrN3CKDD-14sgYE6zth4enwykOomlf5q0c5oJc1kbp3D_TcJS3LJPHq7rcWzSn5lkA6GgSMiuDMEmHKWu-NldXG3Bqzgp5pPNyklcLyQ-qffQXO6xFcwUszyVY59ClMGLiYJF1M8zpWASzAWA5FXnGxTrBV-fILXcUPFWwPNEjDWR9jT2o6QzkqclBGZ1UIATyzreQ0M9LB483z-Hy0_ly';

/** Per-domain sprite crop — chip (hub circles) and hero (page headers) */
export const DOMAIN_SPRITES = {
  mind: {
    chip: { position: '17% 11%', size: '480% 480%' },
    hero: { position: '17% 12%', size: '390% 390%' },
    glow: 'rgba(56, 189, 248, 0.55)',
    ring: 'rgba(56, 189, 248, 0.25)',
  },
  sleep: {
    chip: { position: '50% 11%', size: '480% 480%' },
    hero: { position: '50% 12%', size: '390% 390%' },
    glow: 'rgba(167, 139, 250, 0.55)',
    ring: 'rgba(167, 139, 250, 0.25)',
  },
  habits: {
    chip: { position: '81% 11%', size: '480% 480%' },
    hero: { position: '81% 12%', size: '390% 390%' },
    glow: 'rgba(16, 185, 129, 0.55)',
    ring: 'rgba(16, 185, 129, 0.25)',
  },
  money: {
    chip: { position: '29% 68%', size: '270% 270%' },
    hero: { position: '28% 70%', size: '320% 320%' },
    glow: 'rgba(245, 200, 75, 0.55)',
    ring: 'rgba(245, 200, 75, 0.25)',
  },
  hobbies: {
    chip: { position: '73% 68%', size: '270% 270%' },
    hero: { position: '72% 70%', size: '320% 320%' },
    glow: 'rgba(244, 114, 182, 0.55)',
    ring: 'rgba(244, 114, 182, 0.25)',
  },
};

export const MASCOT_GLOWS = {
  mind: 'drop-shadow(0 0 18px rgba(0, 229, 255, 0.45))',
  sleep: 'drop-shadow(0 12px 32px rgba(205, 192, 233, 0.4))',
  habits: 'drop-shadow(0 8px 24px rgba(16, 185, 129, 0.45))',
  money: 'drop-shadow(0 8px 22px rgba(245, 200, 75, 0.38))',
  hobbies: 'drop-shadow(0 0 24px rgba(255, 77, 255, 0.4))',
};

export const MASCOT_LABELS = {
  mind: 'Mind mascot',
  sleep: 'Sleep mascot',
  habits: 'Habit shield mascot',
  money: 'Money mascot',
  hobbies: 'Creative guild mascot',
};

export const STANDALONE_HERO_MIN = 200;
