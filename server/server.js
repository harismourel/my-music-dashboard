import "dotenv/config";
import express from "express";
import cors from "cors";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

const app = express();

const PORT = 3000;
const CALLBACK_URL = "http://localhost:3000/auth/discogs/callback";

app.use(cors());
app.use(express.json());

const oauth = new OAuth({
  consumer: {
    key: process.env.DISCOGS_CONSUMER_KEY,
    secret: process.env.DISCOGS_CONSUMER_SECRET,
  },

  signature_method: "HMAC-SHA1",

  hash_function(baseString, key) {
    return crypto
      .createHmac("sha1", key)
      .update(baseString)
      .digest("base64");
  },
});

const REQUEST_TOKEN_URL =
  "https://api.discogs.com/oauth/request_token";

const AUTHORIZE_URL =
  "https://www.discogs.com/oauth/authorize";

const ACCESS_TOKEN_URL =
  "https://api.discogs.com/oauth/access_token";

/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    message: "Discogs backend is running!",
  });
});

/*
|--------------------------------------------------------------------------
| Start Discogs OAuth
|--------------------------------------------------------------------------
*/

app.get("/auth/discogs", async (req, res) => {
  try {
    const requestData = {
      url: REQUEST_TOKEN_URL,
      method: "POST",
      data: {
        oauth_callback: CALLBACK_URL,
      },
    };

    const authorization = oauth.authorize(requestData);

    const headers = oauth.toHeader(authorization);

    headers["User-Agent"] = "MyMusicDashboard/1.0";

    const response = await fetch(REQUEST_TOKEN_URL, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Discogs request token error:");
      console.error(errorText);

      return res.status(response.status).send(errorText);
    }

    const text = await response.text();

    console.log("Discogs request token response:");
    console.log(text);

    const params = new URLSearchParams(text);

    const requestToken = params.get("oauth_token");
    const requestTokenSecret = params.get("oauth_token_secret");

    if (!requestToken || !requestTokenSecret) {
      return res.status(500).json({
        error: "Discogs did not return a request token.",
      });
    }

    /*
     * Προσωρινά αποθηκεύουμε το request token.
     * Αργότερα θα χρησιμοποιήσουμε session/database.
     */
    app.locals.discogsRequestToken = {
      key: requestToken,
      secret: requestTokenSecret,
    };

    const authorizationUrl =
      `${AUTHORIZE_URL}?oauth_token=${requestToken}`;

    console.log("Redirecting to Discogs...");

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("OAuth error:", error);

    res.status(500).json({
      error: "Could not connect to Discogs.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Discogs OAuth Callback
|--------------------------------------------------------------------------
*/

app.get("/auth/discogs/callback", async (req, res) => {
  try {
    const { oauth_token, oauth_verifier } = req.query;

    if (!oauth_token || !oauth_verifier) {
      return res.status(400).json({
        error: "Missing oauth_token or oauth_verifier.",
      });
    }

    const requestToken = app.locals.discogsRequestToken;

    if (!requestToken) {
      return res.status(400).json({
        error: "Request token not found.",
      });
    }

    const token = {
      key: requestToken.key,
      secret: requestToken.secret,
    };

    const requestData = {
      url: ACCESS_TOKEN_URL,
      method: "POST",
      data: {
        oauth_verifier,
      },
    };

    const authorization = oauth.authorize(requestData, token);

    const headers = oauth.toHeader(authorization);

    headers["User-Agent"] = "MyMusicDashboard/1.0";

    const response = await fetch(ACCESS_TOKEN_URL, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Discogs access token error:");
      console.error(errorText);

      return res.status(response.status).send(errorText);
    }

    const text = await response.text();

    console.log("Discogs access token response:");
    console.log(text);

    const params = new URLSearchParams(text);

    const accessToken = params.get("oauth_token");
    const accessTokenSecret = params.get("oauth_token_secret");

    if (!accessToken || !accessTokenSecret) {
      return res.status(500).json({
        error: "Discogs did not return an access token.",
      });
    }

    /*
     * Για τώρα αποθηκεύουμε προσωρινά τα credentials
     * στη μνήμη του server.
     */
    app.locals.discogsAccessToken = {
      key: accessToken,
      secret: accessTokenSecret,
    };

    console.log("Discogs authentication successful!");

    res.json({
      message: "Successfully connected to Discogs!",
    });
  } catch (error) {
    console.error("Callback error:", error);

    res.status(500).json({
      error: "Discogs authentication failed.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});