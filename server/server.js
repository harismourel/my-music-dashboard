import "dotenv/config";
import express from "express";
import cors from "cors";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

// --------------------------------------------------
// PATHS
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_FILE = path.join(__dirname, "discogs-token.json");

// --------------------------------------------------
// DISCOGS CONFIG
// --------------------------------------------------

const CALLBACK_URL = "http://localhost:3000/auth/discogs/callback";

const consumer = {
  key: process.env.DISCOGS_CONSUMER_KEY,
  secret: process.env.DISCOGS_CONSUMER_SECRET,
};

const oauth = new OAuth({
  consumer,
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return crypto
      .createHmac("sha1", key)
      .update(baseString)
      .digest("base64");
  },
});

// --------------------------------------------------
// DISCOGS OAUTH URLS
// --------------------------------------------------

const REQUEST_TOKEN_URL = "https://api.discogs.com/oauth/request_token";

const AUTHORIZE_URL = "https://www.discogs.com/oauth/authorize";

const ACCESS_TOKEN_URL = "https://api.discogs.com/oauth/access_token";

const IDENTITY_URL = "https://api.discogs.com/oauth/identity";

// --------------------------------------------------
// TOKEN STORAGE
// --------------------------------------------------

function saveAccessToken(token) {
  fs.writeFileSync(
    TOKEN_FILE,
    JSON.stringify(token, null, 2),
    "utf8"
  );

  console.log("Access token stored.");
}

function loadAccessToken() {
  if (!fs.existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    const token = JSON.parse(
      fs.readFileSync(TOKEN_FILE, "utf8")
    );

    return token;
  } catch (error) {
    console.error("Could not read Discogs token file:", error);
    return null;
  }
}

// --------------------------------------------------
// LOAD EXISTING TOKEN ON SERVER START
// --------------------------------------------------

app.locals.discogsAccessToken = loadAccessToken();

if (app.locals.discogsAccessToken) {
  console.log("Existing Discogs access token loaded.");
} else {
  console.log("No Discogs access token found.");
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Music Dashboard backend is running",
  });
});

// --------------------------------------------------
// START DISCOGS AUTHENTICATION
// --------------------------------------------------

