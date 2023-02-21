export const ProgressiveLoad = ({
  value,
  loading
}: {
  value?: string | number;
  loading: boolean;
}) =>
  value ? (
    <b>{value}</b>
  ) : (
    <span className="tertiary">{loading ? 'loading...' : 'unavailable'}</span>
  );
