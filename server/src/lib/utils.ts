// ============================================================
// lib/utils.ts — Shared Utility Functions
// ============================================================
// WHAT TO PUT HERE:
//   Small helper functions used across the app.
//
// UTILITIES TO IMPLEMENT:
//
//   cn(...inputs: ClassValue[]) → string
//     Combines Tailwind classes safely (clsx + tailwind-merge).
//     Usage: className={cn("base-class", condition && "conditional")}
//
//   formatCompensation(cents: number) → string
//     Converts cents to "$25.00" or returns "Unpaid" if 0.
//
//   formatDuration(minutes: number) → string
//     Converts minutes → "1 hr 30 min" or "45 min".
//
//   getInitials(name: string) → string
//     Returns "JD" from "Jane Doe" for avatar fallback.
//
//   truncate(text: string, maxLength: number) → string
//     Truncates text with ellipsis for study card descriptions.
// ============================================================


export function formatCompensation(cents: number): string {
    // TODO: implement
    return cents === 0 ? "Unpaid" : `$${(cents / 100).toFixed(2)}`;
}

export function formatDuration(minutes: number): string {
    // TODO: implement
    return `${minutes} min`;
}

export function getInitials(name: string): string {
    // TODO: implement
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
