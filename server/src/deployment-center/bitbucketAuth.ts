import { Application } from 'express';
import axios from 'axios';
import { staticConfig } from '../config';

export async function getBitbucketTokens(req: any): Promise<any> {
	try {
		const r = await axios.get(
			`${staticConfig.config.env
				.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/Bitbucket?api-version=2016-03-01`,
			{
				headers: {
					Authorization: req.headers.authorization
				}
			}
		);
		const body = r.data;
		if (req && req.session && body && body.properties && body.properties.token) {
			return { authenticated: true, token: body.properties.token };
		} else {
			return { authenticated: false };
		}
	} catch (_) {
		return { authenticated: false };
	}
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

	function getParameterByName(name: string, url: string) {
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	app.get('/api/auth/bitbucket', (_, res) => {
		res.redirect(
			`https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.BITBUCKET_CLIENT_ID}&redirect_uri=${process.env
				.BITBUCKET_REDIRECT_URL}&scope=account+repository+webhook&response_type=code&state=`
		);
	});

	app.get('/auth/bitbucket/callback', (_, res) => {
		res.sendStatus(200);
	});

	app.post('/auth/bitbucket/storeToken', async (req, res) => {
		const code = getParameterByName('code', req.body.redirUrl);
		let token = {
			access_token: '',
			refresh_token: ''
		};
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
			token = { access_token: r.data.access_token, refresh_token: r.data.refresh_token };
		} catch (err) {
			res.sendStatus(400);
		}
		try {
			const c = await axios.put(
				`${staticConfig.config.env
					.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/Bitbucket?api-version=2016-03-01`,
				{
					name: 'Bitbucket',
					properties: {
						name: 'Bitbucket',
						token: token.access_token,
						refresh_token: token.refresh_token
					}
				},
				{
					headers: {
						Authorization: req.headers.authorization
					}
				}
			);

			res.sendStatus(200);
		} catch (err) {
			res.sendStatus(400);
		}
	});
}
