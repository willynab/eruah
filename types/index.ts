export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  stats: {
    listeningTime: number; // en minutes
    favoritePrayers: number;
    lectioSessions: number;
    intentionsSubmitted: number;
    intentionsAnswered: number;
  };
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserCreationData {
  fullName: string;
  username: string;
  role: 'admin' | 'user' | 'moderator';
  email?: string;
  temporaryPassword?: string;
}

export interface AudioTeaching {
  id: string;
  title: string;
  author: string;
  category: 'Prédication' | 'Témoignage' | 'Enseignement' | 'Méditation';
  level: 1 | 2 | 3; // 1=Débutant, 2=Intermédiaire, 3=Avancé
  duration: number; // en secondes
  coverImage?: string;
  audioUrl: string;
  description: string;
  playCount: number;
  isFavorite: boolean;
  progress?: number; // 0-1
  status?: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface Prayer {
  id: string;
  title: string;
  author?: string;
  category: string;
  subcategory?: string;
  content: string;
  pdfUrl?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isFavorite: boolean;
  viewCount: number;
  createdAt: string;
}

export interface PrayerCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  prayerCount: number;
  isNew?: boolean;
  parentId?: string;
  order?: number;
}

export interface LectioPassage {
  id: string;
  title: string;
  reference: string;
  content: string;
  theme: 'Paix' | 'Amour' | 'Espérance' | 'Pardon' | 'Joie';
  liturgicalSeason?: 'Avent' | 'Carême' | 'Pâques' | 'Temps ordinaire';
  questions: string[];
  context?: string;
  audioUrl?: string;
  createdAt: string;
}

export interface LectioSession {
  id: string;
  passageId: string;
  userId: string;
  step: 1 | 2 | 3 | 4; // Lectio, Meditatio, Oratio, Contemplatio
  notes: {
    meditation?: string;
    prayer?: string;
    contemplation?: string;
  };
  startedAt: string;
  lastSavedAt: string;
  completed: boolean;
  duration?: number; // en minutes
}

export interface Intention {
  id: string;
  title: string;
  content: string;
  category: 'Santé' | 'Famille' | 'Travail' | 'Spirituel' | 'Autre';
  isAnonymous: boolean;
  authorId: string;
  authorName?: string;
  visibility: 'private' | 'public';
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  prayerCount: number;
  comments?: IntentionComment[];
  createdAt: string;
  answeredAt?: string;
  testimony?: string;
  rejectionReason?: string;
}

export interface IntentionComment {
  id: string;
  intentionId: string;
  authorId: string;
  authorName: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorAvatar?: string;
  category: 'Enseignements' | 'Communauté' | 'Événements';
  coverImage?: string;
  audioUrl?: string;
  publishedAt: string;
  isFavorite: boolean;
  links?: ArticleLink[];
}

export interface ArticleLink {
  id: string;
  url: string;
  title: string;
  description?: string;
}

export type Theme = 'marial' | 'esprit' | 'sombre';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  gradient: string[];
}

export interface PopupForge {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'promotion' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'users' | 'admins' | 'moderators' | 'new_users' | 'active_users';
  displayConditions: {
    startDate: string;
    endDate?: string;
    maxDisplayCount?: number;
    displayFrequency: 'once' | 'daily' | 'weekly' | 'always';
    pages?: string[]; // Pages spécifiques où afficher
    userRoles?: ('admin' | 'user' | 'moderator')[];
    minUserAge?: number; // Jours depuis inscription
  };
  design: {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
    icon?: string;
    position: 'top' | 'center' | 'bottom';
    animation: 'fade' | 'slide' | 'bounce' | 'none';
    dismissible: boolean;
    autoClose?: number; // Secondes
  };
  actions?: PopupAction[];
  analytics: {
    impressions: number;
    clicks: number;
    dismissals: number;
    conversions: number;
  };
  status: 'draft' | 'active' | 'paused' | 'expired';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopupAction {
  id: string;
  label: string;
  type: 'button' | 'link';
  action: 'close' | 'navigate' | 'external_link' | 'custom';
  value?: string; // URL ou route
  style: 'primary' | 'secondary' | 'danger';
}

export interface PopupDisplay {
  id: string;
  popupId: string;
  userId: string;
  displayedAt: string;
  dismissed: boolean;
  dismissedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  action?: string;
}

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  theme: Theme;
  recentContent: {
    audio: AudioTeaching[];
    prayers: Prayer[];
    lectio: LectioPassage[];
  };
  notifications: number;
}