const baseUrl = 'https://api.zoom.us/v2';

type Error = {
  code: string;
  message: string;
};

const processRequest = async <Response>(url: URL, jwtToken: string) => {
  const headers = {
    'User-Agent': 'React-Native-Zoom-Us-Test',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };
  const response = await fetch(url.toString(), {
    headers,
  });

  const json = (await response.json()) as Error | Response;

  if ('code' in json) {
    throw new Error(json.message);
  }

  return json;
};

type UsersResponse = {
  users: {
    pmi: string;
    id: string;
  }[];
};
const getUsers = async (jwtToken: string) => {
  const url = new URL(`${baseUrl}/users`);
  url.searchParams.append('status', 'active');

  return processRequest<UsersResponse>(url, jwtToken);
};

type UserTokenResponse = {
  token: string;
};
const getUserToken = async (id: string, jwtToken: string) => {
  const url = new URL(`${baseUrl}/users/${id}/token`);
  url.searchParams.append('type', 'zak');
  url.searchParams.append('ttl', '3600');

  return processRequest<UserTokenResponse>(url, jwtToken);
};

const main = async (jwtToken: string) => {
  const usersResponse = await getUsers(jwtToken);

  const [firstUser] = usersResponse.users || [];
  if (!firstUser || !firstUser.pmi || !firstUser.id) {
    throw new Error('Could not find user with personal meeting id');
  }

  const userTokenResponse = await getUserToken(firstUser.id, jwtToken);
  if (!userTokenResponse.token) {
    throw new Error('Could not find token');
  }

  const data = {
    userId: firstUser.id,
    meetingNumber: firstUser.pmi.toString(),
    zoomAccessToken: userTokenResponse.token,
  };
  console.log(JSON.stringify(data, null, 2));
  return data;
};

// main().catch(e => console.error(e));

export default main;
