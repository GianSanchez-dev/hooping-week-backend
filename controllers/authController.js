const prisma = require('../prismaClient');

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // 2. Verificar si existe y si la contraseña coincide (Texto plano por ahora)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Éxito: Devolvemos el usuario (sin la contraseña por limpieza)
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// REGISTRO
exports.register = async (req, res) => {
  // AHORA RECIBIMOS 'avatar'
  const { fullName, email, password, avatar } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password, 
        // SI ENVÍAN AVATAR, LO USAMOS. SI NO, GENERAMOS UNO CON LAS INICIALES
        avatar: avatar || `https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff`
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
