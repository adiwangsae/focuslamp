export function getUserInitials(name?: string | null): string {
  const cleaned = (name ?? '').trim();
  if (!cleaned) return 'FL';

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'FL';
}
