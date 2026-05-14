const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://dulnimahara25_db_user:ZtpxnRdFWhFXXhZP@cluster0.jnurbrm.mongodb.net/Cre8tifyFYP?appName=Cluster0')
  .then(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@cre8tify.com' },
      { $set: { password: hashedPassword } }
    );
    console.log('Password reset successfully to Admin123!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
