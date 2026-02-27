import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

console.log('Generating password hash for:', password);

bcrypt.hash(password, 10).then(hash => {
  console.log('\nBcrypt hash (Node.js format $2a$):');
  console.log(hash);

  const phpHash = hash.replace(/^\$2a\$/, '$2y$');
  console.log('\nPHP-compatible hash ($2y$):');
  console.log(phpHash);

  console.log('\nSQL to update admin user:');
  console.log(`UPDATE admin_users SET password_hash = '${phpHash}' WHERE username = 'Portal@almajd.sa';`);
});
