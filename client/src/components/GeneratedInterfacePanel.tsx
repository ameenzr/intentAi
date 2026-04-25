import { useEffect, useState } from "react";
import type {
  GeneratedControl,
  GeneratedInterface
} from "../types/generatedInterface";

type GeneratedInterfacePanelProps = {
  generatedInterface: Partial<GeneratedInterface>;
  showHeader?: boolean;
  autoAppliedControlIds?: string[];
  onControlChange?: (capabilityId: string, value: ControlValue) => void;
  onControlAction?: (capabilityId: string) => void;
};

type ControlValue = string | number | boolean;
type RenderableControl = Partial<GeneratedControl> & {
  capabilityId?: unknown;
  componentType?: unknown;
};

const supportedComponentTypes = new Set([
  "slider",
  "button",
  "select",
  "color_picker",
  "toggle",
  "text_input"
]);

const getControlId = (control: RenderableControl, index: number) =>
  typeof control.capabilityId === "string"
    ? control.capabilityId
    : `control-${index}`;

const getControlLabel = (control: RenderableControl) =>
  typeof control.label === "string" && control.label.trim()
    ? control.label
    : "Untitled control";

const getInitialValue = (control: RenderableControl): ControlValue => {
  if (control.suggestedDefault !== undefined) {
    return control.suggestedDefault;
  }

  if (control.componentType === "slider") {
    return control.min ?? 0;
  }

  if (control.componentType === "select") {
    return control.options?.[0] ?? "";
  }

  if (control.componentType === "color_picker") {
    return "#ffffff";
  }

  if (control.componentType === "toggle") {
    return false;
  }

  return "";
};

const getInitialValues = (controls: RenderableControl[]) =>
  controls.reduce<Record<string, ControlValue>>((values, control, index) => {
    values[getControlId(control, index)] = getInitialValue(control);
    return values;
  }, {});

function GeneratedInterfacePanel({
  generatedInterface,
  showHeader = true,
  autoAppliedControlIds = [],
  onControlChange,
  onControlAction
}: GeneratedInterfacePanelProps) {
  const controls = Array.isArray(generatedInterface.controls)
    ? generatedInterface.controls
    : [];

  const [controlValues, setControlValues] = useState<Record<string, ControlValue>>(
    () => getInitialValues(controls)
  );
  const autoAppliedControls = new Set(autoAppliedControlIds);

  useEffect(() => {
    setControlValues(getInitialValues(controls));
  }, [generatedInterface]);

  const updateControlValue = (
    capabilityId: string,
    value: ControlValue
  ) => {
    setControlValues((currentValues) => ({
      ...currentValues,
      [capabilityId]: value
    }));
    onControlChange?.(capabilityId, value);
  };

  const renderControlInput = (control: RenderableControl, index: number) => {
    const controlId = getControlId(control, index);
    const controlLabel = getControlLabel(control);
    const value = controlValues[controlId] ?? getInitialValue(control);

    if (
      typeof control.componentType !== "string" ||
      !supportedComponentTypes.has(control.componentType)
    ) {
      return (
        <div className="unsupported-control-card">
          <strong>{controlLabel}</strong>
          <p>Unsupported control type</p>
        </div>
      );
    }

    if (control.componentType === "slider") {
      const numericValue = Number(value);

      return (
        <div className="generated-slider">
          <input
            min={control.min ?? 0}
            max={control.max ?? 100}
            type="range"
            value={numericValue}
            onChange={(event) =>
              updateControlValue(controlId, Number(event.target.value))
            }
          />
          <output>{numericValue}</output>
        </div>
      );
    }

    if (control.componentType === "button") {
      return (
        <button
          className="generated-action-button"
          type="button"
          onClick={() => onControlAction?.(controlId)}
        >
          {controlLabel}
        </button>
      );
    }

    if (control.componentType === "select") {
      return (
        <select
          value={String(value)}
          onChange={(event) =>
            updateControlValue(controlId, event.target.value)
          }
        >
          {(control.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (control.componentType === "color_picker") {
      return (
        <div className="generated-color-control">
          <input
            aria-label={controlLabel}
            type="color"
            value={String(value)}
            onChange={(event) =>
              updateControlValue(controlId, event.target.value)
            }
          />
          <span>{String(value)}</span>
        </div>
      );
    }

    if (control.componentType === "toggle") {
      return (
        <label className="generated-toggle">
          <input
            checked={Boolean(value)}
            type="checkbox"
            onChange={(event) =>
              updateControlValue(controlId, event.target.checked)
            }
          />
          <span>{Boolean(value) ? "On" : "Off"}</span>
        </label>
      );
    }

    return (
      <input
        className="generated-text-input"
        placeholder={controlLabel}
        type="text"
        value={String(value)}
        onChange={(event) =>
          updateControlValue(controlId, event.target.value)
        }
      />
    );
  };

  if (controls.length === 0) {
    return (
      <section className="interface-empty-state">
        <h2>Describe your goal above and click Generate to build your interface.</h2>
      </section>
    );
  }

  return (
    <section className="generated-interface-panel">
      {showHeader ? (
        <header className="generated-interface-header">
          <div>
            <p className="section-label">Generated interface</p>
            <h2>{generatedInterface.interfaceTitle ?? "Generated interface"}</h2>
            <p>{generatedInterface.intentSummary ?? "A generated workspace is ready."}</p>
          </div>
        </header>
      ) : null}

      <div className="workflow-panel">
        <h3>Recommended workflow</h3>
        <ol>
          {Array.isArray(generatedInterface.recommendedWorkflow) &&
          generatedInterface.recommendedWorkflow.length > 0 ? (
            generatedInterface.recommendedWorkflow.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))
          ) : (
            <li>Start with the first control and adjust gently.</li>
          )}
        </ol>
      </div>

      <div className="generated-control-list">
        {controls.map((control, index) => {
          const controlId = getControlId(control, index);
          const isAutoApplied = autoAppliedControls.has(controlId);

          return (
            <article
              className={`generated-control-card${
                isAutoApplied ? " generated-control-card-applied" : ""
              }`}
              key={controlId}
            >
              <div className="generated-control-heading">
                <div>
                  <h3>{getControlLabel(control)}</h3>
                  <span>{controlId}</span>
                </div>
                <div className="generated-control-badges">
                  <small>
                    {typeof control.componentType === "string"
                      ? control.componentType
                      : "unknown"}
                  </small>
                  {isAutoApplied ? (
                    <small className="generated-applied-badge">Applied</small>
                  ) : null}
                </div>
              </div>

              {renderControlInput(control, index)}

              <p className="generated-purpose">
                {control.purpose ?? "This control helps refine the result."}
              </p>
              <p className="generated-pro-tip">
                <strong>Pro tip</strong>
                {control.proTip ?? "Make small changes and compare the result."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default GeneratedInterfacePanel;
