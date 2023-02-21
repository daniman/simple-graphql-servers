import { useEffect, useState, createContext } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Row, Datum, kelvinToFahrenheit } from './helpers';

export const DemoPage = () => {
  const [ipAddress, setIpAddress] = useState<string>('12345');

  useEffect(() => {
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((res) => {
        setIpAddress(res);
      });
  }, []);

  return (
    <>
      <Link to="/">Go home</Link>
      <h2 style={{ marginTop: 40 }}>What is the weather today?</h2>
      {ipAddress && <LocalityInfo ipAddress={ipAddress} />}
    </>
  );
};

export const LoadingContext = createContext(false);

const LocalityInfo = ({ ipAddress }: { ipAddress: string }) => {
  const { data, loading } = useQuery(
    gql`
      query ($ip: String!) {
        ipLocation(ip: $ip) {
          latitude
          longitude
        }
      }
    `,
    {
      variables: { ip: ipAddress }
    }
  );

  const location = data?.ipLocation || {};

  return (
    <LoadingContext.Provider value={loading}>
      <Row emoji="💻 ">
        Your IP address is <b>{ipAddress}</b>
      </Row>
      <Row emoji="🌐">
        Your lat/long is <Datum value={location.latitude} />
        /
        <Datum value={location.longitude} />.
      </Row>
      <Row emoji="☁️">
        The weather today is <Datum value={location.weather} />
      </Row>
      <Row emoji="🌡️">
        The temperature is{' '}
        <Datum value={kelvinToFahrenheit(location.temperature)} /> with a high
        of <Datum value={kelvinToFahrenheit(location.tempMax)} /> and a low of{' '}
        <Datum value={kelvinToFahrenheit(location.tempMin)} />.
      </Row>
      <Row emoji="🌔">
        The moon phase today is{' '}
        <Datum value={location.moonPhaseImg ? '➡️' : undefined} />
      </Row>

      {location.moonPhaseImg && (
        <img
          height="168"
          src={location.moonPhaseImg}
          alt="The moon phase today at the provided latitude and longitude."
        />
      )}
    </LoadingContext.Provider>
  );
};
