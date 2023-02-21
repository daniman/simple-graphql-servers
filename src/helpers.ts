export const kelvinToFahrenheit = (kelvin?: number) =>
  kelvin ? `${(1.8 * (kelvin - 273) + 32).toFixed(0)}°` : undefined;
