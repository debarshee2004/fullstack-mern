import { useId } from "react";

/**
 * `useId` is a React Hook for generating unique IDs that can be passed to accessibility attributes.
 * Call useId at the top level of your component to generate a unique ID.
 *
 * Syntax:
 * const id = useId()
 *
 * Parameters: useId does not take any parameters.
 * Returns: useId returns a unique ID string associated with this particular useId call in this particular component.
 */

function PasswordField() {
  const passwordHintId = useId();
  return (
    <>
      <label>
        Password:
        <input type="password" aria-describedby={passwordHintId} />
      </label>
      <p id={passwordHintId}>
        The password should contain at least 18 characters
      </p>
    </>
  );
}
