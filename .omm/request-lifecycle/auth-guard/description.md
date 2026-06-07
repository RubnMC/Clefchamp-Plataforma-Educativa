Inline middleware functions isLoggedIn and isNotLoggedIn (defined per-router) that check res.locals.user and redirect to /users/login or / as appropriate. Applied per-route rather than globally.
