import { Router, Request, Response } from "express";

export const authRouter = Router();

/**
 * GET /api/auth/token — Exchange Teams SSO token for an access token.
 * For now, returns user info from the Teams context.
 * In production, this would validate the token with Microsoft Entra ID.
 */
authRouter.get("/token", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      // In demo mode, return a mock user
      res.json({
        userId: "demo-user",
        displayName: "Demo User",
        email: "demo@example.com",
        mode: "demo",
      });
      return;
    }

    const token = authHeader.slice(7);

    // Validate token with Microsoft Entra ID
    const clientId = process.env.AAD_APP_CLIENT_ID;
    const clientSecret = process.env.SECRET_AAD_APP_CLIENT_SECRET;
    const tenantId = process.env.AAD_APP_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      // Fall back to demo mode
      res.json({
        userId: "demo-user",
        displayName: "Demo User",
        email: "demo@example.com",
        mode: "demo",
      });
      return;
    }

    // Exchange SSO token for access token using On-Behalf-Of flow
    const oboResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          client_id: clientId,
          client_secret: clientSecret,
          assertion: token,
          scope: "https://graph.microsoft.com/.default",
          requested_token_use: "on_behalf_of",
        }),
      }
    );

    if (!oboResponse.ok) {
      const errorData = await oboResponse.text();
      console.error("OBO token exchange failed:", errorData);
      res.status(401).json({ error: "Token exchange failed" });
      return;
    }

    const oboData = await oboResponse.json() as { access_token: string };

    // Fetch user profile from Microsoft Graph
    const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${oboData.access_token}` },
    });

    if (!graphResponse.ok) {
      res.status(401).json({ error: "Failed to fetch user profile" });
      return;
    }

    const profile = await graphResponse.json() as {
      id: string;
      displayName: string;
      mail: string;
      userPrincipalName: string;
    };

    res.json({
      userId: profile.id,
      displayName: profile.displayName,
      email: profile.mail || profile.userPrincipalName,
      mode: "sso",
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * GET /api/auth/config — Return auth configuration for the client.
 */
authRouter.get("/config", (_req: Request, res: Response) => {
  const clientId = process.env.AAD_APP_CLIENT_ID;
  res.json({
    clientId: clientId || null,
    ssoEnabled: !!clientId,
    demoMode: !clientId,
  });
});
