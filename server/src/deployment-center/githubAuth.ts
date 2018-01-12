import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './OAuthHelper';

const oauthHelper: oAuthHelper = new oAuthHelper('github');
export async function getGithubTokens(req: any): Promise<any> {
	return await oauthHelper.getToken(req.headers.authorization);
}

export function setupGithubAuthentication(app: Application) {
	app.post('/api/github/passthrough', async (req, res) => {
		const tokenData = await getGithubTokens(req);
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

	app.get('/auth/github/authorize', (req, res) => {
		let stateKey = '';
		if (req && req.session) {
			stateKey = req.session['dropbox_state_key'] = oauthHelper.newGuid();
		}
		res.redirect(
			`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env
				.GITHUB_REDIRECT_URL}&scope=admin:repo_hook+repo&response_type=code&state=${oauthHelper.hashStateGuid(stateKey)}`
		);
	});

	app.get('/auth/github/callback', (_, res) => {
		res.sendStatus(200);
	});

	app.post('/auth/github/storeToken', async (req, res) => {
		const state = oauthHelper.getParameterByName('state', req.body.redirUrl);

		if (
			!req ||
			!req.session ||
			!req.session['dropbox_state_key'] ||
			oauthHelper.hashStateGuid(req.session['dropbox_state_key']) !== state
		) {
			res.sendStatus(403);
			return;
		}
		const code = oauthHelper.getParameterByName('code', req.body.redirUrl);
		try {
			const r = await axios.post(`https://github.com/login/oauth/access_token`, {
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code: code
			});
			const token = oauthHelper.getParameterByName('access_token', '?' + r.data);
			oauthHelper.putTokenInArm(token, req.headers.authorization as string);
			res.sendStatus(200);
		} catch (err) {
			res.send(400);
		}
	});
}
