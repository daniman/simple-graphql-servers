import { gql, useQuery } from '@apollo/client';
import { kelvinToFahrenheit } from './helpers';
import { ProgressiveLoad } from './ProgressiveLoad';

export const WeatherCard = ({ ipAddress }: { ipAddress: string }) => {
  const { data, loading } = useQuery(
    gql`
      query ($ipAddress: String!) {
        ipLocation(ip: $ipAddress) {
          ... on Location @defer {
            latitude
            longitude
          }
          ... on Location @defer {
            neighbourhood
            county
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
        }
      }
    `,
    {
      variables: { ipAddress }
    }
  );

  return (
    <div>
      <div>
        💻 Your IP address is <b>{ipAddress}</b>
      </div>
      <div>
        🌐 Your lat/long is{' '}
        <ProgressiveLoad value={data?.ipLocation?.latitude} loading={loading} />
        /
        <ProgressiveLoad
          value={data?.ipLocation?.longitude}
          loading={loading}
        />
        .
      </div>
      <div>
        🏠 Neighbourhood:{' '}
        <ProgressiveLoad
          value={data?.ipLocation?.neighbourhood}
          loading={loading}
        />
      </div>
      <div>
        ☁️ The weather today is{' '}
        <ProgressiveLoad value={data?.ipLocation?.weather} loading={loading} />{' '}
        in{' '}
        <ProgressiveLoad value={data?.ipLocation?.county} loading={loading} />.
      </div>
      <div>
        🌡️ The temperature is{' '}
        <ProgressiveLoad
          value={kelvinToFahrenheit(data?.ipLocation?.temperature)}
          loading={loading}
        />{' '}
        (feels like{' '}
        <ProgressiveLoad
          value={kelvinToFahrenheit(data?.ipLocation?.feelsLike)}
          loading={loading}
        />
        ) with a high of{' '}
        <ProgressiveLoad
          value={kelvinToFahrenheit(data?.ipLocation?.tempMax)}
          loading={loading}
        />{' '}
        and a low of{' '}
        <ProgressiveLoad
          value={kelvinToFahrenheit(data?.ipLocation?.tempMin)}
          loading={loading}
        />
        .
      </div>
      <div>
        🌅 Sunrise is at{' '}
        <ProgressiveLoad
          value={
            data?.ipLocation?.sunrise
              ? new Date(data?.ipLocation?.sunrise).toLocaleTimeString('en-US')
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
            data?.ipLocation?.sunset
              ? new Date(data?.ipLocation?.sunset).toLocaleTimeString('en-US')
              : undefined
          }
          loading={loading}
        />
        .
      </div>
    </div>
  );
};
