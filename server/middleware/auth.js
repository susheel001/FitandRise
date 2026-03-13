const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token — please log in' });

  const token = header.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user)
      return res.status(401).json({ error: 'Token expired — please log in again' });

    req.user = {
      id:    user.id,
      email: user.email,
      name:  user.user_metadata?.name || '',
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};