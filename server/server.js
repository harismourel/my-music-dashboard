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

const TOKEN_FILE = path.join(
  __dirname,
  "discogs-token.json"
);

// --------------------------------------------------
// DISCOGS CONFIG
// --------------------------------------------------

const CALLBACK_URL =
  "http://localhost:3000/auth/discogs/callback";

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
// DISCOGS URLS
// --------------------------------------------------

const REQUEST_TOKEN_URL =
  "https://api.discogs.com/oauth/request_token";

const AUTHORIZE_URL =
  "https://www.discogs.com/oauth/authorize";

const ACCESS_TOKEN_URL =
  "https://api.discogs.com/oauth/access_token";

const IDENTITY_URL =
  "https://api.discogs.com/oauth/identity";

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
    return JSON.parse(
      fs.readFileSync(TOKEN_FILE, "utf8")
    );
  } catch (error) {
    console.error(
      "Could not read Discogs token file:",
      error
    );

    return null;
  }
}

// --------------------------------------------------
// LOAD EXISTING TOKEN
// --------------------------------------------------

app.locals.discogsAccessToken =
  loadAccessToken();

if (app.locals.discogsAccessToken) {
  console.log(
    "Existing Discogs access token loaded."
  );
} else {
  console.log(
    "No Discogs access token found."
  );
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Music Dashboard API is running.",
  });
});