app.get("/auth/discogs", async (req, res) => {
  try {
    const requestData = {
      url: REQUEST_TOKEN_URL,
      method: "POST",
      data: {
        oauth_callback: CALLBACK_URL,
      },
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData)
    );

    const response = await fetch(REQUEST_TOKEN_URL, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        oauth_callback: CALLBACK_URL,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Request token error:", text);

      return res.status(response.status).send(text);
    }

    const params = new URLSearchParams(text);

    const oauthToken = params.get("oauth_token");
    const oauthTokenSecret = params.get("oauth_token_secret");

    if (!oauthToken || !oauthTokenSecret) {
      return res.status(500).json({
        error: "Discogs did not return request token.",
      });
    }

    // Request token is temporary.
    app.locals.discogsRequestToken = {
      key: oauthToken,
      secret: oauthTokenSecret,
    };

    console.log("Discogs request token received.");

    const authorizationUrl =
      `${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(
        oauthToken
      )}`;

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Discogs auth start error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// DISCOGS CALLBACK
// --------------------------------------------------

app.get("/auth/discogs/callback", async (req, res) => {
  try {
    const {
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
    } = req.query;

    if (!oauthToken || !oauthVerifier) {
      return res.status(400).json({
        error: "Missing oauth_token or oauth_verifier.",
      });
    }

    const requestToken = app.locals.discogsRequestToken;

    if (!requestToken) {
      return res.status(400).json({
        error: "Discogs request token is missing.",
      });
    }

    const token = {
      key: oauthToken,
      secret: requestToken.secret,
    };

    const requestData = {
      url: ACCESS_TOKEN_URL,
      method: "POST",
      data: {
        oauth_verifier: oauthVerifier,
      },
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, token)
    );

    const response = await fetch(ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        oauth_verifier: oauthVerifier,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Access token error:", text);

      return res.status(response.status).send(text);
    }

    const params = new URLSearchParams(text);

    const accessToken = params.get("oauth_token");
    const accessTokenSecret = params.get("oauth_token_secret");

    if (!accessToken || !accessTokenSecret) {
      return res.status(500).json({
        error: "Discogs did not return access token.",
      });
    }

    const finalToken = {
      key: accessToken,
      secret: accessTokenSecret,
    };

    // Save in memory
    app.locals.discogsAccessToken = finalToken;

    // Save permanently
    saveAccessToken(finalToken);

    console.log("Discogs authentication successful.");

    // Temporary request token no longer needed
    delete app.locals.discogsRequestToken;

    res.send(`
      <html>
        <head>
          <title>Discogs Connected</title>
        </head>

        <body style="font-family: Arial; padding: 40px;">
          <h1>Discogs connected successfully ✅</h1>

          <p>
            You can close this window and return to your dashboard.
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Discogs callback error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// DISCOGS IDENTITY
// --------------------------------------------------

app.get("/api/discogs/identity", async (req, res) => {
  try {
    const token = app.locals.discogsAccessToken;

    if (!token) {
      return res.status(401).json({
        error: "Discogs is not authenticated.",
      });
    }

    const requestData = {
      url: IDENTITY_URL,
      method: "GET",
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, token)
    );

    const response = await fetch(IDENTITY_URL, {
      method: "GET",
      headers: {
        ...authHeader,
        "User-Agent": "My Music Dashboard/1.0",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Identity error:", data);

      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Identity error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// DISCOGS COLLECTION
// --------------------------------------------------

app.get("/api/discogs/collection", async (req, res) => {
  try {
    const token = app.locals.discogsAccessToken;

    if (!token) {
      return res.status(401).json({
        error: "Discogs is not authenticated.",
      });
    }

    // ----------------------------------------------
    // GET USER IDENTITY
    // ----------------------------------------------

    const identityRequest = {
      url: IDENTITY_URL,
      method: "GET",
    };

    const identityHeaders = oauth.toHeader(
      oauth.authorize(identityRequest, token)
    );

    const identityResponse = await fetch(IDENTITY_URL, {
      method: "GET",
      headers: {
        ...identityHeaders,
        "User-Agent": "My Music Dashboard/1.0",
      },
    });

    const identityData = await identityResponse.json();

    if (!identityResponse.ok) {
      console.error("Identity error:", identityData);

      return res
        .status(identityResponse.status)
        .json(identityData);
    }

    const username = identityData.username;

    console.log("Getting collection for:", username);

    // ----------------------------------------------
    // COLLECTION URL
    // ----------------------------------------------

    const collectionUrl =
      `https://api.discogs.com/users/${encodeURIComponent(
        username
      )}/collection/folders/0/releases?page=1&per_page=1`;

    // ----------------------------------------------
    // COLLECTION REQUEST
    // ----------------------------------------------

    const collectionRequest = {
      url: collectionUrl,
      method: "GET",
    };

    const collectionHeaders = oauth.toHeader(
      oauth.authorize(collectionRequest, token)
    );

    const collectionResponse = await fetch(collectionUrl, {
      method: "GET",
      headers: {
        ...collectionHeaders,
        "User-Agent": "My Music Dashboard/1.0",
      },
    });

    const collectionData = await collectionResponse.json();

    console.log(
      "Collection status:",
      collectionResponse.status
    );

    if (!collectionResponse.ok) {
      console.error(
        "Collection error:",
        collectionData
      );

      return res
        .status(collectionResponse.status)
        .json(collectionData);
    }

    const totalItems =
      collectionData.pagination?.items ?? 0;

    console.log(
      "Total collection items:",
      totalItems
    );

    res.json({
      collection: collectionData,
    });
  } catch (error) {
    console.error("Collection error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// DISCOGS WANTLIST
// --------------------------------------------------

app.get("/api/discogs/wantlist", async (req, res) => {
  try {
    const token = app.locals.discogsAccessToken;

    if (!token) {
      return res.status(401).json({
        error: "Discogs is not authenticated.",
      });
    }

    // ----------------------------------------------
    // GET USER IDENTITY
    // ----------------------------------------------

    const identityRequest = {
      url: IDENTITY_URL,
      method: "GET",
    };

    const identityHeaders = oauth.toHeader(
      oauth.authorize(identityRequest, token)
    );

    const identityResponse = await fetch(IDENTITY_URL, {
      method: "GET",
      headers: {
        ...identityHeaders,
        "User-Agent": "My Music Dashboard/1.0",
      },
    });

    const identityData = await identityResponse.json();

    if (!identityResponse.ok) {
      console.error("Identity error:", identityData);

      return res
        .status(identityResponse.status)
        .json(identityData);
    }

    const username = identityData.username;

    console.log("Getting wantlist for:", username);

    // ----------------------------------------------
    // WANTLIST URL
    // ----------------------------------------------

    const wantlistUrl =
      `https://api.discogs.com/users/${encodeURIComponent(
        username
      )}/wants?page=1&per_page=1`;

    // ----------------------------------------------
    // WANTLIST REQUEST
    // ----------------------------------------------

    const wantlistRequest = {
      url: wantlistUrl,
      method: "GET",
    };

    const wantlistHeaders = oauth.toHeader(
      oauth.authorize(wantlistRequest, token)
    );

    const wantlistResponse = await fetch(wantlistUrl, {
      method: "GET",
      headers: {
        ...wantlistHeaders,
        "User-Agent": "My Music Dashboard/1.0",
      },
    });

    const wantlistData = await wantlistResponse.json();

    console.log(
      "Wantlist status:",
      wantlistResponse.status
    );

    if (!wantlistResponse.ok) {
      console.error(
        "Wantlist error:",
        wantlistData
      );

      return res
        .status(wantlistResponse.status)
        .json(wantlistData);
    }

    const totalItems =
      wantlistData.pagination?.items ?? 0;

    console.log(
      "Total wantlist items:",
      totalItems
    );

    res.json({
      wantlist: wantlistData,
    });
  } catch (error) {
    console.error("Wantlist error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// LOGOUT / REMOVE LOCAL DISCOGS TOKEN
// --------------------------------------------------

app.get("/auth/discogs/logout", (req, res) => {
  try {
    app.locals.discogsAccessToken = null;

    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }

    console.log("Local Discogs token removed.");

    res.json({
      success: true,
      message: "Discogs authentication removed locally.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});