import { useTransition } from "react";

/**
 * `useTransition` is a React Hook that lets you update the state without blocking the UI.
 *
 * Syntax:
 * const [isPending, startTransition] = useTransition()
 *
 * Parameters: useTransition does not take any parameters.
 *
 * Returns:
 *
 * 1. The isPending flag that tells you whether there is a pending Transition.
 * 2. The startTransition function that lets you mark a state update as a Transition.
 */

export default function TabButton({ children, isActive, onClick }) {
  const [isPending, startTransition] = useTransition();
  if (isActive) {
    return <b>{children}</b>;
  }
  return (
    <button
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
    >
      {children}
    </button>
  );
}
