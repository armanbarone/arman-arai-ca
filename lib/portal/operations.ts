import registers from "./wedding-operations.json";
import { parseCadToCents, formatCad } from "./money";
export const OPERATION_REGISTERS = registers;
export function calculateBudgetRow(row: string[]) {
  const r = [...row];
  if (r.slice(0, 6).some(Boolean)) {
    const total = parseCadToCents(r[4]) + parseCadToCents(r[5]);
    r[6] = formatCad(total);
    r[8] = formatCad(total - parseCadToCents(r[7]));
  }
  if (r[9] || r[10])
    r[11] = formatCad(parseCadToCents(r[9]) - parseCadToCents(r[10]));
  return r;
}
