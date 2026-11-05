import * as Location from 'expo-location';

export async function requestAndFetchLocation(): Promise<{coords: Location.LocationObjectCoords, permission: boolean} | null> {
  // Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  // Get location
  const loc = await Location.getCurrentPositionAsync({});
  return { coords: loc.coords, permission: true };
}

export async function getLocationNameFromCoords(lat: number, lng: number, apiKey: string): Promise<string | null> {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('OpenCage API response:', JSON.stringify(data, null, 2));
    if (data.results && data.results[0] && data.results[0].components) {
      const comps = data.results[0].components;
      const city = comps.city || comps.town || comps.village || comps.hamlet || comps.county || '';
      const province = comps.state || comps.province || comps.region || '';
      const country = comps.country || '';
      let parts = [];
      if (city) parts.push(city);
      if (province) parts.push(province);
      if (country) parts.push(country);
      if (parts.length > 0) {
        return parts.join(', ');
      }
      if (data.results[0].formatted) {
        return data.results[0].formatted;
      }
    }
    if (data.status && data.status.message) {
      console.error('OpenCage API error:', data.status.message);
    }
    return null;
  } catch (e) {
    console.error('OpenCage fetch error:', e);
    return null;
  }
}
