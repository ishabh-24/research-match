// ============================================================
// components/ui/ — Base UI Primitives (shadcn/ui style)
// ============================================================
// WHAT TO PUT IN THIS FOLDER:
//   Low-level, unstyled (or lightly styled) components built on
//   top of Radix UI primitives. These are the building blocks
//   for all other components in the app.
//
// FILES TO CREATE:
//
//   button.tsx       — <Button variant="default|outline|ghost|destructive" size="sm|md|lg" />
//   input.tsx        — Styled <input> with error state prop
//   label.tsx        — <Label> with htmlFor
//   textarea.tsx     — Styled <textarea>
//   select.tsx       — Radix <Select> wrapper with trigger/content
//   dialog.tsx       — Radix <Dialog> wrapper (title, description, close)
//   badge.tsx        — <Badge variant="default|success|warning|danger|outline" />
//   avatar.tsx       — <Avatar> with image fallback to initials
//   card.tsx         — <Card>, <CardHeader>, <CardContent>, <CardFooter>
//   tabs.tsx         — Radix <Tabs> wrapper
//   toast.tsx        — Radix <Toast> + useToast hook
//   skeleton.tsx     — Loading skeleton rectangles (animated pulse)
//   spinner.tsx      — Loading spinner SVG
//   switch.tsx       — Radix <Switch> toggle
//   slider.tsx       — Radix <Slider>
//   checkbox.tsx     — Radix <Checkbox>
//   separator.tsx    — <hr> styled separator
//
// PATTERN:
//   Each file should:
//     1. Import the Radix UI primitive (or build from scratch if no Radix equivalent).
//     2. Use class-variance-authority (cva) to define variants.
//     3. Use cn() from @/lib/utils for class merging.
//     4. Forward refs where appropriate.
//     5. Export the component AND its props type.
//
// EXAMPLE — button.tsx:
//   const buttonVariants = cva("base classes", {
//     variants: { variant: { default: "...", outline: "..." } }
//   })
//   export function Button({ variant, size, className, ...props }) {
//     return <button className={cn(buttonVariants({variant, size}), className)} {...props} />
//   }
// ============================================================

// This file is a placeholder — create individual files for each component above.
export { };
