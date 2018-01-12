import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './OAuthHelper';

const oauthHelper: oAuthHelper = new oAuthHelper('bitbucket');
export async function getBitbucketTokens(req: any): Promise<any> {
	return await oauthHelper.getToken(req.headers.authorization);
}
export function setupBitbucketAuthentication(app: Application) {
	app.post('/api/bitbucket/passthrough', async (req, res) => {
		const tokenData = await getBitbucketTokens(req);

		if (!tokenData.authenticated) {
			res.sendStatus(401);
		}
		const response = await axios.get(req.body.url, {
			headers: {
				Authorization: `Bearer ${tokenData.token}`
			}
		});
		res.json(response.data);
	});

	app.get('/auth/bitbucket/authorize', (_, res) => {
		res.redirect(
			`https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.BITBUCKET_CLIENT_ID}&redirect_uri=${process.env
				.BITBUCKET_REDIRECT_URL}&scope=account+repository+webhook&response_type=code&state=`
		);
	});

	app.get('/auth/bitbucket/callback', (_, res) => {
		res.sendStatus(200);
	});

	app.post('/auth/bitbucket/storeToken', async (req, res) => {
		const code = oauthHelper.getParameterByName('code', req.body.redirUrl);

		try {
			const r = await axios.post(
				`https://bitbucket.org/site/oauth2/access_token`,
				`code=${code}&grant_type=authorization_code&redirect_uri=${process.env.BITBUCKET_REDIRECT_URL}`,
				{
					auth: {
						username: process.env.BITBUCKET_CLIENT_ID as string,
						password: process.env.BITBUCKET_CLIENT_SECRET as string
					},
					headers: {
						Referer: process.env.BITBUCKET_REDIRECT_URL,
						'Content-type': 'application/x-www-form-urlencoded'
					}
				}
			);
			const token = { access_token: r.data.access_token, refresh_token: r.data.refresh_token };
			oauthHelper.putTokenInArm(token.access_token, req.headers.authorization as string, token.refresh_token);
			res.sendStatus(200);
		} catch (err) {
			res.sendStatus(400);
		}
	});
}
