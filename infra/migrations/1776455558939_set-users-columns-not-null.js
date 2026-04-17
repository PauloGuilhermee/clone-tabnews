exports.up = (pgm) => {
  pgm.alterColumn("users", "username", {
    notNull: false,
  });

  pgm.alterColumn("users", "email", {
    notNull: false,
  });

  pgm.alterColumn("users", "password", {
    notNull: false,
  });
};

exports.down = false;
