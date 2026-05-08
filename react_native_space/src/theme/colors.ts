export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  backgroundSection: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textSubtitle: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
  cardBg: string;
  tabActive: string;
  tabInactive: string;
  statusOpen: string;
  statusInProgress: string;
  statusClosed: string;
  statusPending: string;
  statusResponded: string;
  statusDeclined: string;
  chipBg: string;
  chipSelectedBg: string;
  overlay: string;
  inputBg: string;
  // Chat-specific
  bubbleVendor: string;
  bubbleVendorBorder: string;
  bubbleClient: string;
  bubbleClientBorder: string;
  // Error / Success boxes
  errorBg: string;
  successBg: string;
  warningBg: string;
  warningBoxText: string;
}

export const LightColors: ThemeColors = {
  primary: '#FFC107',
  primaryDark: '#FFB300',
  accent: '#121212',
  background: '#FFFFFF',
  backgroundSection: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#121212',
  textSecondary: '#757575',
  textSubtitle: '#333333',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#121212',
  cardBg: '#FFFFFF',
  tabActive: '#FFC107',
  tabInactive: '#757575',
  statusOpen: '#2196F3',
  statusInProgress: '#FFC107',
  statusClosed: '#E0E0E0',
  statusPending: '#2196F3',
  statusResponded: '#4CAF50',
  statusDeclined: '#F44336',
  chipBg: '#F5F5F5',
  chipSelectedBg: '#FFC107',
  overlay: 'rgba(0,0,0,0.5)',
  inputBg: '#FFFFFF',
  bubbleVendor: '#FFF8E1',
  bubbleVendorBorder: '#FFE082',
  bubbleClient: '#F5F5F5',
  bubbleClientBorder: '#E0E0E0',
  errorBg: '#FEE2E2',
  successBg: '#E8F5E9',
  warningBg: '#FFF3CD',
  warningBoxText: '#856404',
};

export const DarkColors: ThemeColors = {
  primary: '#FFC107',
  primaryDark: '#FFB300',
  accent: '#121212',
  background: '#0A0A0A',
  backgroundSection: '#1A1A1A',
  surface: '#1E1E1E',
  textPrimary: '#F5F5F5',
  textSecondary: '#AAAAAA',
  textSubtitle: '#CCCCCC',
  border: '#333333',
  success: '#66BB6A',
  warning: '#FFC107',
  error: '#EF5350',
  info: '#42A5F5',
  white: '#FFFFFF',
  black: '#121212',
  cardBg: '#1E1E1E',
  tabActive: '#FFC107',
  tabInactive: '#888888',
  statusOpen: '#42A5F5',
  statusInProgress: '#FFC107',
  statusClosed: '#555555',
  statusPending: '#42A5F5',
  statusResponded: '#66BB6A',
  statusDeclined: '#EF5350',
  chipBg: '#2A2A2A',
  chipSelectedBg: '#FFC107',
  overlay: 'rgba(0,0,0,0.7)',
  inputBg: '#1E1E1E',
  bubbleVendor: '#3A2E00',
  bubbleVendorBorder: '#5C4A00',
  bubbleClient: '#2A2A2A',
  bubbleClientBorder: '#3A3A3A',
  errorBg: '#3B1414',
  successBg: '#1B3A1B',
  warningBg: '#3A3000',
  warningBoxText: '#FFD54F',
};

// Backward compat: static Colors for files that haven't migrated yet
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
