import { gql, useQuery } from '@apollo/client';
import { ProgressiveLoad } from './ProgressiveLoad';

export const WeatherCard = ({ ipAddress }: { ipAddress: string }) => {
  const { data, loading } = useQuery(
    gql`
      query ($ipAddress: String!) {
        locateIp(ip: $ipAddress) {
          ... on Location @defer {
            latitude
            longitude
          }
          ... on Location @defer {
            weather
            temperature
            tempMax
            tempMin
            feelsLike
          }
          ... on Location @defer {
            sunrise
            sunset
          }
          ... on Location @defer {
            moonPhaseImg
          }
        }
      }
    `,
    {
      variables: { ipAddress }
    }
  );

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div>
          💻 Your IP address is <b>{ipAddress}</b>
        </div>
        <div>
          🌐 Your lat/long is{' '}
          <ProgressiveLoad value={data?.locateIp?.latitude} loading={loading} />
          /
          <ProgressiveLoad
            value={data?.locateIp?.longitude}
            loading={loading}
          />
          .
        </div>
        <div>
          ☁️ The weather today is{' '}
          <ProgressiveLoad value={data?.locateIp?.weather} loading={loading} />.
        </div>
        <div>
          🌡️ The temperature is{' '}
          <ProgressiveLoad
            value={`${data?.locateIp?.temperature}°`}
            loading={loading}
          />{' '}
          (feels like{' '}
          <ProgressiveLoad
            value={`${data?.locateIp?.feelsLike}°`}
            loading={loading}
          />
          ) with a high of{' '}
          <ProgressiveLoad
            value={`${data?.locateIp?.tempMax}°`}
            loading={loading}
          />{' '}
          and a low of{' '}
          <ProgressiveLoad
            value={`${data?.locateIp?.tempMin}°`}
            loading={loading}
          />
          .
        </div>
        <div>
          🌅 Sunrise is at{' '}
          <ProgressiveLoad
            value={
              data?.locateIp?.sunrise
                ? new Date(data?.locateIp?.sunrise).toLocaleTimeString('en-US')
                : undefined
            }
            loading={loading}
          />
          .
        </div>
        <div>
          🌇 Sunset is at{' '}
          <ProgressiveLoad
            value={
              data?.locateIp?.sunset
                ? new Date(data?.locateIp?.sunset).toLocaleTimeString('en-US')
                : undefined
            }
            loading={loading}
          />
          .
        </div>
        🌔 The moon phase today is{' '}
        <ProgressiveLoad
          value={data?.locateIp?.moonPhaseImg ? '➡️' : undefined}
          loading={loading}
        />
      </div>
      {data?.locateIp?.moonPhaseImg && (
        <img
          height="168"
          src={data?.locateIp?.moonPhaseImg}
          alt="The moon phase today at the provided latitude and longitude."
        />
      )}
    </div>
  );
};
