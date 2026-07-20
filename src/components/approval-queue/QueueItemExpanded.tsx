import { useState, useEffect } from "react";
import type { NudgeRequest, DecisionStatus, ValidationResult } from "../../types";

interface Props {
  request: NudgeRequest;
  status: DecisionStatus;
  pendingValue?: number;
  onApprove: () => void;
  onDeny: () => void;
  onModify: (newValue: number) => ValidationResult;
  onPendingValueChange: (value: number) => void;
}

export function QueueItemExpanded({
  request,
  status,
  pendingValue,
  onApprove,
  onDeny,
  onModify,
  onPendingValueChange,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(
    String(pendingValue ?? request.value ?? "")
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(pendingValue ?? request.value ?? ""));
    setValidationError(null);
    setEditMode(false);
  }, [request.id, pendingValue, request.value]);

  const displayValue = pendingValue ?? request.value;
  const isResolved = status !== "pending";

  function handleInputChange(raw: string) {
    setInputValue(raw);
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setValidationError("Enter a valid number");
      return;
    }
    const result = onModify(num);
    if (!result.valid) {
      setValidationError(result.reason);
    } else {
      setValidationError(null);
      onPendingValueChange(num);
    }
  }

  function handleEditCommit() {
    if (!validationError) setEditMode(false);
  }

  return (
    <div data-nudge-item="expanded" data-status={status}>
      <div data-nudge-section="header">
        <span data-nudge-field="requester" />
        <span data-nudge-field="summary" />
        <span data-nudge-field="requested-at" />
      </div>

      {request.detail && <p data-nudge-field="detail" />}

      {(displayValue !== undefined || request.constraint) && (
        <div data-nudge-section="value-constraint">
          {displayValue !== undefined && (
            <div data-nudge-field="value">
              {editMode ? (
                <input
                  autoFocus
                  type="number"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleEditCommit}
                  onKeyDown={(e) => e.key === "Enter" && handleEditCommit()}
                />
              ) : (
                <span />
              )}
              {!isResolved && (
                <div data-nudge-action="edit" onClick={() => setEditMode((v) => !v)} />
              )}
            </div>
          )}

          {request.constraint && (
            <div data-nudge-field="constraint">
              <span data-nudge-field="constraint-label" />
              <span data-nudge-field="constraint-limit" />
            </div>
          )}

          {validationError && <p data-nudge-field="validation-error" />}
        </div>
      )}

      {!isResolved && (
        <div data-nudge-section="actions">
          <div data-nudge-action="deny" onClick={onDeny} />
          <div data-nudge-action="approve" onClick={onApprove} />
        </div>
      )}

      {isResolved && (
        <div data-nudge-section="status-overlay" data-status={status} />
      )}
    </div>
  );
}
