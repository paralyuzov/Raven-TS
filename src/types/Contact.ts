export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export interface ContactState {
  contacts: Contact[] | null;
  loading: boolean;
  error: string | null;
}
