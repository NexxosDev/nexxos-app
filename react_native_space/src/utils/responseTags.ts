import type { ResponseTagValue } from '../types';

export interface TagDefinition {
  key: ResponseTagValue;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const TAG_DEFINITIONS: TagDefinition[] = [
  { key: 'FAVORITO', label: 'Favorito', emoji: '⭐', color: '#F59E0B', bgColor: '#FEF3C7' },
  { key: 'MEJOR_PRECIO', label: 'Mejor precio', emoji: '💰', color: '#10B981', bgColor: '#D1FAE5' },
  { key: 'EN_NEGOCIACION', label: 'En negociación', emoji: '🤝', color: '#3B82F6', bgColor: '#DBEAFE' },
  { key: 'TIENE_REPUESTO', label: 'Tiene repuesto', emoji: '📦', color: '#F97316', bgColor: '#FFEDD5' },
  { key: 'DESCARTADO', label: 'Descartado', emoji: '🚫', color: '#EF4444', bgColor: '#FEE2E2' },
];

export function getTagDef(key: ResponseTagValue): TagDefinition | undefined {
  return TAG_DEFINITIONS.find((t) => t?.key === key);
}
