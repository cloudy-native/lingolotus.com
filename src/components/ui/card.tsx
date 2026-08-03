import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="region"
    className={cn(
      "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-500 ", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * FlippableCard provides a card with a CSS flip animation (≤300ms).
 * Used in StudyMode for flashcard interactions.
 * Includes ARIA role="button" and aria-label for accessibility.
 */
interface FlippableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  isFlipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  "aria-label"?: string;
}

const FlippableCard = React.forwardRef<HTMLDivElement, FlippableCardProps>(
  ({ className, isFlipped, front, back, "aria-label": ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? "Flashcard. Press to flip."}
      aria-pressed={isFlipped}
      className={cn(
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {/* Front face */}
      {!isFlipped && (
        <Card className="w-full">{front}</Card>
      )}
      {/* Back face */}
      {isFlipped && (
        <Card className="w-full">{back}</Card>
      )}
    </div>
  ),
);
FlippableCard.displayName = "FlippableCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  FlippableCard,
};