// --------------------------------------------------
// DISCOGS OAUTH - START
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

    const headers = oauth.toHeader(
      oauth.authorize(requestData)
    );

    const response = await fetch(
      REQUEST_TOKEN_URL,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type":
            "application/x-www-form-urlencoded",
          "User-Agent":
            "My Music Dashboard/1.0",
        },
        body: new URLSearchParams({
          oauth_callback: CALLBACK_URL,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(
        "Discogs request token error:",
        text
      );

      return res
        .status(response.status)
        .send(text);
    }

    const params = new URLSearchParams(text);

    const oauthToken =
      params.get("oauth_token");

    const oauthTokenSecret =
      params.get("oauth_token_secret");

    if (
      !oauthToken ||
      !oauthTokenSecret
    ) {
      return res.status(500).json({
        error:
          "Could not get Discogs request token.",
      });
    }

    req.session = {
      oauthToken,
      oauthTokenSecret,
    };

    res.redirect(
      `${AUTHORIZE_URL}?oauth_token=${oauthToken}`
    );
  } catch (error) {
    console.error(
      "Discogs OAuth start error:",
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// DISCOGS OAUTH - CALLBACK
// --------------------------------------------------

app.get(
  "/auth/discogs/callback",
  async (req, res) => {
    try {
      const {
        oauth_token,
        oauth_verifier,
      } = req.query;

      if (
        !oauth_token ||
        !oauth_verifier
      ) {
        return res.status(400).json({
          error:
            "Missing OAuth token or verifier.",
        });
      }

      const requestTokenSecret =
        req.session?.oauthTokenSecret;

      if (!requestTokenSecret) {
        return res.status(400).json({
          error:
            "OAuth session information is missing.",
        });
      }

      const accessTokenRequest = {
        url: ACCESS_TOKEN_URL,
        method: "POST",
        data: {
          oauth_token,
          oauth_verifier,
        },
      };

      const accessTokenHeaders =
        oauth.toHeader(
          oauth.authorize(
            accessTokenRequest,
            {
              key: oauth_token,
              secret: requestTokenSecret,
            }
          )
        );

      const response = await fetch(
        ACCESS_TOKEN_URL,
        {
          method: "POST",
          headers: {
            ...accessTokenHeaders,
            "Content-Type":
              "application/x-www-form-urlencoded",
            "User-Agent":
              "My Music Dashboard/1.0",
          },
          body: new URLSearchParams({
            oauth_token,
            oauth_verifier,
          }),
        }
      );

      const text = await response.text();

      if (!response.ok) {
        console.error(
          "Discogs access token error:",
          text
        );

        return res
          .status(response.status)
          .send(text);
      }

      const params =
        new URLSearchParams(text);

      const accessToken = {
        key: params.get("oauth_token"),
        secret: params.get(
          "oauth_token_secret"
        ),
      };

      if (
        !accessToken.key ||
        !accessToken.secret
      ) {
        return res.status(500).json({
          error:
            "Could not get Discogs access token.",
        });
      }

      // Save token permanently
      saveAccessToken(accessToken);

      // Keep token in memory
      app.locals.discogsAccessToken =
        accessToken;

      console.log(
        "Discogs access token saved."
      );

      res.send(`
        <html>
          <body
            style="
              background:#252832;
              color:white;
              font-family:Arial;
              display:flex;
              align-items:center;
              justify-content:center;
              height:100vh;
            "
          >
            <div style="text-align:center;">
              <h1>Discogs Connected</h1>
              <p>You can close this window.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error(
        "Discogs OAuth callback error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// DISCOGS IDENTITY
// --------------------------------------------------

app.get(
  "/api/discogs/identity",
  async (req, res) => {
    try {
      const token =
        app.locals.discogsAccessToken;

      if (!token) {
        return res.status(401).json({
          error:
            "Discogs is not authenticated.",
        });
      }

      const request = {
        url: IDENTITY_URL,
        method: "GET",
      };

      const headers = oauth.toHeader(
        oauth.authorize(request, token)
      );

      const response = await fetch(
        IDENTITY_URL,
        {
          method: "GET",
          headers: {
            ...headers,
            "User-Agent":
              "My Music Dashboard/1.0",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        return res
          .status(response.status)
          .json(data);
      }

      console.log(
        "Discogs identity:",
        data
      );

      res.json(data);
    } catch (error) {
      console.error(
        "Discogs identity error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// DISCOGS COLLECTION
// --------------------------------------------------

app.get(
  "/api/discogs/collection",
  async (req, res) => {
    try {
      const token =
        app.locals.discogsAccessToken;

      if (!token) {
        return res.status(401).json({
          error:
            "Discogs is not authenticated.",
        });
      }

      // Get identity
      const identityRequest = {
        url: IDENTITY_URL,
        method: "GET",
      };

      const identityHeaders =
        oauth.toHeader(
          oauth.authorize(
            identityRequest,
            token
          )
        );

      const identityResponse =
        await fetch(
          IDENTITY_URL,
          {
            method: "GET",
            headers: {
              ...identityHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const identityData =
        await identityResponse.json();

      if (!identityResponse.ok) {
        return res
          .status(identityResponse.status)
          .json(identityData);
      }

      const username =
        identityData.username;

      console.log(
        "Getting collection for:",
        username
      );

      const collectionUrl =
        `https://api.discogs.com/users/${encodeURIComponent(
          username
        )}/collection/folders/0/releases?page=1&per_page=1`;

      const collectionRequest = {
        url: collectionUrl,
        method: "GET",
      };

      const collectionHeaders =
        oauth.toHeader(
          oauth.authorize(
            collectionRequest,
            token
          )
        );

      const collectionResponse =
        await fetch(
          collectionUrl,
          {
            method: "GET",
            headers: {
              ...collectionHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const collectionData =
        await collectionResponse.json();

      if (!collectionResponse.ok) {
        return res
          .status(collectionResponse.status)
          .json(collectionData);
      }

      console.log(
        "Collection received!"
      );

      console.log(
        "Total collection items:",
        collectionData.pagination?.items
      );

      res.json({
        collection:
          collectionData,
      });
    } catch (error) {
      console.error(
        "Discogs collection error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// DISCOGS WANTLIST
// --------------------------------------------------

app.get(
  "/api/discogs/wantlist",
  async (req, res) => {
    try {
      const token =
        app.locals.discogsAccessToken;

      if (!token) {
        return res.status(401).json({
          error:
            "Discogs is not authenticated.",
        });
      }

      // Get identity
      const identityRequest = {
        url: IDENTITY_URL,
        method: "GET",
      };

      const identityHeaders =
        oauth.toHeader(
          oauth.authorize(
            identityRequest,
            token
          )
        );

      const identityResponse =
        await fetch(
          IDENTITY_URL,
          {
            method: "GET",
            headers: {
              ...identityHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const identityData =
        await identityResponse.json();

      if (!identityResponse.ok) {
        return res
          .status(identityResponse.status)
          .json(identityData);
      }

      const username =
        identityData.username;

      console.log(
        "Getting wantlist for:",
        username
      );

      const wantlistUrl =
        `https://api.discogs.com/users/${encodeURIComponent(
          username
        )}/wants?page=1&per_page=1`;

      const wantlistRequest = {
        url: wantlistUrl,
        method: "GET",
      };

      const wantlistHeaders =
        oauth.toHeader(
          oauth.authorize(
            wantlistRequest,
            token
          )
        );

      const wantlistResponse =
        await fetch(
          wantlistUrl,
          {
            method: "GET",
            headers: {
              ...wantlistHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const wantlistData =
        await wantlistResponse.json();

      if (!wantlistResponse.ok) {
        return res
          .status(wantlistResponse.status)
          .json(wantlistData);
      }

      console.log(
        "Wantlist received!"
      );

      console.log(
        "Total wantlist items:",
        wantlistData.pagination?.items
      );

      res.json({
        wantlist:
          wantlistData,
      });
    } catch (error) {
      console.error(
        "Discogs wantlist error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// DISCOGS STATS
// --------------------------------------------------

app.get(
  "/api/discogs/stats",
  async (req, res) => {
    try {
      const token =
        app.locals.discogsAccessToken;

      if (!token) {
        return res.status(401).json({
          error:
            "Discogs is not authenticated.",
        });
      }

      // --------------------------------------------------
      // IDENTITY
      // --------------------------------------------------

      const identityRequest = {
        url: IDENTITY_URL,
        method: "GET",
      };

      const identityHeaders =
        oauth.toHeader(
          oauth.authorize(
            identityRequest,
            token
          )
        );

      const identityResponse =
        await fetch(
          IDENTITY_URL,
          {
            method: "GET",
            headers: {
              ...identityHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const identityData =
        await identityResponse.json();

      if (!identityResponse.ok) {
        return res
          .status(identityResponse.status)
          .json(identityData);
      }

      const username =
        identityData.username;

      console.log(
        "Getting Discogs stats for:",
        username
      );

      // --------------------------------------------------
      // COLLECTION
      // --------------------------------------------------

      const collectionUrl =
        `https://api.discogs.com/users/${encodeURIComponent(
          username
        )}/collection/folders/0/releases?page=1&per_page=1`;

      const collectionRequest = {
        url: collectionUrl,
        method: "GET",
      };

      const collectionHeaders =
        oauth.toHeader(
          oauth.authorize(
            collectionRequest,
            token
          )
        );

      const collectionResponse =
        await fetch(
          collectionUrl,
          {
            method: "GET",
            headers: {
              ...collectionHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const collectionData =
        await collectionResponse.json();

      if (!collectionResponse.ok) {
        return res
          .status(collectionResponse.status)
          .json(collectionData);
      }

      const totalRecords =
        collectionData.pagination?.items ?? 0;

      // --------------------------------------------------
      // WANTLIST
      // --------------------------------------------------

      const wantlistUrl =
        `https://api.discogs.com/users/${encodeURIComponent(
          username
        )}/wants?page=1&per_page=1`;

      const wantlistRequest = {
        url: wantlistUrl,
        method: "GET",
      };

      const wantlistHeaders =
        oauth.toHeader(
          oauth.authorize(
            wantlistRequest,
            token
          )
        );

      const wantlistResponse =
        await fetch(
          wantlistUrl,
          {
            method: "GET",
            headers: {
              ...wantlistHeaders,
              "User-Agent":
                "My Music Dashboard/1.0",
            },
          }
        );

      const wantlistData =
        await wantlistResponse.json();

      if (!wantlistResponse.ok) {
        return res
          .status(wantlistResponse.status)
          .json(wantlistData);
      }

      const totalWantlist =
        wantlistData.pagination?.items ?? 0;

      // --------------------------------------------------
      // RESPONSE
      // --------------------------------------------------

      console.log("Discogs stats:", {
        totalRecords,
        totalWantlist,
      });

      res.json({
        username,
        totalRecords,
        totalWantlist,
      });
    } catch (error) {
      console.error(
        "Discogs stats error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// DISCOGS LOGOUT
// --------------------------------------------------

app.get(
  "/auth/discogs/logout",
  (req, res) => {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
      }

      app.locals.discogsAccessToken =
        null;

      console.log(
        "Discogs access token removed."
      );

      res.json({
        message:
          "Discogs disconnected successfully.",
      });
    } catch (error) {
      console.error(
        "Discogs logout error:",
        error
      );

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});