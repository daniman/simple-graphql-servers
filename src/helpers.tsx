import { useContext } from 'react';
import { LoadingContext } from './DemoPage';

export const kelvinToFahrenheit = (kelvin?: number) =>
  kelvin ? `${(1.8 * (kelvin - 273) + 32).toFixed(0)}°` : undefined;

export const Row = ({
  emoji,
  children
}: {
  emoji: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
    <span style={{ width: 24 }}>{emoji}</span>
    <span style={{ flex: 1 }}>{children}</span>
  </div>
);

export const Datum = ({ value }: { value?: string | number }) => {
  const loading = useContext(LoadingContext);

  return value ? (
    <b>{value}</b>
  ) : (
    <span className="tertiary">{loading ? 'loading...' : 'loading...'}</span>
  );
};
