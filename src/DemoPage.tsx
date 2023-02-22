import { useEffect, useState, createContext } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Row, Datum } from './helpers';

export const LoadingContext = createContext(false);

export const DemoPage = () => {
  const [ipAddress, setIpAddress] = useState<string>();

  useEffect(() => {
    // fetch IP address for this internet connection
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((res) => {
        setIpAddress(res);
      });
  }, []);

  return (
    <>
      <h2>What is the weather today?</h2>
      {ipAddress && <LocalityInfo ipAddress={ipAddress} />}
    </>
  );
};

const LocalityInfo = ({ ipAddress }: { ipAddress: string }) => {
  const { data, loading } = useQuery(
    gql`
      query IpLocation($ip: String!) {
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

  return (
    <LoadingContext.Provider value={loading}>
      <Row emoji="💻">
        Your IP address is <b>{ipAddress}</b>
      </Row>
      <Row emoji="🌐">
        Your lat/long is <Datum value={data?.ipLocation?.latitude} />/
        <Datum value={data?.ipLocation?.longitude} />.
      </Row>
    </LoadingContext.Provider>
  );
};

// ☁️🌡️
