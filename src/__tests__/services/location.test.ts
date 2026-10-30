/**
 * @jest-environment node
 */
import { locationService } from '@/services/location.service';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('locationService', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('loads countries from the location API base URL, sorted', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        json({
          error: false,
          msg: '',
          data: [
            { name: 'India', Iso2: 'IN' },
            { name: 'Bhutan', Iso2: 'BT' },
          ],
        }),
      ),
    );
    await expect(locationService.getCountries()).resolves.toEqual([
      { name: 'Bhutan', iso2: 'BT' },
      { name: 'India', iso2: 'IN' },
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe('https://countriesnow.space/api/v0.1/countries/iso');
    // Third-party API: no custom header (avoids a CORS preflight it may reject).
    expect((fetchMock.mock.calls[0][1].headers as Headers).has('X-Client-App')).toBe(false);
  });

  it('POSTs the country to get cities, de-duplicated and sorted', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(json({ error: false, msg: '', data: ['Pune', 'Delhi', 'Pune'] })),
    );
    await expect(locationService.getCities('India')).resolves.toEqual(['Delhi', 'Pune']);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: '{"country":"India"}',
    });
  });

  it('falls back to built-in data when the API fails', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({}, 500)));
    const cities = await locationService.getCities('India');
    expect(cities).toContain('Mumbai');
    const countries = await locationService.getCountries();
    expect(countries.map((c) => c.name)).toContain('India');
  });
});
