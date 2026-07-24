import "./Glass.css";

/**
 * Stable frosted glass panel.
 * @liquidglass/react olib tashlandi — SVG displacement + live backdrop
 * scroll paytida rang/blur "miltiltash" berardi.
 */
function Glass({
  children,
  className = "",
  contentClassName = "",
  borderRadius = 22,
  // legacy props — e'tiborsiz (API mosligi)
  blur: _blur,
  contrast: _contrast,
  brightness: _brightness,
  saturation: _saturation,
  shadowIntensity: _shadow,
  displacementScale: _disp,
  elasticity: _elas,
}) {
  return (
    <div
      className={`lg-host glass-panel ${className}`.trim()}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div className="glass-panel-shine" aria-hidden="true" />
      <div className={`lg-content ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
}

export default Glass;
