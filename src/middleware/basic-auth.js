function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || ''

  let basicToken
  if (!authToken.toLowerCase().startsWith('basic')) {
    return res.status(401).json({ error: 'Missing basic token' })
  } else {
    basicToken = authToken.slice('basic'.length, authToken.length)
  }

  const [tokenUsername, tokenPassword] = Buffer
    .from(basicToken, 'base64')
    .toString()
    .split(':')

  if (!tokenUsername || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  req.app.get('db')('lodgelog_users')
    .where({ username: tokenUsername })
    .first()
    .then(user => {
      if(!user || user.password !== tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
      }
      next()
    })
    .catch(next)
}

module.exports = {
  requireAuth
}