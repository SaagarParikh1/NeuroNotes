import {
  AppImportData,
  AppPreferences,
  Flashcard,
  Folder,
  Note,
  StudySession,
  StudySessionMode,
} from '../types';

export const DEFAULT_FOLDER_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
];

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: '1',
    name: 'Personal',
    color: 'bg-blue-500',
    noteCount: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Work',
    color: 'bg-purple-500',
    noteCount: 0,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Study',
    color: 'bg-green-500',
    noteCount: 0,
    createdAt: new Date(),
  },
];

export const DEFAULT_PREFERENCES: AppPreferences = {
  autoSaveNotes: true,
  smartFlashcardGeneration: true,
  studyReminders: false,
  flashcardReviewAlerts: true,
  achievementNotifications: true,
  analyticsOptIn: false,
  reminderTime: '18:00',
  fontSize: 'medium',
  editorFont: 'mono',
};

export const calculateWordCount = (content: string) =>
  content.trim() ? content.trim().split(/\s+/).length : 0;

export const sanitizeTags = (tags: string[]) =>
  Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));

export const normalizeFolders = (folders: Folder[], notes: Note[]) =>
  folders.map((folder) => ({
    ...folder,
    noteCount: notes.filter((note) => note.folderId === folder.id).length,
  }));

export const createFileName = (title: string, extension: string) =>
  `${(title || 'neuronotes')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'neuronotes'}.${extension}`;

export const downloadFile = (content: string, mimeType: string, fileName: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportNoteMarkdown = (note: Note) => {
  const lines = [
    `# ${note.title || 'Untitled Note'}`,
    '',
    note.content,
    '',
    '---',
    `Tags: ${note.tags.join(', ') || 'None'}`,
    `Created: ${new Date(note.createdAt).toLocaleString()}`,
    `Updated: ${new Date(note.updatedAt).toLocaleString()}`,
  ];

  return lines.join('\n');
};

export const getDueFlashcards = (flashcards: Flashcard[]) =>
  flashcards.filter((card) => new Date(card.nextReview).getTime() <= Date.now());

export const getAverageScore = (
  sessions: StudySession[],
  mode?: StudySessionMode,
) => {
  const scopedSessions = mode
    ? sessions.filter((session) => (session.mode || 'study') === mode)
    : sessions;

  if (scopedSessions.length === 0) {
    return 0;
  }

  return Math.round(
    scopedSessions.reduce((total, session) => total + session.score, 0) / scopedSessions.length,
  );
};

export const getStudyStreak = (sessions: StudySession[]) => {
  const studyDays = Array.from(
    new Set(
      sessions.map((session) => {
        const date = new Date(session.completedAt);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      }),
    ),
  ).sort((left, right) => right - left);

  if (studyDays.length === 0) {
    return 0;
  }

  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayKey = todayKey - 24 * 60 * 60 * 1000;

  if (studyDays[0] !== todayKey && studyDays[0] !== yesterdayKey) {
    return 0;
  }

  return studyDays.reduce((streak, day, index) => {
    if (index === 0) {
      return 1;
    }

    const previousDay = studyDays[index - 1];
    return previousDay - day === 24 * 60 * 60 * 1000 ? streak + 1 : streak;
  }, 0);
};

export const getAccuracy = (correctAnswers: number, totalAnswers: number) =>
  totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

export const parseImportPayload = (rawValue: string): AppImportData => {
  const parsed = JSON.parse(rawValue) as AppImportData;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup file is not a valid JSON object.');
  }

  return parsed;
};
