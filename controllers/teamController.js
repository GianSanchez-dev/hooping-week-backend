const prisma = require('../prismaClient');

// 1. OBTENER MIS EQUIPOS
exports.getMyTeams = async (req, res) => {
  try {
    // En un futuro el ID vendrá del Token (req.user.id)
    // Por ahora lo recibimos por query string para probar rápido
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: 'Usuario no identificado' });

    const teams = await prisma.team.findMany({
      where: { coachId: parseInt(userId) },
      include: { 
        players: {
            orderBy: { number: 'asc' } // Ordenar jugadores por dorsal
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar equipos' });
  }
};

// 2. CREAR EQUIPO
exports.createTeam = async (req, res) => {
  try {
    const { name, category, sport, logo, banner, userId } = req.body;

    const newTeam = await prisma.team.create({
      data: {
        name,
        category,
        sport: sport || 'Voleibol',
        logo: logo || null,
        banner: banner || null,
        // Inicializamos stats en 0
        stats: { wins: 0, losses: 0, rank: '-' }, 
        coachId: parseInt(userId)
      },
      include: { players: true }
    });

    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
};

// 3. AGREGAR JUGADOR
exports.addPlayer = async (req, res) => {
  try {
    const { teamId } = req.params;
    // AHORA RECIBIMOS HEIGHT Y AGE
    const { name, number, position, image, height, age } = req.body;

    const newPlayer = await prisma.player.create({
      data: {
        name,
        number: parseInt(number),
        position,
        image: image || null,
        // GUARDAMOS EN EL JSONB
        stats: { 
            height: height || 'N/A', 
            age: age || 'N/A', 
            matches: 0 
        }, 
        teamId: parseInt(teamId)
      }
    });

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar jugador' });
  }
};

// 4. ELIMINAR JUGADOR
exports.deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.player.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar jugador' });
    }
};
