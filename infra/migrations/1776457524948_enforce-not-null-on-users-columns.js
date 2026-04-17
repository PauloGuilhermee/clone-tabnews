exports.up = (pgm) => {
  pgm.alterColumn("users", "username", {
    notNull: true,
  });

  pgm.alterColumn("users", "email", {
    notNull: true,
  });

  pgm.alterColumn("users", "password", {
    notNull: true,
  });
};

exports.down = false;
