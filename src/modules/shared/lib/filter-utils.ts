import type { FilterCategory, FilterOperator } from '@/src/modules/shared/lib/api'

export const OPERATORS_BY_CATEGORY: Record<FilterCategory, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'not_equals', label: 'Not equals' },
  ],
  number: [
    { value: 'eq', label: '=' },
    { value: 'neq', label: '!=' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'eq', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  boolean: [
    { value: 'eq', label: 'Equals' },
  ],
  unsupported: [],
}

export function getDefaultOperator(category: FilterCategory): FilterOperator {
  switch (category) {
    case 'text': return 'contains'
    case 'number': return 'eq'
    case 'date': return 'after'
    case 'boolean': return 'eq'
    default: return 'contains'
  }
}

export function getOperatorLabel(operator: FilterOperator): string {
  for (const ops of Object.values(OPERATORS_BY_CATEGORY)) {
    const found = ops.find(o => o.value === operator)
    if (found) return found.label
  }
  return operator
}

export function isBetweenOperator(operator: FilterOperator): boolean {
  return operator === 'between'
}
