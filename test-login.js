import bcrypt from 'bcryptjs';

const phpHash = '$2y$10$B0fuRH7lB5VdwuZjYO5NguXOj5z3n/gQxWNUMduUF9nTMrwJDtE0W';
const password = 'test123';

console.log('Testing bcrypt compatibility...');
console.log('Hash:', phpHash);
console.log('Password:', password);

// Replace $2y$ with $2a$ for compatibility
const compatibleHash = phpHash.replace(/^\$2y\$/, '$2a$');
console.log('Compatible hash:', compatibleHash);

bcrypt.compare(password, compatibleHash).then(result => {
  console.log('Match result:', result);
}).catch(err => {
  console.error('Error:', err);
});
